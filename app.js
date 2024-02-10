// Initialize the map
let map;
async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: 28.535, lng: 77.391 },
        zoom: 8,
    });

    // Create an array to store job locations
    const jobLocations = [];
    var technicianLocation = null;
    // Add a marker for each job location
    function addJobLocation(placeName) {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address: placeName }, function (results, status) {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                const marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: 'Job Location: ' + placeName,
                });
                jobLocations.push(marker.getPosition());
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    // Add technician location marker
    function addTechnicianLocation(placeName) {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address: placeName }, function (results, status) {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                const marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: 'Technician Location: ' + placeName,
                });
                technicianLocation = marker.getPosition();
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    // Handle user input for job locations
    document.getElementById('addJobLocationBtn').addEventListener('click', function () {
        const jobLocationInput = document.getElementById('jobLocationInput').value;
        addJobLocation(jobLocationInput);
        clearInputFields();
    });

    // Handle user input for technician location
    document.getElementById('addTechnicianLocationBtn').addEventListener('click', function () {
        const technicianLocationInput = document.getElementById('technicianLocationInput').value;
        addTechnicianLocation(technicianLocationInput);
        clearInputFields();
    });

    // Calculate and display the shortest route
    document.getElementById('calculateRouteBtn').addEventListener('click', function () {
        const waypoints = [ technicianLocation ,...jobLocations];

        // Create a DirectionsService and a DirectionsRenderer
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
        });

        // Create a request object for the DirectionsService
        const request = {
            origin: waypoints.shift(),
            destination: waypoints.pop(),
            waypoints: waypoints.map(location => ({ location, stopover: true })),
            travelMode: google.maps.TravelMode.DRIVING,
        };

        // Make the DirectionsService request
        directionsService.route(request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                // Display the route on the map
                directionsRenderer.setDirections(result);
    
                // Draw arrows along each step of the route
                const route = result.routes[0];
                for (let i = 0; i < route.legs.length; i++) {
                    const steps = route.legs[i].steps;
                    for (let j = 0; j < steps.length; j++) {
                        const step = steps[j];
                        const path = google.maps.geometry.encoding.decodePath(step.polyline.points);
                        drawArrows(path, map);
                    }
                }
    
                // Update the map bounds to fit the entire route
                const bounds = new google.maps.LatLngBounds();
                result.routes[0].legs.forEach(leg => {
                    leg.steps.forEach(step => {
                        bounds.extend(step.start_location);
                        bounds.extend(step.end_location);
                    });
                });
                map.fitBounds(bounds);
            } else {
                alert('Error calculating the route. Please try again.');
            }
        });
    });
    
    // Function to draw arrows along a path
    function drawArrows(path, map) {
        for (let i = 0; i < path.length - 1; i++) {
            const heading = google.maps.geometry.spherical.computeHeading(path[i], path[i + 1]);
            const arrowSymbol = {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 0.5,
                rotation: heading,
            };
    
            const arrow = new google.maps.Marker({
                position: path[i],
                icon: arrowSymbol,
                map: map,
            });
        }
    }
    function clearInputFields() {
        document.getElementById('jobLocationInput').value = '';
        document.getElementById('technicianLocationInput').value = '';
    }

}
initMap();