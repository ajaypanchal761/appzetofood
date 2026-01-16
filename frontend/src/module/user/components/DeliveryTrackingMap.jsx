import React, { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api/config';
import bikeLogo from '@/assets/bikelogo.png';
import './DeliveryTrackingMap.css';

const DeliveryTrackingMap = ({ 
  orderId, 
  restaurantCoords, 
  customerCoords,
  userLiveCoords = null,
  userLocationAccuracy = null,
  deliveryBoyData = null,
  order = null
}) => {
  const mapRef = useRef(null);
  const bikeMarkerRef = useRef(null);
  const userLocationMarkerRef = useRef(null);
  const userLocationCircleRef = useRef(null);
  const mapInstance = useRef(null);
  const socketRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  
  const [eta, setEta] = useState("Calculating...");
  const [distance, setDistance] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const routePolylineRef = useRef(null);
  const lastRouteUpdateRef = useRef(null);

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

  // Draw route using Google Maps Directions API with live updates
  const drawRoute = useCallback((start, end, updateETA = true) => {
    if (!mapInstance.current || !directionsServiceRef.current || !directionsRendererRef.current) return;

    directionsServiceRef.current.route({
      origin: { lat: start.lat, lng: start.lng },
      destination: { lat: end.lat, lng: end.lng },
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK' && result) {
        directionsRendererRef.current.setDirections(result);
        
        // Calculate ETA and distance
        if (updateETA) {
          const route = result.routes[0];
          if (route.legs && route.legs.length > 0) {
            const leg = route.legs[0];
            const durationInMinutes = Math.ceil(leg.duration.value / 60);
            const distanceInKm = (leg.distance.value / 1000).toFixed(1);
            setEta(`${durationInMinutes} mins`);
            setDistance(`${distanceInKm} km`);
          }
        }
      } else {
        console.error('Directions request failed:', status);
        // Fallback calculation
        if (updateETA) {
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
      }
    });
  }, []);

  // Determine which route to show based on order phase
  const getRouteToShow = useCallback(() => {
    if (!order || !deliveryBoyLocation) {
      // No delivery boy location yet, show restaurant to customer
      return { start: restaurantCoords, end: customerCoords };
    }

    const currentPhase = order.deliveryState?.currentPhase || 'assigned';
    const status = order.deliveryState?.status || 'pending';

    // Phase 1: Delivery boy going to restaurant (en_route_to_pickup)
    if (currentPhase === 'en_route_to_pickup' || status === 'accepted') {
      return { 
        start: { lat: deliveryBoyLocation.lat, lng: deliveryBoyLocation.lng }, 
        end: restaurantCoords 
      };
    }

    // Phase 2: Delivery boy at restaurant (at_pickup) - show route to customer
    if (currentPhase === 'at_pickup' || status === 'reached_pickup' || status === 'order_confirmed') {
      return { 
        start: restaurantCoords, 
        end: customerCoords 
      };
    }

    // Phase 3: Delivery boy going to customer (en_route_to_delivery)
    if (currentPhase === 'en_route_to_delivery' || status === 'en_route_to_delivery' || order.status === 'out_for_delivery') {
      return { 
        start: { lat: deliveryBoyLocation.lat, lng: deliveryBoyLocation.lng }, 
        end: customerCoords 
      };
    }

    // Default: Show restaurant to customer
    return { start: restaurantCoords, end: customerCoords };
  }, [order, deliveryBoyLocation, restaurantCoords, customerCoords]);

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
        const location = { lat: data.lat, lng: data.lng, heading: data.heading || 0 };
        setCurrentLocation(location);
        setDeliveryBoyLocation(location);
        moveBikeSmoothly(data.lat, data.lng, data.heading || 0);
      }
    });

    socketRef.current.on(`current-location-${orderId}`, (data) => {
      console.log('📍 Received current location:', data);
      if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
        const location = { lat: data.lat, lng: data.lng, heading: data.heading || 0 };
        setCurrentLocation(location);
        setDeliveryBoyLocation(location);
        moveBikeSmoothly(data.lat, data.lng, data.heading || 0);
      }
    });

    // Listen for order status updates (e.g., "Delivery partner on the way")
    socketRef.current.on('order_status_update', (data) => {
      console.log('📢 Received order status update:', data);
      
      // Trigger custom event so OrderTracking component can handle notification
      // This avoids circular dependencies and keeps notification logic in OrderTracking
      if (window.dispatchEvent && data.message) {
        window.dispatchEvent(new CustomEvent('orderStatusNotification', {
          detail: data
        }));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off(`location-receive-${orderId}`);
        socketRef.current.off(`current-location-${orderId}`);
        socketRef.current.off('order_status_update');
        socketRef.current.disconnect();
      }
    };
  }, [orderId, backendUrl, moveBikeSmoothly]);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || !restaurantCoords || !customerCoords) return;

    const loadGoogleMapsIfNeeded = async () => {
      // Wait for Google Maps to load from main.jsx first
      if (!window.google || !window.google.maps) {
        console.log('⏳ Waiting for Google Maps API to load...');
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (!window.google && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        // If still not loaded, try loading it ourselves
        if (!window.google || !window.google.maps) {
          console.log('⏳ Google Maps not loaded from main.jsx, loading manually...');
          try {
            const { getGoogleMapsApiKey } = await import('@/lib/utils/googleMapsApiKey.js');
            const { Loader } = await import('@googlemaps/js-api-loader');
            const apiKey = await getGoogleMapsApiKey();
            if (apiKey) {
              const loader = new Loader({
                apiKey: apiKey,
                version: "weekly",
                libraries: ["places", "geometry", "drawing"]
              });
              await loader.load();
              console.log('✅ Google Maps loaded manually');
            } else {
              console.error('❌ No Google Maps API key found');
              return;
            }
          } catch (error) {
            console.error('❌ Error loading Google Maps:', error);
            return;
          }
        }
      }

      // Initialize map once Google Maps is loaded
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        console.error('❌ Google Maps API still not available');
      }
    };

    loadGoogleMapsIfNeeded();

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

        // Add customer marker with home icon (pin style)
        const customerMarker = new window.google.maps.Marker({
          position: { lat: customerCoords.lat, lng: customerCoords.lng },
          map: mapInstance.current,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: '#000000', // Black pin
            fillOpacity: 1,
            strokeColor: '#000000',
            strokeWeight: 1,
            rotation: 180, // Point downward
            anchor: new window.google.maps.Point(0, 0)
          },
          zIndex: window.google.maps.Marker.MAX_ZINDEX + 1
        });

        // Add home icon inside the pin using a custom SVG
        const homeIconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
            <path d="M9 22V12h6v10"></path>
          </svg>
        `;
        
        // Create an info window with home icon to overlay on marker
        const homeIconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
            <!-- Pin shape -->
            <path d="M20 0 C9 0 0 9 0 20 C0 35 20 50 20 50 C20 50 40 35 40 20 C40 9 31 0 20 0 Z" fill="#000000" stroke="#000000" stroke-width="1"/>
            <!-- Home icon -->
            <path d="M20 12 L12 18 L12 28 L16 28 L16 24 L24 24 L24 28 L28 28 L28 18 Z" fill="white" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 24 L16 20 L20 17 L24 20 L24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `);

        // Update customer marker with custom home icon
        customerMarker.setIcon({
          url: homeIconUrl,
          scaledSize: new window.google.maps.Size(40, 50),
          anchor: new window.google.maps.Point(20, 50),
          origin: new window.google.maps.Point(0, 0)
        });

        // Add user's live location marker (blue dot) and radius circle if available
        if (userLiveCoords && userLiveCoords.lat && userLiveCoords.lng) {
          // Create blue dot marker for user's live location
          userLocationMarkerRef.current = new window.google.maps.Marker({
            position: { lat: userLiveCoords.lat, lng: userLiveCoords.lng },
            map: mapInstance.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#4285F4', // Google blue
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3
            },
            zIndex: window.google.maps.Marker.MAX_ZINDEX + 2,
            optimized: false,
            title: "Your live location"
          });

          // Create radius circle around user's location
          const radiusMeters = Math.max(userLocationAccuracy || 50, 20); // Minimum 20m
          userLocationCircleRef.current = new window.google.maps.Circle({
            strokeColor: '#4285F4',
            strokeOpacity: 0.4,
            strokeWeight: 2,
            fillColor: '#4285F4',
            fillOpacity: 0.15, // Light transparent blue
            map: mapInstance.current,
            center: { lat: userLiveCoords.lat, lng: userLiveCoords.lng },
            radius: radiusMeters, // Meters
            zIndex: window.google.maps.Marker.MAX_ZINDEX + 1
          });

          console.log('✅ User live location marker and radius circle added:', {
            position: userLiveCoords,
            radius: radiusMeters
          });
        }

        // Draw route based on order phase
        mapInstance.current.addListener('tilesloaded', () => {
          setIsMapLoaded(true);
          
          // Initial route - will be updated when delivery boy location is received
          // Default: show restaurant to customer (will update when delivery boy location arrives)
          drawRoute(restaurantCoords, customerCoords, true);
        });

        console.log('✅ Google Map initialized successfully');
      } catch (error) {
        console.error('❌ Map initialization error:', error);
      }
    }
  }, [restaurantCoords, customerCoords, drawRoute, getRouteToShow, deliveryBoyLocation]);

  // Update route when delivery boy location or order phase changes
  useEffect(() => {
    if (!isMapLoaded) return;
    
    // Throttle route updates to avoid too many API calls
    const now = Date.now();
    if (lastRouteUpdateRef.current && (now - lastRouteUpdateRef.current) < 10000) {
      return; // Skip if updated less than 10 seconds ago
    }
    
    const route = getRouteToShow();
    if (route.start && route.end) {
      lastRouteUpdateRef.current = now;
      drawRoute(route.start, route.end, true);
      console.log('🔄 Route updated:', {
        phase: order?.deliveryState?.currentPhase,
        status: order?.deliveryState?.status,
        from: route.start,
        to: route.end
      });
    }
  }, [isMapLoaded, deliveryBoyLocation, order?.deliveryState?.currentPhase, order?.deliveryState?.status, order?.status, getRouteToShow, drawRoute, order]);

  // Update bike when location changes
  useEffect(() => {
    if (isMapLoaded && currentLocation) {
      moveBikeSmoothly(currentLocation.lat, currentLocation.lng, currentLocation.heading || 0);
    }
  }, [isMapLoaded, currentLocation, moveBikeSmoothly]);

  // Update user's live location marker and circle when location changes
  useEffect(() => {
    if (isMapLoaded && userLiveCoords && userLiveCoords.lat && userLiveCoords.lng && mapInstance.current) {
      const userPos = { lat: userLiveCoords.lat, lng: userLiveCoords.lng };
      const radiusMeters = Math.max(userLocationAccuracy || 50, 20);

      // Update or create user location marker
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setPosition(userPos);
      } else {
        userLocationMarkerRef.current = new window.google.maps.Marker({
          position: userPos,
          map: mapInstance.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3
          },
          zIndex: window.google.maps.Marker.MAX_ZINDEX + 2,
          optimized: false,
          title: "Your live location"
        });
      }

      // Update or create radius circle
      if (userLocationCircleRef.current) {
        userLocationCircleRef.current.setCenter(userPos);
        userLocationCircleRef.current.setRadius(radiusMeters);
      } else {
        userLocationCircleRef.current = new window.google.maps.Circle({
          strokeColor: '#4285F4',
          strokeOpacity: 0.4,
          strokeWeight: 2,
          fillColor: '#4285F4',
          fillOpacity: 0.15,
          map: mapInstance.current,
          center: userPos,
          radius: radiusMeters,
          zIndex: window.google.maps.Marker.MAX_ZINDEX + 1
        });
      }
    }
  }, [isMapLoaded, userLiveCoords, userLocationAccuracy]);

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
