
var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }

    this.post = function(aUrl, body, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open( "POST", aUrl, true );
        anHttpRequest.send( body );
    }
}

$rootScope = {
    drawMap: (markers, mainpin = undefined) => {
        const lat = mainpin === undefined ? markers[0].lat : mainpin.lat;
        const lon = mainpin === undefined ? markers[0].lon : mainpin.lon;
        var mymap = L.map('mapid').setView([lat, lon], 15);

        var minLat = lat, maxLat=lat, minLong=lon, maxLong=lon;
        for( const mark of markers ){
            if( mark.lat < minLat) minLat = mark.lat;
            if( mark.lat > maxLat) maxLat = mark.lat;
            if( mark.lon < minLon) minLon = mark.lon;
            if( mark.lon > maxLon) maxLon = mark.lon;
        }
        mymap.fitBounds([minLat,minLon], [maxLat,maxLon]);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);
        for( const mark of markers) {
            let marker;
            if ($rootScope.roles.includes("operator")) {
                marker = L.marker([mark.lat, mark.lon], {draggable: true});
                marker.on('dragend', function (event) {
                    var m = event.target;
                    var position = m.getLatLng();
                    m.setLatLng(new L.LatLng(position.lat, position.lng), {draggable: 'true'});
                    mymap.panTo(new L.LatLng(position.lat, position.lng));
                    let loc = {
                        site: mark.site,
                        lat: position.lat,
                        lon: position.lon,
                    }
                    new HttpClient().post("https://central.link2web.se/sites", JSON.stringify(loc), (resp) => {
                        console.log("Updated location.", resp);
                    });
                });
            } else {
                marker = L.marker([lat, lon], {draggable: false});
            }
            marker.addTo(mymap);
        }
    },
    refresh: () => {
        let httpClient = new HttpClient();
        httpClient.get("https://central.link2web.se/sites", (response) =>{
            let markers = response.data.markers;
            $rootScope.drawMap(markers);
        });
    }
}
$rootScope.refresh();