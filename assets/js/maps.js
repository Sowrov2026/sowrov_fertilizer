/**
 * SF Maps Module
 * Client-side ES module for location services
 * Uses Leaflet.js with OpenStreetMap tiles
 */

const DEALERS = [
    {
        id: 1,
        name: 'সোরভ ফার্টিলাইজার মূল শাখা',
        district: 'কক্সবাজার',
        address: 'কক্সবাজার সদর, চট্টগ্রাম বিভাগ',
        phone: '01829775552',
        lat: 21.5839,
        lon: 92.0168,
        type: 'main'
    },
    {
        id: 2,
        name: 'সোরভ ডিলার - চট্টগ্রাম',
        district: 'চট্টগ্রাম',
        address: 'চট্টগ্রাম শহর, চট্টগ্রাম বিভাগ',
        phone: '01829775553',
        lat: 22.3569,
        lon: 91.7832,
        type: 'dealer'
    },
    {
        id: 3,
        name: 'সোরভ ডিলার - ঢাকা',
        district: 'ঢাকা',
        address: 'ঢাকা মেডিকেল, ঢাকা বিভাগ',
        phone: '01829775554',
        lat: 23.8103,
        lon: 90.4125,
        type: 'dealer'
    },
    {
        id: 4,
        name: 'সোরভ ডিলার - রাজশাহী',
        district: 'রাজশাহী',
        address: 'রাজশাহী শহর, রাজশাহী বিভাগ',
        phone: '01829775555',
        lat: 24.3636,
        lon: 88.6241,
        type: 'dealer'
    },
    {
        id: 5,
        name: 'সোরভ ডিলার - খুলনা',
        district: 'খুলনা',
        address: 'খুলনা শহর, খুলনা বিভাগ',
        phone: '01829775556',
        lat: 22.8456,
        lon: 89.5403,
        type: 'dealer'
    }
];

const SHOPS = [
    {
        id: 101,
        name: 'কৃষি সার ও বীজ দোকান - কক্সবাজার',
        district: 'কক্সবাজার',
        address: 'কক্সবাজার বাজার',
        phone: '01829775560',
        lat: 21.5920,
        lon: 92.0150,
        type: 'shop'
    },
    {
        id: 102,
        name: 'কৃষি সার ও বীজ দোকান - চট্টগ্রাম',
        district: 'চট্টগ্রাম',
        address: 'চট্টগ্রাম বাজার',
        phone: '01829775561',
        lat: 22.3580,
        lon: 91.7850,
        type: 'shop'
    },
    {
        id: 103,
        name: 'কৃষি সার ও বীজ দোকান - ঢাকা',
        district: 'ঢাকা',
        address: 'ঢাকা কৃষি বাজার',
        phone: '01829775562',
        lat: 23.8080,
        lon: 90.4100,
        type: 'shop'
    }
];

const DEFAULT_MAP_OPTIONS = {
    center: [23.6850, 90.3563],
    zoom: 7,
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
};

let leafletLoaded = false;

function loadLeaflet(callback) {
    if (leafletLoaded && window.L) {
        callback();
        return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = function () {
        leafletLoaded = true;
        callback();
    };
    document.head.appendChild(script);
}

function createIcon(color) {
    const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
    return L.icon({
        iconUrl: iconUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function createPopupContent(item) {
    return `
        <div style="min-width: 200px; font-family: sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1a5632; font-size: 14px;">${item.name}</h3>
            <p style="margin: 4px 0; color: #333; font-size: 12px;">
                <strong>জেলা:</strong> ${item.district}
            </p>
            <p style="margin: 4px 0; color: #333; font-size: 12px;">
                <strong>ঠিকানা:</strong> ${item.address}
            </p>
            <p style="margin: 4px 0; color: #333; font-size: 12px;">
                <strong>ফোন:</strong> ${item.phone}
            </p>
            <div style="margin-top: 10px;">
                <a href="tel:${item.phone}"
                   style="background: #22c55e; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 12px; margin-right: 5px;">
                   কল করুন
                </a>
                <a href="https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lon}#map=14/${item.lat}/${item.lon}"
                   target="_blank"
                   style="background: #3b82f6; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;">
                   মানচিত্রে দেখুন
                </a>
            </div>
        </div>
    `;
}

export const SFMaps = {
    map: null,
    markers: [],
    currentLocation: null,

    init: function (options = {}) {
        const config = Object.assign({}, DEFAULT_MAP_OPTIONS, options);
        loadLeaflet(function () {
            this.map = L.map(options.containerId || 'map', {
                center: config.center,
                zoom: config.zoom,
                zoomControl: true
            });
            L.tileLayer(config.tileUrl, {
                attribution: config.attribution
            }).addTo(this.map);
        }.bind(this));
    },

    getCurrentLocation: function () {
        return new Promise(function (resolve, reject) {
            if (!navigator.geolocation) {
                reject(new Error('জিওলোকেশন সাপোর্ট করে না'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                function (position) {
                    this.currentLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    resolve(this.currentLocation);
                }.bind(this),
                function (error) {
                    reject(new Error('অবস্থান নির্ণয় করা যায়নি: ' + error.message));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        }.bind(this));
    },

    searchNearbyDealers: function (lat, lon, radius) {
        const r = radius || 50;
        return new Promise(function (resolve) {
            const results = DEALERS.filter(function (dealer) {
                const distance = calculateDistance(lat, lon, dealer.lat, dealer.lon);
                dealer.distance = Math.round(distance * 100) / 100;
                return distance <= r;
            });
            results.sort(function (a, b) {
                return a.distance - b.distance;
            });
            resolve(results);
        });
    },

    searchNearbyShops: function (lat, lon, radius) {
        const r = radius || 50;
        return new Promise(function (resolve) {
            const results = SHOPS.filter(function (shop) {
                const distance = calculateDistance(lat, lon, shop.lat, shop.lon);
                shop.distance = Math.round(distance * 100) / 100;
                return distance <= r;
            });
            results.sort(function (a, b) {
                return a.distance - b.distance;
            });
            resolve(results);
        });
    },

    getDealerDetails: function (dealerId) {
        return new Promise(function (resolve, reject) {
            const dealer = DEALERS.find(function (d) {
                return d.id === dealerId;
            });
            if (dealer) {
                resolve(dealer);
            } else {
                reject(new Error('ডিলার পাওয়া যায়নি'));
            }
        });
    },

    openInMaps: function (lat, lon, label) {
        const query = label ? label : lat + ',' + lon;
        const url = 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lon + '#map=14/' + lat + '/' + lon;
        window.open(url, '_blank');
    },

    getDirections: function (fromLat, fromLon, toLat, toLon) {
        const url = 'https://www.openstreetmap.org/directions?engine=osrm_car&route=' +
                    fromLat + ',' + fromLon + ';' + toLat + ',' + toLon;
        window.open(url, '_blank');
    },

    createDealerMap: function (containerId) {
        const self = this;

        loadLeaflet(function () {
            if (self.map) {
                self.map.remove();
            }

            self.map = L.map(containerId, {
                center: DEFAULT_MAP_OPTIONS.center,
                zoom: 7
            });

            L.tileLayer(DEFAULT_MAP_OPTIONS.tileUrl, {
                attribution: DEFAULT_MAP_OPTIONS.attribution
            }).addTo(self.map);

            DEALERS.forEach(function (dealer) {
                const color = dealer.type === 'main' ? 'green' : 'blue';
                const icon = createIcon(color);
                const marker = L.marker([dealer.lat, dealer.lon], { icon: icon })
                    .addTo(self.map)
                    .bindPopup(createPopupContent(dealer));
                self.markers.push(marker);
            });

            if (self.markers.length > 0) {
                const group = L.featureGroup(self.markers);
                self.map.fitBounds(group.getBounds().pad(0.1));
            }
        });
    },

    createLocationPicker: function (containerId, callback) {
        const self = this;

        loadLeaflet(function () {
            if (self.map) {
                self.map.remove();
            }

            self.map = L.map(containerId, {
                center: DEFAULT_MAP_OPTIONS.center,
                zoom: 7
            });

            L.tileLayer(DEFAULT_MAP_OPTIONS.tileUrl, {
                attribution: DEFAULT_MAP_OPTIONS.attribution
            }).addTo(self.map);

            let pickedMarker = null;

            self.map.on('click', function (e) {
                const lat = e.latlng.lat;
                const lon = e.latlng.lng;

                if (pickedMarker) {
                    self.map.removeLayer(pickedMarker);
                }

                const icon = createIcon('red');
                pickedMarker = L.marker([lat, lon], { icon: icon })
                    .addTo(self.map)
                    .bindPopup('নির্বাচিত স্থান: ' + lat.toFixed(4) + ', ' + lon.toFixed(4))
                    .openPopup();

                if (typeof callback === 'function') {
                    callback({ lat: lat, lon: lon });
                }
            });
        });
    }
};
