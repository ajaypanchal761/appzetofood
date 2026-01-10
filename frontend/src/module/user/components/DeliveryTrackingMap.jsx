import React, { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api/config';
import bikeLogo from '@/assets/bikelogo.png';
import './DeliveryTrackingMap.css';

const DeliveryTrackingMap = ({ 
  orderId, 
  restaurantCoords, 
  customerCoords,
  deliveryBoyData = null 
}) => {
  const mapRef = useRef(null);
  const bikeMarkerRef = useRef(null);
  const mapInstance = useRef(null);
  const socketRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  
  const [eta, setEta] = useState("Calculating...");
  const [distance, setDistance] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const backendUrl = API_BASE_URL.replace('/api', '');
  const [GOOGLE_MAPS_API_KEY, setGOOGLE_MAPS_API_KEY] = useState("");
  
  // Load Google Maps API key from backend
  useEffect(() => {
    import('@/lib/utils/googleMapsApiKey.js').then(({ getGoogleMapsApiKey }) => {
      getGoogleMapsApiKey().then(key => {
        setGOOGLE_MAPS_API_KEY(key)
      })
    })
  }, [])

  // Draw route using Google Maps Directions API
  const drawRoute = useCallback((start, end) => {
    if (!mapInstance.current || !directionsServiceRef.current || !directionsRendererRef.current) return;

    directionsServiceRef.current.route({
      origin: { lat: start.lat, lng: start.lng },
      destination: { lat: end.lat, lng: end.lng },
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK' && result) {
        directionsRendererRef.current.setDirections(result);
        
        // Calculate ETA and distance
        const route = result.routes[0];
        if (route.legs && route.legs.length > 0) {
          const leg = route.legs[0];
          const durationInMinutes = Math.ceil(leg.duration.value / 60);
          const distanceInKm = (leg.distance.value / 1000).toFixed(1);
          setEta(`${durationInMinutes} mins`);
          setDistance(`${distanceInKm} km`);
        }
      } else {
        console.error('Directions request failed:', status);
        // Fallback calculation
        const R = 6371;
        const dLat = (end.lat - start.lat) * Math.PI / 180;
        const dLng = (end.lng - start.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distanceKm = R * c;
        const estimatedMinutes = Math.ceil((distanceKm / 30) * 60);
        setDistance(`${distanceKm.toFixed(1)} km`);
        setEta(`${estimatedMinutes} mins`);
      }
    });
  }, []);

  // Move bike smoothly with rotation
  const moveBikeSmoothly = useCallback((lat, lng, heading) => {
    if (!mapInstance.current || !isMapLoaded) {
      setCurrentLocation({ lat, lng, heading });
      return;
    }

    try {
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        console.error('❌ Invalid coordinates:', { lat, lng });
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error('❌ Coordinates out of range:', { lat, lng });
        return;
      }

      const position = new window.google.maps.LatLng(lat, lng);

      if (!bikeMarkerRef.current) {
        // Create bike marker
        const bikeIcon = {
          url: bikeLogo,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
          rotation: heading || 0
        };

        bikeMarkerRef.current = new window.google.maps.Marker({
          position: position,
          map: mapInstance.current,
          icon: bikeIcon,
          optimized: false
        });

        console.log('✅ Bike marker created at:', { lat, lng, heading });
      } else {
        // Update bike position and rotation
        bikeMarkerRef.current.setPosition(position);
        
        // Update icon with rotation
        const bikeIcon = {
          url: bikeLogo,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
          rotation: heading || 0
        };
        bikeMarkerRef.current.setIcon(bikeIcon);

        // Smoothly pan map to follow bike
        mapInstance.current.panTo(position);
      }
    } catch (error) {
      console.error('❌ Error moving bike:', error);
    }
  }, [isMapLoaded, bikeLogo]);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!orderId) return;

    socketRef.current = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: 5,
      timeout: 5000
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected for order:', orderId);
      socketRef.current.emit('join-order-tracking', orderId);
      socketRef.current.emit('request-current-location', orderId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socketRef.current.on(`location-receive-${orderId}`, (data) => {
      console.log('📍 Received location update:', data);
      if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
        setCurrentLocation({ lat: data.lat, lng: data.lng, heading: data.heading || 0 });
        moveBikeSmoothly(data.lat, data.lng, data.heading || 0);
      }
    });

    socketRef.current.on(`current-location-${orderId}`, (data) => {
      console.log('📍 Received current location:', data);
      if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
        setCurrentLocation({ lat: data.lat, lng: data.lng, heading: data.heading || 0 });
        moveBikeSmoothly(data.lat, data.lng, data.heading || 0);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off(`location-receive-${orderId}`);
        socketRef.current.off(`current-location-${orderId}`);
        socketRef.current.disconnect();
      }
    };
  }, [orderId, backendUrl, moveBikeSmoothly]);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || !restaurantCoords || !customerCoords) return;

    // Wait for Google Maps to load
    if (!window.google || !window.google.maps) {
      console.log('⏳ Waiting for Google Maps to load...');
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          initializeMap();
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }

    initializeMap();

    function initializeMap() {
      try {
        // Calculate center point
        const centerLng = (restaurantCoords.lng + customerCoords.lng) / 2;
        const centerLat = (restaurantCoords.lat + customerCoords.lat) / 2;

        // Initialize map
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 15,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          tilt: 45, // 3D view
          heading: 0
        });

        // Initialize Directions Service and Renderer
        directionsServiceRef.current = new window.google.maps.DirectionsService();
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: mapInstance.current,
          suppressMarkers: true, // We'll add custom markers
          polylineOptions: {
            strokeColor: '#10b981',
            strokeWeight: 6,
            strokeOpacity: 0.9
          }
        });

        // Add restaurant marker
        new window.google.maps.Marker({
          position: { lat: restaurantCoords.lat, lng: restaurantCoords.lng },
          map: mapInstance.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#22c55e',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          },
          label: {
            text: 'R',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });

        // Add customer marker
        new window.google.maps.Marker({
          position: { lat: customerCoords.lat, lng: customerCoords.lng },
          map: mapInstance.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          },
          label: {
            text: 'C',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });

        // Draw route
        mapInstance.current.addListener('tilesloaded', () => {
          setIsMapLoaded(true);
          drawRoute(restaurantCoords, customerCoords);
        });

        console.log('✅ Google Map initialized successfully');
      } catch (error) {
        console.error('❌ Map initialization error:', error);
      }
    }
  }, [restaurantCoords, customerCoords, drawRoute]);

  // Update bike when location changes
  useEffect(() => {
    if (isMapLoaded && currentLocation) {
      moveBikeSmoothly(currentLocation.lat, currentLocation.lng, currentLocation.heading || 0);
    }
  }, [isMapLoaded, currentLocation, moveBikeSmoothly]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* ETA Card (Bottom) */}
      {isMapLoaded && (
        <div className="delivery-eta-card">
          <div className="eta-card-content">
            <div className="eta-info">
              <p className="eta-label">ARRIVING IN</p>
              <h2 className="eta-time">{eta}</h2>
              {distance && <p className="eta-distance">{distance} away</p>}
            </div>
            {deliveryBoyData && (
              <div className="delivery-boy-info">
                <img 
                  src={deliveryBoyData.avatar || 'https://via.placeholder.com/40'} 
                  alt="Delivery Partner" 
                  className="delivery-boy-avatar"
                />
                <p className="delivery-boy-name">{deliveryBoyData.name || 'Rahul Partner'}</p>
              </div>
            )}
          </div>
          <div className="tracking-progress-bar">
            <div className="progress-bar-fill" style={{ width: '40%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTrackingMap;
