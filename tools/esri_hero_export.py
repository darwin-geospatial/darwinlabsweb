#!/usr/bin/env python3
# ============================================================
# Darwin Geospatial — hero RGB base from Esri World Imagery
# Stitches Esri World Imagery XYZ tiles over the EXACT same
# bbox + pixel width as tools/gee_hero_export.js, so the result
# stays pixel-aligned (EPSG:3857) with the AlphaEarth reveal.
#
#   deps:  pip install requests pillow
#   run:   python tools/esri_hero_export.py
#   out:   assets/hero/alps_rgb.jpg
# ============================================================

import math
import os
import time

import requests
from PIL import Image

# --- Must match tools/gee_hero_export.js ---
W, S, E, N = 7.75, 45.30, 9.35, 46.02   # [W, S, E, N] lon/lat
WIDTH = 3400                            # output width in px (height auto)
ZOOM = 12                               # tile zoom; z12 ~38 m/px, oversamples
                                        # the 3400px target then downsizes crisp
DARK = (0x1b, 0x37, 0x3f)               # Darwin dark teal #1b373f (not black)
DARKEN = 0.30                           # 0 = untouched, 1 = solid dark teal
OUT = os.path.join(
    os.path.dirname(__file__), "..", "assets", "hero", "alps_rgb.jpg"
)

TILE = 256
ORIGIN = 2 * math.pi * 6378137 / 2      # 20037508.342789244
TILE_URL = (
    "https://server.arcgisonline.com/ArcGIS/rest/services/"
    "World_Imagery/MapServer/tile/{z}/{y}/{x}"
)


def lonlat_to_m(lon, lat):
    mx = lon * ORIGIN / 180.0
    my = math.log(math.tan((90 + lat) * math.pi / 360.0)) / (math.pi / 180.0)
    return mx, my * ORIGIN / 180.0


def m_to_px(mx, my, zoom):
    res = 2 * ORIGIN / (TILE * 2 ** zoom)   # m/px
    return (mx + ORIGIN) / res, (ORIGIN - my) / res   # py counts down from top


def fetch_tile(session, z, x, y):
    url = TILE_URL.format(z=z, x=x, y=y)
    for attempt in range(4):
        r = session.get(url, timeout=30)
        if r.status_code == 200 and r.content:
            from io import BytesIO
            return Image.open(BytesIO(r.content)).convert("RGB")
        time.sleep(0.5 * (attempt + 1))
    raise RuntimeError(f"failed z{z} x{x} y{y}: HTTP {r.status_code}")


def main():
    mx_min, my_min = lonlat_to_m(W, S)      # SW
    mx_max, my_max = lonlat_to_m(E, N)      # NE

    px_min, _ = m_to_px(mx_min, my_min, ZOOM)
    px_max, _ = m_to_px(mx_max, my_max, ZOOM)
    _, py_top = m_to_px(mx_max, my_max, ZOOM)   # north edge -> smaller py
    _, py_bot = m_to_px(mx_min, my_min, ZOOM)   # south edge -> larger py

    tx0, tx1 = int(px_min // TILE), int(px_max // TILE)
    ty0, ty1 = int(py_top // TILE), int(py_bot // TILE)
    ntiles = (tx1 - tx0 + 1) * (ty1 - ty0 + 1)
    print(f"zoom {ZOOM}: {tx1 - tx0 + 1} x {ty1 - ty0 + 1} = {ntiles} tiles")

    mosaic = Image.new("RGB", ((tx1 - tx0 + 1) * TILE, (ty1 - ty0 + 1) * TILE))
    session = requests.Session()
    session.headers["User-Agent"] = "darwin-geospatial-hero/1.0"

    done = 0
    for ty in range(ty0, ty1 + 1):
        for tx in range(tx0, tx1 + 1):
            tile = fetch_tile(session, ZOOM, tx, ty)
            mosaic.paste(tile, ((tx - tx0) * TILE, (ty - ty0) * TILE))
            done += 1
            if done % 25 == 0 or done == ntiles:
                print(f"  {done}/{ntiles}")

    # crop the exact bbox window out of the tile mosaic
    left = px_min - tx0 * TILE
    right = px_max - tx0 * TILE
    top = py_top - ty0 * TILE
    bottom = py_bot - ty0 * TILE
    crop = mosaic.crop((round(left), round(top), round(right), round(bottom)))

    height = round(WIDTH * crop.height / crop.width)
    out = crop.resize((WIDTH, height), Image.LANCZOS)

    # tinted darken: blend toward Darwin dark teal (not pure black)
    if DARKEN > 0:
        tint = Image.new("RGB", out.size, DARK)
        out = Image.blend(out, tint, DARKEN)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    out.save(OUT, "JPEG", quality=92)
    print(f"saved {OUT}  ({WIDTH} x {height})")


if __name__ == "__main__":
    main()
