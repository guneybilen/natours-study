/* eslint-disable */
//style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZ3VuZXliaWxlbiIsImEiOiJjazEwdmxyc2cwYTNpM25vaWF4bXVya2NuIn0.sKn-U-bzqcAVACu_AIEr1A';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/guneybilen/ck13bemvk0vt61cp8es6sdu9i',
    scrollZoom: true
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
