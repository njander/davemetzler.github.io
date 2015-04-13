var map, featureList, polygonSearch = [], pointearch = [], museumSearch = [];


$(document).on("click", ".feature-row", function(e) {
  sidebarClick(parseInt($(this).attr("id"), 10));
});
function ajax(url, callback) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState !== 4) {
      return;
    }
    if (!req.status || req.status < 200 || req.status > 299) {
      return;
    }

    callback(JSON.parse(req.responseText));
  };
  req.open('GET', url);
  req.send(null);
}

function formatJSON(json) {
  var html = '';
  for (var key in json) {
    html += '<em>'+ key +'</em> '+ json[key] +'<br>';
  }
  return html;
}



$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(point.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});
$("#list-btn-right").click(function() {
  $('#sidebarRight').toggle();
  map.invalidateSize();
  return false;
});
$("#bottom-btn-right").click(function() {
  $('#footer').toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});
$("#sidebarRight-hide-btn").click(function() {
  $('#sidebarRight').hide();
  map.invalidateSize();
});
$("#bottom-hide-btn").click(function() {
  $('#footer').hide();
  map.invalidateSize();
});


// function sidebarClick(id) {
//   map.addLayer(pointLayer);
//   var layer = markerClusters.getLayer(id);
//   map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 14);
//   layer.fire("click");
//   /* Hide sidebar and go to the map on small screens */
//   if (document.body.clientWidth <= 767) {
//     $("#sidebar").hide();
//     map.invalidateSize();
//   }
// }
var ggl = new L.Google();
/* Basemap Layers */
var OSM_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
var OSM = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
var image = L.tileLayer.wms("http://gis.halker.com:8080/geoserver/sandbox/wms", {
  layers: 'sandbox:sheet3',
  format: 'image/png',
  version: '1.1.0',
  transparent: true,
  attribution: "",
  tiled:true
});
var image11 = L.tileLayer.wms("http://gis.halker.com:8080/geoserver/sandbox/wms", {
  layers: 'sandbox:sheet11',
  format: 'image/png',
  version: '1.1.0',
  transparent: true,
  attribution: "",
  tiled:true
});
var image2 = L.tileLayer.wms("http://gis.halker.com:8080/geoserver/sandbox/wms", {
  layers: 'sandbox:sheet2',
  format: 'image/png',
  version: '1.1.0',
  transparent: true,
  attribution: "",
  tiled:true
});

/* Overlay Layers */
var highlight = L.geoJson(null);

var polygon = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "#000000",
      fill: false,
      opacity: 1,
      clickable: false
    };
  },
  onEachFeature: function (feature, layer) {
    polygonSearch.push({
      name: layer.feature.properties.STATE_NAME,
      source: "Polygon",
      id: L.stamp(layer),
      bounds: layer.getBounds()
    });
  }
});
$.getJSON("data/states.geojson", function (data) {
  polygon.addData(data);
});
/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 8
});
/* Empty layer placeholder to add to layer control for listening when to add/remove point to markerClusters layer */
// var pointLayer = L.geoJson(null);
// var point = L.geoJson(null, {
//   pointToLayer: function (feature, latlng) {
//     return L.circleMarker(latlng, {
//
//         radius: 8,
//         fillColor: "#f9eb53",
//         color: "#a42d2d",
//         weight: 2,
//         fillOpacity: 1,
//
//
//       title: feature.properties.attrib_3,
//       riseOnHover: true
//     });
//   },
//   onEachFeature: function (feature, layer) {
//     if (feature.properties) {
//
//       var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>API</th><td>" + feature.properties.attrib_1 + "</td></tr>" +
//       "<tr><th>Spud Date</th><td>" + feature.properties.spud_date + "</td></tr>" + "<tr><th>Opertator</th><td>" + feature.properties.attrib_2 + "</td></tr>" +
//       "<table>"
//       ;
//       layer.on({
//         click: function (e) {
//           $("#feature-title2").html(feature.properties.attrib_3);
//           $("#feature-info2").html(content);
//
//           // this will show info in a new window$("#featureModal").modal("show");
//           highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
//             stroke: false,
//             fillColor: "#ff00d1",
//             fillOpacity: 0.7,
//             radius: 10
//           }));
//
//           c3.generate({
//             data: {
//               // iris data from R
//               columns: [
//               ['Gas Sales (MCF)', feature.properties.gassale],
//               ['Oil Sales (Barrels)', feature.properties.oilsales],
//
//               ],
//               type : 'bar'
//             }
//           });
//           c3.generate({
//             bindto: document.getElementById('demo'),
//             data: {
//               columns: [
//               ['Gas Production', feature.properties.gasprod],
//               ['Oil Production', feature.properties.oilprod],
//               ['Water Production', feature.properties.waterprod],
//
//
//               ],
//               type : 'donut'
//             },
//             donut: {
//             }
//           });
//
//
//         }
//       });
//       $("#feature-list tbody").append('<tr class="feature-row" id="'+L.stamp(layer)+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/well.png"></td><td class="feature-name">'+layer.feature.properties.attrib_3 +'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
//       pointearch.push({
//         name: layer.feature.properties.attrib_3,
//         CLASS_ATTR: layer.feature.properties.attrib_1,
//         source: "point",
//         id: L.stamp(layer),
//         lat: layer.feature.geometry.coordinates[1],
//         lng: layer.feature.geometry.coordinates[0]
//       });
//     }
//   }
// });
// $.getJSON("data/wells.geojson", function (data) {
//   point.addData(data);
//   map.addLayer(pointLayer);
// });

map = L.map("map", {
  zoom: 16,
  minZoom: 15,
  center: [39.74652, -104.999063],
  layers: [image, image11, image2],
  zoomControl: false,
  attributionControl: false
});

var osmb = new OSMBuildings(map).load();
osmb.style({ shadows:true });
var popup;
osmb.click(function(e) {
  popup = L.popup()
  .setLatLng(L.latLng(e.lat, e.lon))
  .setContent('<b>OSM ID '+ e.feature +'</b>')
  .openOn(map);

  var url = 'http://data.osmbuildings.org/0.2/rkc8ywdl/feature/'+ e.feature +'.json';
  ajax(url, function(json) {
    var content = '<b>OSM ID '+ e.feature +'</b>';
    for (var i = 0; i < json.features.length; i++) {

      content += '<br>'+ formatJSON(json.features[i].properties.tags);
    }
    popup.setContent(content).openOn(map);
  });
});

new L.HistoryControl({
  position: 'bottomright',
  backText: 'Back  .',
  backImage: 'glyphicon glyphicon-chevron-left',
  forwardText: 'Forward',
  forwardImage: 'glyphicon glyphicon-chevron-right'

}).addTo(map);


/* Layer control listeners that allow for a single markerClusters layer */
// map.on("overlayadd", function(e) {
//   if (e.layer === pointLayer) {
//     markerClusters.addLayer(point);
//   }
//
// });
//
// map.on("overlayremove", function(e) {
//   if (e.layer === pointLayer) {
//     markerClusters.removeLayer(point);
//   }
//
// });

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});



var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Google Aerial Imagery": ggl,

  "OSM": OSM,

};

var groupedOverlays = {
  "POI": {

    "buildings" : osmb

  },
  "Reference": {
    "1903- 1": image,
    "1903- 2": image2,
    "1903- 3": image11,

  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

//Routing

function button(label, container) {
  var btn = L.DomUtil.create('button', 'routebutton', container);
  btn.setAttribute('type', 'button');
  btn.innerHTML = label;
  return btn;
}

var control = L.Routing.control({
  routeWhileDragging: true,
  plan: new (L.Routing.Plan.extend({
    createGeocoders: function() {
      var container = L.Routing.Plan.prototype.createGeocoders.call(this),
      reverseButton = button('&#8593;&#8595;', container);

      L.DomEvent.on(reverseButton, 'click', function() {
        var waypoints = this.getWaypoints();
        this.setWaypoints(waypoints.reverse());
      }, this);

      return container;
    }
  }))([

    ], {

      routeWhileDragging: true
    })
  });





/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  /* Fit map to boroughs bounds */
  //map.fitBounds(polygon.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var polygonBH = new Bloodhound({
    name: "Polygon",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: polygonSearch,
    limit: 10
  });

  var pointBH = new Bloodhound({
    name: "point",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: pointearch,
    limit: 10
  });


  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  //polygonBH.initialize();
  pointBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Polygon",
    displayKey: "name",
    source: polygonBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/us.png' width='24' height='28'>&nbsp;States</h4>"
    }
  }, {
    name: "point",
    displayKey: "name",
    source: pointBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/well.png' width='24' height='28'>&nbsp;Wells</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{CLASS_ATTR}}</small>"].join(""))
    }
  },  {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Polygon") {
      map.fitBounds(datum.bounds);
    }
    // if (datum.source === "point") {
    //   if (!map.hasLayer(pointLayer)) {
    //     map.addLayer(pointLayer);
    //   }
    //   map.setView([datum.lat, datum.lng], 14);
    //   if (map._layers[datum.id]) {
    //     map._layers[datum.id].fire("click");
    //   }
    // }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});
$("#route-btn").click(function(event) {
  event.preventDefault();
  $('.leaflet-routing-container').is(':visible') ? control.removeFrom(map) : control.addTo(map);






  map.on('click', function(e) {
    var container = L.DomUtil.create('div'),

    startBtn = button('Start from this location', container),
    destBtn = button('Go to this location', container);

    L.DomEvent.on(startBtn, 'click', function() {
      control.spliceWaypoints(0, 1, e.latlng);
      map.closePopup();
    });

    L.DomEvent.on(destBtn, 'click', function() {
      control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
      map.closePopup();
    });

    L.popup()
    .setContent(container)
    .setLatLng(e.latlng)
    .openOn(map);

  });


});
