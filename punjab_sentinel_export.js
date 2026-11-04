var YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
var ROOT = 'Punjab_Exports';

var assetID = 'projects/ee-narayanvyas/assets/Punjab';
var punjab = ee.FeatureCollection(assetID).geometry();

Map.centerObject(punjab,7);
Map.addLayer(ee.FeatureCollection([punjab]).style({color:'red',width:2}),{},'Punjab');

function maskS2(image){
  var qa=image.select('QA60');
  var cloud=qa.bitwiseAnd(1<<10).eq(0);
  var cirrus=qa.bitwiseAnd(1<<11).eq(0);
  return image.updateMask(cloud.and(cirrus));
}

function loadSentinel1Median(dateRange,roi){
  var col=ee.ImageCollection('COPERNICUS/S1_GRD')
    .filterDate(dateRange.start,dateRange.end)
    .filterBounds(roi)
    .filter(ee.Filter.eq('instrumentMode','IW'))
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation','VV'))
    .filter(ee.Filter.eq('orbitProperties_pass','DESCENDING'));
  return col.median().clip(roi);
}

function exportToDrive(image,folder,prefix,region){
  Export.image.toDrive({
    image:image,
    description:prefix,
    folder:folder,
    fileNamePrefix:prefix,
    region:region,
    scale:10,
    crs:'EPSG:4326',
    fileFormat:'GeoTIFF',
    maxPixels:1e13
  });
}

YEARS.forEach(function(year){
  var start = year + '-03-01';
  var endExclusive = year + '-04-01';
  var monthFolder = 'March_' + year;
  var s2Folder = ROOT + '/' + monthFolder + '/Sentinel-2';
  var s1Folder = ROOT + '/' + monthFolder + '/Sentinel-1';

  var s2col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(punjab)
    .filterDate(start,endExclusive)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .map(maskS2)
    .select(['B2','B3','B4','B8','B8A','B11','B12']);

  var s2Median = s2col.median().clip(punjab);
  Map.addLayer(s2Median, {bands:['B4','B3','B2'], min:0, max:3000}, 'S2_Median_March_' + year);
  exportToDrive(s2Median, s2Folder, 'Punjab_S2_Median_March_' + year, punjab);

  var s1Median = loadSentinel1Median({start:start, end:endExclusive}, punjab);
  var s1Bands = s1Median.bandNames();
  s1Bands.evaluate(function(b){
    if (b && b.indexOf('VV') !== -1) {
      var s1Img = s1Median.select('VV').clip(punjab);
      Map.addLayer(s1Img, {min:-15, max:0}, 'S1_VV_Median_March_' + year);
      exportToDrive(s1Img, s1Folder, 'Punjab_S1_VV_Median_March_' + year, punjab);
    }
  });
});
