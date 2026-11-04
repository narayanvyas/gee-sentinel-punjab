# GEE Sentinel Punjab

A Google Earth Engine (Code Editor) script that builds March median composites of **Sentinel-2 SR** and **Sentinel-1 GRD (VV)** imagery over Punjab for 2018–2026 and exports them to Google Drive as 10 m GeoTIFFs.

## What it does

For each year in `YEARS`, the script covers 1 March – 31 March and:

| Sensor | Collection | Processing | Output bands |
|---|---|---|---|
| Sentinel-2 | `COPERNICUS/S2_SR_HARMONIZED` | Scene cloud cover < 20 %, QA60 cloud + cirrus mask, median composite | B2, B3, B4, B8, B8A, B11, B12 |
| Sentinel-1 | `COPERNICUS/S1_GRD` | IW mode, VV polarisation, ascending pass, median composite | VV |

Both composites are clipped to the Punjab boundary, added to the map for inspection, and queued as export tasks.

## Usage

1. Open the [GEE Code Editor](https://code.earthengine.google.com/).
2. Upload a Punjab boundary shapefile as an Earth Engine asset (or use an existing one).
3. Paste [`punjab_sentinel_export.js`](punjab_sentinel_export.js) into a new script.
4. Set `assetID` to your own asset path:
   ```js
   var assetID = 'projects/<your-project>/assets/Punjab';
   ```
5. Click **Run**, open the **Tasks** tab, and click **Run** on each export task.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `YEARS` | `[2018 … 2026]` | Years to process |
| `ROOT` | `Punjab_Exports` | Top-level Drive folder |
| `assetID` | `projects/ee-narayanvyas/assets/Punjab` | Study-area FeatureCollection |

To change the month, edit `start` / `endExclusive` and `monthFolder` inside the `YEARS.forEach` loop. To change the cloud threshold, edit the `CLOUDY_PIXEL_PERCENTAGE` filter.

## Output

Exports use scale 10 m, CRS `EPSG:4326`, GeoTIFF format. Files land in Google Drive as:

```
Punjab_Exports/
└── March_<year>/
    ├── Sentinel-2/Punjab_S2_Median_March_<year>.tif
    └── Sentinel-1/Punjab_S1_VV_Median_March_<year>.tif
```

Up to 18 export tasks are created (2 per year). A Sentinel-1 task is only created if VV data exists for that year (e.g. none are produced if no ascending IW scenes are available).

## Notes

- The Sentinel-2 composite for 2026 depends on data available at run time.
- Sentinel-1 VV values are in dB (display range −15 to 0).
- Exports at 10 m over a whole state are large; make sure you have sufficient Drive storage.

## License

[MIT](LICENSE)
