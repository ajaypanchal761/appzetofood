# 🛵 Rapido/Zomato-Style Tracking Implementation Guide

## 📋 Complete Implementation Steps

### Phase 1: Backend Setup

#### 1.1 Install Dependencies
```bash
npm install axios socket.io
```

#### 1.2 Add Routes
Add to `backend/modules/delivery/routes/deliveryRoutes.js`:
```javascript
import {
  receiveLocationUpdate,
  initializeRoute,
  clearLocationData
} from '../controllers/locationTrackingController.js';

router.post('/location/update', receiveLocationUpdate);
router.post('/location/initialize-route', initializeRoute);
router.post('/location/clear', clearLocationData);
```

#### 1.3 WebSocket Integration
In `backend/server.js`, add:
```javascript
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

// Handle connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join order room
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
  });
  
  // Join user room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
```

### Phase 2: Delivery App Integration

#### 2.1 GPS Collection
```javascript
// In delivery app (React Native / Flutter)
const watchPosition = () => {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy, speed, heading } = position.coords;
      
      // Validate
      if (accuracy > 50) return; // Reject low accuracy
      if (speed > 60) return; // Reject unrealistic speed
      
      // Send to backend
      sendLocationUpdate({
        orderId: currentOrderId,
        lat: latitude,
        lng: longitude,
        speed: speed || 0,
        bearing: heading || 0,
        accuracy: accuracy
      });
    },
    (error) => console.error('GPS error:', error),
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 3000,
      distanceFilter: 10 // Only update after 10 meters
    }
  );
};
```

#### 2.2 Send Location Update
```javascript
const sendLocationUpdate = async (locationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery/location/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(locationData)
    });
    
    if (!response.ok) {
      console.error('Failed to send location update');
    }
  } catch (error) {
    console.error('Error sending location:', error);
  }
};
```

### Phase 3: Frontend Customer App

#### 3.1 Update DeliveryTrackingMap Component

Replace the existing `moveBikeSmoothly` function with route-based animation:

```javascript
import { RouteBasedAnimationController } from '../../utils/routeBasedAnimation.js';

// In DeliveryTrackingMap component
const animationControllerRef = useRef(null);
const routePolylineRef = useRef(null);

// Initialize route when order is assigned
useEffect(() => {
  if (orderId && restaurantCoords && customerCoords) {
    initializeRoute();
  }
}, [orderId, restaurantCoords, customerCoords]);

const initializeRoute = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery/location/initialize-route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId,
        riderLat: deliveryBoyLocation?.lat,
        riderLng: deliveryBoyLocation?.lng
      })
    });
    
    const data = await response.json();
    if (data.success) {
      routePolylineRef.current = data.data.route.points;
      
      // Initialize animation controller
      if (bikeMarkerRef.current && routePolylineRef.current) {
        animationControllerRef.current = new RouteBasedAnimationController(
          bikeMarkerRef.current,
          routePolylineRef.current
        );
      }
    }
  } catch (error) {
    console.error('Error initializing route:', error);
  }
};

// Listen for location updates
useEffect(() => {
  if (!socketRef.current) return;
  
  socketRef.current.on(`location-update-${orderId}`, (data) => {
    if (animationControllerRef.current && data.progress !== undefined) {
      // Use route-based animation
      animationControllerRef.current.updatePosition(
        data.progress,
        data.bearing
      );
    } else if (bikeMarkerRef.current) {
      // Fallback to direct position update
      moveBikeSmoothly(data.lat, data.lng, data.bearing || 0);
    }
  });
  
  // Listen for route initialization
  socketRef.current.on(`route-initialized-${orderId}`, (data) => {
    routePolylineRef.current = data.points;
    if (bikeMarkerRef.current && routePolylineRef.current) {
      animationControllerRef.current = new RouteBasedAnimationController(
        bikeMarkerRef.current,
        routePolylineRef.current
      );
    }
  });
  
  return () => {
    if (socketRef.current) {
      socketRef.current.off(`location-update-${orderId}`);
      socketRef.current.off(`route-initialized-${orderId}`);
    }
  };
}, [orderId]);
```

## 🎯 Key Algorithms (Pseudo Code)

### 1. Snap to Road
```
FUNCTION snapToRoad(rawGPS):
  points = [rawGPS]
  path = formatForGoogleRoadsAPI(points)
  
  response = GoogleRoadsAPI.snapToRoads(path)
  
  IF response.success:
    RETURN response.snappedPoints
  ELSE:
    RETURN rawGPS // Fallback
END FUNCTION
```

### 2. Smooth Location
```
FUNCTION smoothLocation(riderId, location):
  history = getLocationHistory(riderId)
  history.push(location)
  
  IF history.length > 5:
    history.shift() // Keep last 5
  
  avgLat = average(history.map(l => l.lat))
  avgLng = average(history.map(l => l.lng))
  avgSpeed = clamp(average(history.map(l => l.speed)), 10, 45)
  
  bearing = calculateBearing(history[-2], history[-1])
  
  RETURN {lat: avgLat, lng: avgLng, speed: avgSpeed, bearing}
END FUNCTION
```

### 3. Route Progress Calculation
```
FUNCTION calculateRouteProgress(orderId, location):
  route = getCachedRoute(orderId)
  IF NOT route:
    RETURN null
  
  nearest = findNearestPointOnPolyline(location, route.points)
  
  distanceCovered = 0
  FOR i = 1 TO nearest.index:
    distanceCovered += distance(route.points[i-1], route.points[i])
  END FOR
  
  progress = distanceCovered / route.totalDistance
  nextPoint = route.points[nearest.index + 1]
  
  RETURN {progress, nextPoint, distanceCovered}
END FUNCTION
```

### 4. Smooth Animation
```
FUNCTION animateMarker(marker, from, to, duration):
  startTime = NOW
  deltaLat = to.lat - from.lat
  deltaLng = to.lng - from.lng
  
  FUNCTION animate():
    elapsed = NOW - startTime
    progress = min(1, elapsed / duration)
    eased = easeOutCubic(progress)
    
    currentLat = from.lat + deltaLat * eased
    currentLng = from.lng + deltaLng * eased
    
    marker.setPosition({lat: currentLat, lng: currentLng})
    
    bearing = calculateBearing(from, {lat: currentLat, lng: currentLng})
    marker.setRotation(bearing)
    
    IF progress < 1:
      requestAnimationFrame(animate)
    ELSE:
      marker.setPosition(to)
  END FUNCTION
  
  animate()
END FUNCTION
```

## 🔥 Best Practices

### 1. Update Frequency Control
- **Minimum**: 3 seconds between updates
- **Maximum**: 15 meters movement
- **Throttle**: Use debounce/throttle in delivery app

### 2. GPS Accuracy
- Reject updates with accuracy > 50 meters
- Prefer high-accuracy GPS mode
- Use network location as fallback

### 3. Speed Normalization
- Clamp speed between 10-45 km/h
- Use moving average of last 5 speeds
- Handle traffic conditions

### 4. Route Caching
- Cache route polyline for entire order
- Regenerate only if route changes
- Clear cache when order completes

### 5. Error Handling
- Fallback to raw GPS if Roads API fails
- Continue animation if GPS signal drops
- Estimate position based on last known speed

### 6. Performance
- Batch GPS points for Roads API (up to 100)
- Use requestAnimationFrame for smooth animation
- Debounce WebSocket broadcasts

## 🧪 Testing Checklist

- [ ] GPS updates received correctly
- [ ] Snap to road working
- [ ] Route polyline generated
- [ ] Marker stays on road
- [ ] Smooth animation (no jumps)
- [ ] Bearing rotation works
- [ ] GPS loss handled gracefully
- [ ] WebSocket connection stable
- [ ] Performance optimized (60 FPS)

## 📊 Monitoring

Track these metrics:
- GPS update frequency
- Roads API success rate
- Animation frame rate
- WebSocket connection stability
- Route accuracy
- User experience (smoothness rating)

## 🚀 Production Deployment

1. Enable Google Roads API in Google Cloud Console
2. Set up API key with proper restrictions
3. Configure WebSocket server (scalable)
4. Monitor API usage and costs
5. Set up error alerts
6. Load test with multiple concurrent orders

