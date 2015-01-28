var geolocation = new ol.Geolocation({
  tracking: true
});
geolocation.bindTo('projection', map.getView());

geolocation.on('change', function(evt) {
  //save position and set map center
  var pos = geolocation.getPosition();
  map.getView().setCenter(pos);

  var iconFeature = new ol.Feature({
    geometry: new ol.geom.Point(pos)
  });
  var vectorSource = new ol.source.Vector({
    features: [iconFeature]
  });
  var vectorLayer = new ol.layer.Vector({
    source: vectorSource
  });
  var iconStyle = new ol.style.Style({
    image: new ol.style.Icon(({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'data/icon.png'
    }))
  });


  //jquery button to bring it up



  $( "#geolocate" ).click(function() {

    map.getView().setCenter(geolocation.getPosition());
    map.addLayer(vectorLayer);

  });
