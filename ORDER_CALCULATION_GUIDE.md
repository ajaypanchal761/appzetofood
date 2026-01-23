# Order Calculation & Settlement System - Implementation Guide

## Overview
This document explains the end-to-end order calculation and settlement system for the AppzetoFood platform.

## Example Calculation: ₹200 Order

### Scenario
- **Food Order Value**: ₹200
- **Restaurant Commission**: 15% (set by admin)
- **Delivery**: FREE (based on order value conditions)
- **Platform Fee**: ₹6 (from Fee Settings)
- **GST**: ₹10 (5% on ₹200)
- **Delivery Distance**: 5 km
- **Delivery Base Payout**: ₹10
- **Per KM Commission**: ₹5 (applies if distance > 4 km)

---

## 1. User Payment Breakdown

**User pays:**
```
Item Total:        ₹200
Discount:          ₹0
Delivery Fee:      ₹0 (FREE - based on conditions)
Platform Fee:      ₹6
GST:               ₹10
─────────────────────────
Total:             ₹216
```

---

## 2. Restaurant Earnings

**Restaurant receives in wallet:**
```
Food Price:        ₹200
Commission (15%):  ₹30 (deducted)
─────────────────────────
Net Earning:       ₹170
```

**Transaction Description:**
- "Payment for order ORD-xxx (Order: ₹200, Commission: ₹30, Net: ₹170)"

---

## 3. Delivery Partner Earnings

**Delivery partner receives:**
```
Base Payout:       ₹10 (always given)
Distance:          5 km
Per KM (if > 4km): ₹5 × 5 km = ₹25
─────────────────────────
Total Earning:     ₹35
```

**Note:** If distance ≤ 4 km, only base payout (₹10) is given.

---

## 4. Admin/Platform Earnings

**Admin receives:**
```
Restaurant Commission: ₹30 (15% of ₹200)
Platform Fee:           ₹6 (from user payment)
Delivery Fee:           ₹0 (FREE for user, but tracked)
GST:                    ₹10 (from user payment)
─────────────────────────────────────────
Total Admin Earning:    ₹46
```

**Breakdown in Admin Wallet:**
- Commission transaction: ₹30 (15% of ₹200)
- Platform fee transaction: ₹6
- GST transaction: ₹10
- Delivery fee transaction: ₹0 (if free)

---

## Calculation Flow

### Step 1: Order Placement
1. User places order for ₹200
2. System calculates:
   - Delivery fee (based on order value - FREE in this case)
   - Platform fee (₹6)
   - GST (5% of ₹200 = ₹10)
   - Total: ₹216

### Step 2: Payment Verification
1. User pays ₹216
2. System holds ₹216 in escrow
3. Settlement calculation is triggered

### Step 3: Settlement Calculation
1. **Restaurant Commission:**
   - Calculate 15% of ₹200 = ₹30
   - Restaurant net earning = ₹200 - ₹30 = ₹170

2. **Delivery Partner Commission:**
   - Check distance: 5 km
   - Base payout: ₹10
   - Since 5 km > 4 km: Add ₹5 × 5 = ₹25
   - Total: ₹35

3. **Admin Earnings:**
   - Commission: ₹30
   - Platform fee: ₹6
   - GST: ₹10
   - Delivery fee: ₹0
   - Total: ₹46

### Step 4: Order Delivery
1. When order is marked as "delivered"
2. Escrow is released
3. Funds are distributed:
   - Restaurant wallet: +₹170
   - Delivery partner wallet: +₹35
   - Admin wallet: +₹46

---

## Verification

**Total Money Flow:**
```
User Paid:         ₹216
─────────────────────────
Restaurant:        ₹170
Delivery Partner:  ₹35
Admin:             ₹46
─────────────────────────
Total Distributed: ₹251 ❌ (Mismatch!)
```

**Wait, there's an issue!** Let me recalculate:

Actually, the correct flow is:
- User pays: ₹216 (₹200 food + ₹6 platform + ₹10 GST)
- Restaurant gets: ₹170 (₹200 - ₹30 commission)
- Delivery partner gets: ₹35 (from admin's delivery fee pool or separate)
- Admin gets: ₹30 (commission) + ₹6 (platform fee) + ₹10 (GST) = ₹46

But delivery partner's ₹35 needs to come from somewhere. In reality:
- If delivery is FREE for user, admin still pays delivery partner from platform earnings
- So admin's net earning = ₹46 - ₹35 = ₹11

However, based on the requirement, it seems:
- Delivery fee collected from user goes to admin
- Admin pays delivery partner from that
- If delivery is free, admin still pays delivery partner (from platform margin)

Let me check the actual implementation...

---

## Correct Calculation (As Implemented)

**User Payment:**
- Food: ₹200
- Platform Fee: ₹6
- GST: ₹10
- Delivery Fee: ₹0 (FREE)
- **Total: ₹216**

**Distribution:**
1. **Restaurant:**
   - Receives: ₹170 (₹200 - ₹30 commission)
   - Commission goes to admin: ₹30

2. **Delivery Partner:**
   - Receives: ₹35 (₹10 base + ₹25 distance)
   - This is paid by admin from platform earnings

3. **Admin:**
   - Commission: ₹30
   - Platform Fee: ₹6
   - GST: ₹10
   - Delivery Partner Payment: -₹35
   - **Net Admin Earning: ₹11**

---

## Key Implementation Details

### Restaurant Commission Calculation
- Location: `orderSettlementService.js`
- Method: `calculateOrderSettlement()`
- Formula: `commission = foodPrice × commissionPercentage / 100`
- Restaurant receives: `foodPrice - commission`

### Delivery Partner Commission
- Location: `DeliveryBoyCommission.js`
- Method: `calculateCommission(distance)`
- Logic:
  - Base payout: Always given
  - Per KM: Only if `distance > minDistance`
  - Example: If minDistance = 4 km, distance = 5 km, perKm = ₹5
    - Total = ₹10 + (5 × ₹5) = ₹35

### Admin Earnings
- Location: `escrowWalletService.js`
- Method: `creditAdminWallet()`
- Breakdown:
  - Commission (from restaurant)
  - Platform fee (from user)
  - GST (from user)
  - Delivery fee (from user, if any)

---

## Database Models

### OrderSettlement
Tracks complete breakdown:
- `userPayment`: What user paid
- `restaurantEarning`: Restaurant's net earning
- `deliveryPartnerEarning`: Delivery partner's earning
- `adminEarning`: Admin's total earning

### AdminWallet
Tracks admin earnings separately:
- `totalCommission`: From restaurants
- `totalPlatformFee`: From users
- `totalDeliveryFee`: From users
- `totalGST`: From users

---

## API Endpoints

### View Settlement
- `GET /api/admin/settlements/order/:orderId` - View order settlement

### Restaurant Settlements
- `GET /api/admin/settlements/restaurants` - Pending restaurant settlements
- `GET /api/admin/settlements/restaurants/:id/report` - Settlement report

### Delivery Settlements
- `GET /api/admin/settlements/delivery` - Pending delivery settlements
- `GET /api/admin/settlements/delivery/:id/report` - Settlement report

### Admin Wallet
- `GET /api/admin/settlements/admin-wallet` - Admin wallet summary
- `GET /api/admin/settlements/statistics` - Settlement statistics

---

## Testing the Calculation

To test with ₹200 order:

1. **Create order** with ₹200 food value
2. **Verify settlement calculation:**
   ```javascript
   const settlement = await calculateOrderSettlement(orderId);
   // settlement.restaurantEarning.netEarning should be ₹170
   // settlement.restaurantEarning.commission should be ₹30
   // settlement.adminEarning.commission should be ₹30
   // settlement.adminEarning.platformFee should be ₹6
   // settlement.adminEarning.gst should be ₹10
   ```

3. **After delivery, check wallets:**
   - Restaurant wallet: Should have +₹170 transaction
   - Delivery partner wallet: Should have +₹35 transaction (if distance > 4km)
   - Admin wallet: Should have transactions for ₹30, ₹6, ₹10

---

## Notes

- All amounts are rounded to 2 decimal places
- Commission is calculated on food price (subtotal - discount)
- Delivery partner commission uses `>` comparison (strictly greater than minDistance)
- Free delivery for user doesn't mean admin doesn't pay delivery partner
- All transactions are logged in AuditLog for transparency

