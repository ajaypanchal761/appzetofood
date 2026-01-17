# Food Delivery System - Complete System Analysis & Implementation

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Order Lifecycle State Machine](#order-lifecycle-state-machine)
3. [Database Schema](#database-schema)
4. [API Design](#api-design)
5. [Socket.IO Events](#socketio-events)
6. [Zone-Based Assignment Logic](#zone-based-assignment-logic)
7. [Implementation Status](#implementation-status)
8. [Missing Components & Implementation Plan](#missing-components--implementation-plan)

---

## 🏗️ System Architecture

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (with GeoJSON support)
- **Real-time**: Socket.IO
- **Payment**: Razorpay
- **Maps**: Google Maps API
- **Authentication**: JWT + Role-based access

### Module Structure
```
backend/modules/
├── auth/          ✅ Authentication & Authorization
├── user/          ✅ User Management
├── restaurant/    ✅ Restaurant Management
├── delivery/      ✅ Delivery Partner Management
├── order/         ✅ Order Lifecycle
├── payment/       ✅ Payment Processing (Razorpay)
├── admin/         ✅ Admin Operations & Zones
└── location/      ✅ Geolocation Services
```

### Frontend Structure
```
frontend/src/module/
├── user/          ✅ User Dashboard
├── restaurant/    ✅ Restaurant Dashboard
├── delivery/      ✅ Delivery Partner Dashboard
└── admin/         ✅ Admin Dashboard
```

---

## 🔄 Order Lifecycle State Machine

### Order States
```
PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
                                                      ↓
                                                 CANCELLED
```

### Detailed State Transitions

#### 1. User Flow
```
Order Placed (PENDING)
  ↓
Payment Verified (CONFIRMED)
  ↓
Restaurant Notified (via Socket + Sound)
```

#### 2. Restaurant Flow
```
New Order Received (CONFIRMED)
  ↓
Restaurant Accepts → PREPARING
  ↓
ETA Countdown Starts
  ↓
ETA Expires → READY
  ↓
Delivery Boy Assigned (nearest in zone)
```

#### 3. Delivery Boy Flow
```
Order Assigned
  ↓
Delivery Boy Accepts → EN_ROUTE_TO_PICKUP
  ↓
Polyline: Delivery Boy → Restaurant
  ↓
Reached Pickup (500m radius) → AT_PICKUP
  ↓
Order ID Confirmed → EN_ROUTE_TO_DELIVERY
  ↓
Polyline: Delivery Boy → Customer
  ↓
Reached Drop (500m radius) → AT_DELIVERY
  ↓
Delivery Confirmed → DELIVERED
```

### State Field Mapping
- **`order.status`**: `pending`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`
- **`order.deliveryState.status`**: `pending`, `accepted`, `reached_pickup`, `order_confirmed`, `en_route_to_delivery`, `delivered`
- **`order.deliveryState.currentPhase`**: `assigned`, `en_route_to_pickup`, `at_pickup`, `en_route_to_delivery`, `at_delivery`, `completed`

---

## 🗄️ Database Schema

### Order Model (✅ Implemented)
```javascript
{
  orderId: String (unique),
  userId: ObjectId (ref: User),
  restaurantId: String/ObjectId,
  restaurantName: String,
  items: [OrderItem],
  address: {
    location: GeoJSON Point,
    formattedAddress: String
  },
  pricing: {
    subtotal, deliveryFee, tax, discount, total
  },
  payment: {
    method, status, razorpayOrderId, razorpayPaymentId
  },
  status: Enum,
  deliveryPartnerId: ObjectId (ref: Delivery),
  estimatedDeliveryTime: Number,
  deliveryState: {
    status: Enum,
    currentPhase: Enum,
    routeToPickup: { coordinates, distance, duration },
    routeToDelivery: { coordinates, distance, duration }
  },
  assignmentInfo: {
    deliveryPartnerId, distance, assignedBy, zoneId, zoneName
  },
  tracking: {
    confirmed, preparing, ready, outForDelivery, delivered
  }
}
```

### Zone Model (✅ Implemented)
```javascript
{
  name: String,
  serviceLocation: String,
  restaurantId: ObjectId (ref: Restaurant),
  coordinates: [{ latitude, longitude }],
  boundary: GeoJSON Polygon (2dsphere index),
  isActive: Boolean
}
```

### Delivery Model (⚠️ Missing: zoneId field)
```javascript
{
  deliveryId: String,
  name: String,
  phone: String,
  location: GeoJSON Point,
  availability: {
    isOnline: Boolean,
    currentLocation: GeoJSON Point,
    lastLocationUpdate: Date
  },
  // ❌ MISSING: zoneId: ObjectId (ref: Zone)
  status: Enum,
  isActive: Boolean
}
```

### Restaurant Model (⚠️ Missing: zoneId field)
```javascript
{
  restaurantId: String,
  name: String,
  location: GeoJSON Point,
  // ❌ MISSING: zoneId: ObjectId (ref: Zone) - OR use Zone.restaurantId (1:1)
  isActive: Boolean,
  isAcceptingOrders: Boolean
}
```

---

## 🔌 API Design

### Order Endpoints (✅ Implemented)
- `POST /api/order/create` - Create order
- `POST /api/order/verify-payment` - Verify Razorpay payment
- `GET /api/order/:orderId` - Get order details
- `GET /api/order/user/orders` - Get user orders

### Restaurant Order Endpoints (✅ Implemented)
- `GET /api/restaurant/orders` - Get restaurant orders
- `PATCH /api/restaurant/orders/:orderId/accept` - Accept order
- `PATCH /api/restaurant/orders/:orderId/ready` - Mark order as ready

### Delivery Order Endpoints (✅ Implemented)
- `GET /api/delivery/orders` - Get delivery boy orders
- `POST /api/delivery/orders/:orderId/accept` - Accept order
- `PATCH /api/delivery/orders/:orderId/reached-pickup` - Confirm reached pickup
- `PATCH /api/delivery/orders/:orderId/confirm-order-id` - Confirm order ID
- `PATCH /api/delivery/orders/:orderId/reached-drop` - Confirm reached drop
- `PATCH /api/delivery/orders/:orderId/complete` - Complete delivery

### Admin Endpoints (✅ Partially Implemented)
- `GET /api/admin/orders` - Get all orders ✅
- `GET /api/admin/delivery-partners/earnings` - Get delivery earnings ✅
- `GET /api/admin/zones` - Get zones ✅
- `POST /api/admin/zones` - Create zone ✅

---

## 📡 Socket.IO Events

### Restaurant Namespace (`/restaurant`)
- **`newOrder`** (✅ Implemented): Restaurant receives new order notification
  - Data: `{ orderId, items, total, customerAddress, estimatedDeliveryTime }`
  - Sound: ✅ Plays sound on frontend

### Delivery Namespace (`/delivery`)
- **`newOrder`** (✅ Implemented): Delivery boy receives order assignment
  - Data: `{ orderId, restaurantName, restaurantLocation, customerLocation }`
- **`orderReady`** (✅ Implemented): Order is ready at restaurant
  - Data: `{ orderId, restaurantName, restaurantLocation }`
- **`request_order_id_confirmation`** (✅ Implemented): Request order ID confirmation

### Order Tracking (`order:${orderId}`)
- **`location-receive-${orderId}`** (✅ Implemented): Live delivery boy location
  - Data: `{ lat, lng, heading, timestamp }`
- **`order_status_update`** (✅ Implemented): Order status changes
  - Data: `{ title, message, status, estimatedDeliveryTime }`

### Missing Events
- **`eta_countdown`**: Real-time ETA countdown sync ❌
- **`order_assigned`**: Broadcast when order is assigned to delivery boy ❌
- **`zone_update`**: Zone boundaries or assignments updated ❌

---

## 🗺️ Zone-Based Assignment Logic

### Current Implementation (⚠️ Distance-based only)
```javascript
// appzetofood/backend/modules/order/services/deliveryAssignmentService.js
findNearestDeliveryBoy(restaurantLat, restaurantLng, maxDistance = 50)
  // Finds ALL online delivery partners
  // Calculates distance from restaurant
  // Returns nearest one
  // ❌ Does NOT filter by zone
```

### Required Implementation (❌ Missing)
```javascript
findNearestDeliveryBoyInZone(restaurantId, restaurantLat, restaurantLng)
  1. Find Zone for restaurant (Zone.restaurantId === restaurantId)
  2. Find all delivery partners where:
     - availability.isOnline === true
     - status === 'approved' || 'active'
     - zoneId === zone._id (OR currentLocation within zone boundary)
  3. Calculate distance from restaurant
  4. Return nearest delivery partner within zone
```

### Zone Membership Options

#### Option A: Explicit `zoneId` field (Recommended)
- Add `zoneId: ObjectId` to Delivery model
- Admin assigns delivery boys to zones
- Filter: `Delivery.find({ zoneId: zone._id, ... })`

#### Option B: Geo-spatial query
- Use `Zone.boundary` (GeoJSON Polygon) with `$geoWithin`
- Filter: `Delivery.find({ 'availability.currentLocation': { $geoWithin: { $geometry: zone.boundary } } })`
- More dynamic but slower

---

## ✅ Implementation Status

### Fully Implemented
- ✅ User order creation with Razorpay
- ✅ Payment verification
- ✅ Restaurant order notifications (Socket + Sound)
- ✅ Restaurant order acceptance
- ✅ ETA countdown (frontend only)
- ✅ Distance-based delivery boy assignment
- ✅ Delivery boy order acceptance
- ✅ Live polyline routing (delivery boy → restaurant → customer)
- ✅ Reached pickup detection (500m radius)
- ✅ Order ID confirmation
- ✅ Reached drop detection (500m radius)
- ✅ Delivery completion
- ✅ Delivery earnings calculation
- ✅ Admin order management (real data)
- ✅ Admin delivery earnings report

### Partially Implemented
- ⚠️ Zone-based assignment (only distance-based currently)
- ⚠️ ETA countdown sync (frontend only, no Socket.IO sync)
- ⚠️ Real-time order status updates (some events missing)

### Not Implemented
- ❌ Zone-based delivery boy assignment
- ❌ Delivery boy zone assignment (admin interface)
- ❌ Restaurant zone linking (currently via Zone.restaurantId)
- ❌ Real-time ETA countdown sync via Socket.IO
- ❌ Edge case handling (payment success but order failure, network drops)
- ❌ State persistence on app refresh

---

## 🚧 Missing Components & Implementation Plan

### Priority 1: Zone-Based Assignment
**Status**: ❌ Not Implemented  
**File**: `appzetofood/backend/modules/order/services/deliveryAssignmentService.js`

**Tasks**:
1. Add `zoneId` field to Delivery model
2. Update `findNearestDeliveryBoy` to filter by zone
3. Get restaurant's zone first
4. Filter delivery partners by zone

### Priority 2: Delivery Boy Zone Assignment
**Status**: ❌ Not Implemented  
**Files**: 
- `appzetofood/backend/modules/delivery/models/Delivery.js`
- `appzetofood/backend/modules/admin/controllers/deliveryPartnerController.js`

**Tasks**:
1. Add `zoneId` field to Delivery schema
2. Admin interface to assign delivery boys to zones
3. Update delivery boy profile to show assigned zone

### Priority 3: Real-time ETA Countdown
**Status**: ⚠️ Frontend only  
**Files**:
- `appzetofood/backend/modules/restaurant/controllers/restaurantOrderController.js`
- `appzetofood/frontend/src/module/restaurant/pages/OrdersMain.jsx`

**Tasks**:
1. Emit `eta_countdown` event when order is accepted
2. Frontend listens to `eta_countdown` events
3. Sync countdown across multiple restaurant tabs

### Priority 4: Edge Cases
**Status**: ❌ Not Implemented

**Tasks**:
1. Payment success but order creation failure → Rollback payment
2. Restaurant rejects order → Unassign delivery boy, notify customer
3. Delivery boy rejects order → Reassign to next nearest
4. Network drop → Persist state in localStorage, sync on reconnect
5. App refresh → Restore state from localStorage/server

---

## 📊 Next Steps

1. **Implement Zone-Based Assignment** (Priority 1)
2. **Add Zone Assignment to Delivery Model** (Priority 2)
3. **Real-time ETA Sync** (Priority 3)
4. **Edge Case Handling** (Priority 4)
5. **Testing & Validation**

---

*Last Updated: 2026-01-17*

