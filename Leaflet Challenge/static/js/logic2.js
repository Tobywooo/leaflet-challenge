// Configuration object for earthquake data and API
const earthquakeConfig = {
    apiKey: "pk.eyJ1Ijoicm9zYXpodSIsImEiOiJja2ZvbTFvbzEyM2c1MnVwbTFjdmVycXk5In0.71jVP2vD8pBWO2bsKtI48Q",
    queryUrl: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
    tectonicPlatesUrl: "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
  };
  
  // Fetch earthquake data
  async function fetchEarthquakeData() {
    try {
      const response = await fetch(earthquakeConfig.queryUrl);
      const data = await response.json();
      console.log(data);
      createMapFeatures(data.features);
    } catch (error) {
      console.error("Error fetching earthquake data:", error);
    }
  }
  
  // Determine marker color by depth
  function chooseColor(depth) {
    return depth < 10 ? "#00FF00" :
           depth < 30 ? "greenyellow" :
           depth < 50 ? "yellow" :
           depth < 70 ? "orange" :
           depth < 90 ? "orangered" :
           "#FF0000";
  }
  
  // Create features on the map
  function createMapFeatures(earthquakeData) {
    // Bind popup information to each feature
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
  
    // Create a GeoJSON layer with styling and popups
    const earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature,
      pointToLayer: (feature, latlng) => {
        const markers = {
          radius: feature.properties.mag * 20000,
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          fillOpacity: 0.7,
          color: "black",
          weight: 0.5
        };
        return L.circle(latlng, markers);
      }
    });
  
    // Create layer for tectonic plates
    const tectonicPlates = new L.layerGroup();
  
    // Fetch tectonic plates data
    fetch(earthquakeConfig.tectonicPlatesUrl)
      .then(response => response.json())
      .then(plates => {
        console.log(plates);
        L.geoJSON(plates, {
          color: "red",
          weight: 5
        }).addTo(tectonicPlates);
      })
      .catch(error => console.error("Error fetching tectonic plates data:", error));
  
    // Create tile layers
    const satellite = L.tileLayer(`https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token=${earthquakeConfig.apiKey}`, {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      style: 'mapbox/satellite-v9'
    });
  
    const grayscale = L.tileLayer(`https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token=${earthquakeConfig.apiKey}`, {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      style: 'mapbox/light-v11'
    });
  
    const outdoors = L.tileLayer(`https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token=${earthquakeConfig.apiKey}`, {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      style: 'mapbox/outdoors-v12'
    });
  
    // Create baseMaps and overlayMaps objects
    const baseMaps = {
      "Satellite": satellite,
      "Grayscale": grayscale,
      "Outdoors": outdoors
    };
  
    const overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };
  
    // Create the map
    const myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [satellite, earthquakes, tectonicPlates]
    });
  
    // Add legend
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      const depth = [-10, 10, 30, 50, 70, 90];
  
      div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";
  
      for (let i = 0; i < depth.length; i++) {
        div.innerHTML +=
          `<i style="background:${chooseColor(depth[i] + 1)}"></i> ${depth[i]}${depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+'}`;
      }
      return div;
    };
    legend.addTo(myMap);
  
    // Create a layer control and add it to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  }
  
  // Call the fetchEarthquakeData function to start the process
  fetchEarthquakeData();
  