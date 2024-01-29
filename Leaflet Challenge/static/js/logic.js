const API_KEY = "pk.eyJ1Ijoicm9zYXpodSIsImEiOiJja2ZvbTFvbzEyM2c1MnVwbTFjdmVycXk5In0.71jVP2vD8pBWO2bsKtI48Q";
const QUERY_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch earthquake data
fetch(QUERY_URL)
  .then(response => response.json())
  .then(data => createFeatures(data.features));

// Function to determine marker size based on magnitude
const markerSize = magnitude => magnitude * 2000;

// Function to choose color based on depth
const chooseColor = depth => {
  return depth > 90 ? "red" :
         depth > 70 ? "orangered" :
         depth > 50 ? "orange" :
         depth > 30 ? "gold" :
         depth > 10 ? "yellow" :
         "green";
};

// Function to create features on the map
const createFeatures = earthquakeData => {
  // Function to bind popup information to each feature
  const onEachFeature = (feature, layer) => {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  };

  // Create a GeoJSON layer with styling and popups
  const earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature,
    pointToLayer: (feature, latlng) => {
      const markers = {
        radius: markerSize(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.10,
        color: "black",
        stroke: true,
        weight: 0.5
      };
      return L.circle(latlng, markers);
    }
  });

  // Send the earthquakes layer to the createMap function
  createMap(earthquakes);
};

// Function to create the map
const createMap = earthquakes => {
  // Define a grayscale map layer
  const grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style: 'mapbox/light-v11',
    access_token: API_KEY
  });

  // Create a baseMaps object
  const baseMaps = {
    "Grayscale Map": grayscale
  };

  // Create an overlay object to hold the earthquake layer
  const overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map, giving it the grayscale and earthquake layers to display on load
  const myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 10,
    layers: [grayscale, earthquakes]
  });

  // Add legend
  const legend = L.control({ position: "bottomright" });
  legend.onAdd = () => {
    const div = L.DomUtil.create("div", "info legend");
    const depth = [-10, 10, 30, 50, 70, 90];

    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";

    for (let i = 0; i < depth.length; i++) {
      div.innerHTML +=
        '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);

  // Create a layer control and add it to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
};
