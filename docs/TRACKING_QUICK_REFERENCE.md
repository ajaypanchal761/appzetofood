# 🛵 Rapido-Style Tracking - Quick Reference

## 🎯 Core Principle

**Bike GPS pe nahi, ROUTE POLYLINE pe chalti hai** ✅

## 📐 Architecture Summary

```
Delivery App (GPS) 
  → Backend (Snap to Road + Smooth) 
  → Route Polyline Match 
  → WebSocket Broadcast 
  → Frontend (Route-Based Animation)
```

## 🔑 Key Files

### Backend
- `backend/modules/delivery/services/locationProcessingService.js` - Core processing logic
- `backend/modules/delivery/controllers/locationTrackingController.js` - API endpoints

### Frontend
- `frontend/src/module/user/utils/routeBasedAnimation.js` - Animation engine
- `frontend/src/module/user/components/DeliveryTrackingMap.jsx` - Map component (needs update)

## 🚀 Quick Start

### 1. Backend Routes
Add to delivery routes:
```javascript
router.post('/location/update', receiveLocationUpdate);
router.post('/location/initialize-route', initializeRoute);
```

### 2. Delivery App
Send GPS every 3-5 seconds:
```javascript
POST /api/delivery/location/update
{
  orderId: "ORD-123",
  lat: 28.6139,
  lng: 77.2090,
  speed: 25,
  bearing: 45,
  accuracy: 10
}
```

### 3. Frontend
Initialize route and listen for updates:
```javascript
// Initialize route
POST /api/delivery/location/initialize-route
{ orderId, riderLat, riderLng }

// Listen via WebSocket
socket.on('location-update-{orderId}', (data) => {
  animationController.updatePosition(data.progress, data.bearing);
});
```

## 🧠 Algorithm Flow

1. **Raw GPS** → Delivery app sends (lat, lng)
2. **Snap to Road** → Google Roads API
3. **Smooth** → Moving average / Kalman Filter
4. **Route Match** → Find nearest point on polyline
5. **Progress Calc** → Distance covered / Total distance
6. **Broadcast** → WebSocket to customer
7. **Animate** → Smooth interpolation on polyline

## ⚙️ Configuration

### Update Frequency
- **Minimum**: 3 seconds
- **Maximum**: 15 meters movement
- **Throttle**: Use debounce

### Speed Limits
- **Min**: 10 km/h
- **Max**: 45 km/h
- **Default**: 20 km/h (when GPS speed unavailable)

### Animation
- **Duration**: 1000-1500ms
- **Easing**: ease-out-cubic
- **Rotation**: Smooth bearing interpolation

## 🔧 Google APIs Required

1. **Google Roads API** - Snap to Road
   - Enable in Google Cloud Console
   - Cost: $0.005 per request (up to 100 points)

2. **Google Directions API** - Route Generation
   - Enable in Google Cloud Console
   - Cost: $0.005 per request

3. **Google Maps SDK** - Map Rendering
   - Already configured

## 📊 Data Structures

### Location Update (Backend → Frontend)
```javascript
{
  lat: 28.6139,
  lng: 77.2090,
  bearing: 45,        // 0-360 degrees
  speed: 25,         // km/h
  progress: 0.65,    // 0-1 (65% route completed)
  distanceCovered: 5200,  // meters
  remainingDistance: 2800, // meters
  timestamp: 1234567890,
  snapped: true,     // Was snapped to road
  onRoute: true      // Is on route polyline
}
```

### Route Polyline
```javascript
{
  polyline: "encoded_string",
  points: [
    {lat: 28.6139, lng: 77.2090},
    {lat: 28.6140, lng: 77.2091},
    // ... more points
  ],
  totalDistance: 8000,  // meters
  duration: 1200         // seconds
}
```

## 🐛 Common Issues & Solutions

### Issue: Marker jumps off road
**Solution**: Ensure snapToRoad is called before animation

### Issue: Animation not smooth
**Solution**: Use RouteBasedAnimationController, not direct setPosition

### Issue: GPS updates too frequent
**Solution**: Add throttling (3-5 seconds minimum)

### Issue: Route not generated
**Solution**: Check Google Directions API key and coordinates validity

### Issue: Marker stops when GPS lost
**Solution**: Implement estimatePositionOnRoute for GPS loss handling

## ✅ Checklist

- [ ] Google Roads API enabled
- [ ] Google Directions API enabled
- [ ] WebSocket server configured
- [ ] Backend routes added
- [ ] Frontend animation controller integrated
- [ ] GPS update throttling implemented
- [ ] Error handling added
- [ ] Performance tested
- [ ] Production API keys configured

## 🎓 Learning Resources

- Google Roads API: https://developers.google.com/maps/documentation/roads
- Google Directions API: https://developers.google.com/maps/documentation/directions
- Kalman Filter: https://en.wikipedia.org/wiki/Kalman_filter
- Polyline Encoding: https://developers.google.com/maps/documentation/utilities/polylinealgorithm

## 💡 Pro Tips

1. **Batch GPS points** - Send multiple points to Roads API (up to 100)
2. **Cache routes** - Don't regenerate route for same order
3. **Smooth rotation** - Use smoothRotation() to prevent sudden angle changes
4. **Handle GPS loss** - Estimate position based on last known speed
5. **Monitor costs** - Google APIs can get expensive at scale
6. **Test on real roads** - Simulated GPS doesn't catch all edge cases

