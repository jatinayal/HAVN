mapboxgl.accessToken = mapToken;

let coordinates = Listing.geometry?.coordinates;

if (!coordinates || coordinates.length !== 2) {
    console.warn("Invalid or missing coordinates. Using default Delhi location.");
    coordinates = [77.209, 28.6139]; // fallback to Delhi
}

const map = new mapboxgl.Map({
    container: 'map',
    style: "mapbox://styles/mapbox/standard-satellite",
    center: coordinates,
    zoom: 9
});

new mapboxgl.Marker({ color: "#fe424d" })
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h4>${Listing.title}</h4><p>Exact location will be shown after booking</p>`
        )
    )
    .addTo(map);
