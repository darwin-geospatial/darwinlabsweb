// ============================================================
// Darwin Geospatial — hero brush-reveal export
// Co-registered pair over ONE Alps tile (Monte Rosa massif):
//   1) Sentinel-2 true-color RGB      (base)
//   2) AlphaEarth Satellite Embedding (reveal)
// Same region + dimensions => pixel-aligned for the brush.
// Paste into https://code.earthengine.google.com and Run,
// then click the two printed URLs to download the JPGs.
// ============================================================

// --- 1. Region of interest — Monte Rosa (~45.937, 7.867) pushed toward
//        the NW corner; framing shifted east + south and zoomed out to
//        ~123 km x 80 km. [W, S, E, N] ---
var region = ee.Geometry.Rectangle([7.75, 45.30, 9.35, 46.02]);

var WIDTH = 3400;              // output width in px (height auto); getThumbURL
                              // caps at ~50 MB, so 4K (3840) overflows here.
var CRS   = 'EPSG:3857';

// --- 2. Sentinel-2 L1C true-color RGB (cloud-free summer median) ---
//        L1C = top-of-atmosphere; max raised to 5500 so alpine
//        snow/glacier doesn't clip in the brighter TOA reflectance.
var rgbViz = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterBounds(region)
  .filterDate('2023-06-01', '2023-09-15')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 8))
  .median()
  .visualize({ bands: ['B4','B3','B2'], min: 200, max: 5500 });

// --- 3. AlphaEarth Satellite Embedding (annual), false-color ---
//        64 axes A00..A63 — pick any 3 for R/G/B. Try different triples
//        if the palette looks muted (this scene should separate
//        snow / rock / forest / water strongly).
var aeViz = ee.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL')
  .filterBounds(region)
  .filterDate('2023-01-01', '2024-01-01')
  .mosaic()
  .visualize({ bands: ['A01','A16','A09'], min: -0.3, max: 0.3 });

// --- 4. Preview + download URLs (identical framing => aligned) ---
Map.centerObject(region, 9);
Map.addLayer(rgbViz, {}, 'RGB');
Map.addLayer(aeViz, {}, 'AlphaEarth');

var opts = { region: region, dimensions: WIDTH, format: 'jpg', crs: CRS };
print('1) RGB base  — click to download:', rgbViz.getThumbURL(opts));
print('2) AlphaEarth reveal — click to download:', aeViz.getThumbURL(opts));

// ------------------------------------------------------------
// After running: save the two downloads into assets/hero/ as
//   alps_rgb.jpg         (overwrite the current placeholder base)
//   alps_alphaearth.jpg  (new — the reveal layer)
// ------------------------------------------------------------
