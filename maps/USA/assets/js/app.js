var map, featureList, polygonSearch = [], pointearch = [], museumSearch = [];

$(document).on("click", ".feature-row", function(e) {
  sidebarClick(parseInt($(this).attr("id"), 10));
});

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(polygon.getBounds());
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

function sidebarClick(id) {
  map.addLayer(pointLayer);
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

/* Basemap Layers */
var OSM_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
var OSM = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});


/* Overlay Layers */
var highlight = L.geoJson(null);

var polygon = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "#353732",
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
  disableClusteringAtZoom: 9
});
/* Empty layer placeholder to add to layer control for listening when to add/remove point to markerClusters layer */
var pointLayer = L.geoJson(null);
var point = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'assets/img/' + feature.properties.CLASS + '.png',
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var numwhite = feature.properties.WHITE / feature.properties.POP2000;
      var numblack = feature.properties.BLACK / feature.properties.POP2000;
      var numhisp = feature.properties.HISPANIC / feature.properties.POP2000;
      var nummale = feature.properties.MALES / feature.properties.POP2000;
      var numfemale = feature.properties.FEMALES / feature.properties.POP2000;
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Population (2000)</th><td>" + feature.properties.POP2000 + "</td></tr>" +
      "<tr><th>Population (2007)</th><td>" + feature.properties.POP2007 + "</td></tr>" +
      "<tr><th>Percent White</th><td>" + (numwhite.toFixed(2) * 100) + "%</td></tr>" +
      "<tr><th>Percent Black</th><td>" + (numblack.toFixed(2) * 100) + "%</td></tr>" +
      "<tr><th>Percent Hispanic</th><td>" + (numhisp.toFixed(2) * 100) + "%</td></tr>" +
      "<tr><th>Percent Male</th><td>" + (nummale.toFixed(2) * 100) + "%</td></tr>" +
      "<tr><th>Percent Female</th><td>" + (numfemale.toFixed(2) * 100) + "%</td></tr>" +"<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            stroke: false,
            fillColor: "#00FFFF",
            fillOpacity: 0.7,
            radius: 10
          }));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="'+L.stamp(layer)+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/'+ feature.properties.CLASS + '.png"></td><td class="feature-name">'+layer.feature.properties.NAME+'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      pointearch.push({
        name: layer.feature.properties.NAME,
        CLASS_ATTR: layer.feature.properties.ST,
        source: "point",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/cities.geojson", function (data) {
  point.addData(data);
  map.addLayer(pointLayer);
});
map = L.map("map", {
  zoom: 4,
  center: [52.214, -122.607],
  layers: [OSM, polygon, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === pointLayer) {
    markerClusters.addLayer(point);
  }

});

map.on("overlayremove", function(e) {
  if (e.layer === pointLayer) {
    markerClusters.removeLayer(point);
  }

});

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

  "OSM": OSM
};

var groupedOverlays = {
  "POI": {
    "<img src='assets/img/modern11.png' width='24' height='28'>&nbsp;Cities and Towns": pointLayer

  },
  "Reference": {
    "<img src='assets/img/us.png' width='24' height='28'>&nbsp;States": polygon
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

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
  polygonBH.initialize();
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
      header: "<h4 class='typeahead-header'><img src='assets/img/modern11.png' width='24' height='28'>&nbsp;Cities and Towns</h4>",
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
    if (datum.source === "point") {
      if (!map.hasLayer(pointLayer)) {
        map.addLayer(pointLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
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
