# QuickBite Frontend - Quick Testing Guide

## 🧪 How to Test Each Fix

### TEST 1: Restaurant Visibility (BUG 1)
**Test**: Restaurants showing regardless of open status
```
1. Open http://localhost:5173/
2. Login with any account
3. Home page should show ALL restaurants
4. Look for:
   - Green "● Open" badge for open restaurants
   - Red "● Closed" badge for closed restaurants
   - Message "🕐 Currently closed - will reopen soon" on closed restaurants
5. Both open AND closed restaurants should appear
```

---

### TEST 2: User Profile After Login (BUG 2)
**Test**: fullName stored properly after login
```
1. Register new account with name "John Doe", email "john@test.com", phone "9876543210"
2. Login with that account
3. Go to /profile
4. Check that it shows:
   - Full Name: "John Doe"
   - Email: "john@test.com"
   - Phone: "9876543210"
5. Navbar should also show "Hi, John Doe!" (not "Hi, User!")
```

---

### TEST 3: Menu Items Display (BUG 3)
**Test**: Food items showing on restaurant page
```
1. Login as customer
2. Click any OPEN restaurant from home page
3. Menu page should show:
   - Category names
   - Item names with prices
   - Veg indicator (green ●) or Non-veg (red ●)
   - "ADD" button for each item
4. Click "ADD" on an item
5. Should see success message "✅ Margherita added to cart!"
6. View Cart button appears at bottom with item count
```

---

### TEST 4: Closed Restaurant Behavior (BUG 3 & 4)
**Test**: Can't order from closed restaurant
```
1. Login and go to a CLOSED restaurant
2. Try to click ADD button on a menu item
3. See "Closed" button (disabled state)
4. See warning message "🕐 This restaurant is currently closed..."
5. Cannot add items to cart
```

---

### TEST 5: Owner Dashboard (BUG 4)
**Test**: Owner can see their restaurant
```
1. Register new account as "RESTAURANT_OWNER"
2. Create a restaurant (will default to closed)
3. Toggle status to OPEN
4. Login as that owner
5. Dashboard should show:
   - Restaurant name, cuisine, city
   - Menu management section
   - Incoming orders section
6. Should NOT show "No Restaurant Yet" message
```

---

### TEST 6: Cart to Order Flow (BUG 5)
**Test**: Complete order placement
```
1. Add items from different categories to cart
2. Go to cart page /cart
3. See all items with quantities and total
4. Enter delivery address
5. Click "Place Order"
6. See "⏳ Placing your order..." message
7. Should complete without errors
8. Auto-redirect to /orders page
9. See new order with status "CONFIRMED" or similar
```

---

### TEST 7: Wallet Page (BUG 6)
**Test**: Wallet balance loads
```
1. Login as customer
2. Go to /wallet
3. Should see:
   - Balance amount (even if 0)
   - "+ Add Money" button
   - No error message
4. Try adding money:
   - Click "+ Add Money"
   - Enter amount (e.g., 500)
   - Click "Add Money"
   - Should see ✅ success message
5. Click "Mark all as read" button
```

---

### TEST 8: Notifications Page (BUG 7)
**Test**: Notifications load and display
```
1. Go to /notifications or click notification bell from navbar
2. Should see:
   - Notification list OR empty message "🔔 No notifications yet"
   - No error messages
3. Test from navbar:
   - Click bell icon in navbar
   - Should see unread count badge (if > 0)
   - Click to go to /notifications page
```

---

### TEST 9: Login Flow (BUG 2)
**Test**: Login doesn't ask for missing info
```
1. Register: email, fullName, phone, password, role
2. Logout
3. Login with that email/password
4. Should redirect to home/dashboard
5. Go to /profile
6. Should show all fields (fullName, email, phone)
7. Should NOT ask for phone again
8. Navbar should show "Hi, [fullName]!"
```

---

### TEST 10: Order Tracking
**Test**: Click order to track delivery
```
1. Place an order successfully
2. Go to /orders
3. Click any order card
4. Should show /track/{orderId} page with:
   - Current status prominently displayed
   - Timeline of status progression
   - Driver information (when assigned)
   - Order details and items
   - Delivery address
5. Should auto-refresh every 10 seconds
```

---

## 📊 Complete Customer Journey Test

**Scenario**: Customer orders pizza online
```
Step 1: Register
├─ Email: test@test.com
├─ Password: test123
├─ Name: Test User
├─ Phone: 9876543210
└─ Role: CUSTOMER

Step 2: Login
├─ See "Hi, Test User!" in navbar
├─ See all restaurants regardless of status
└─ Can see closed restaurants with red badge

Step 3: Browse
├─ Click "Pizza Palace" restaurant
├─ See menu with categories and items
├─ See item prices and veg indicators
└─ See items filter by available=true

Step 4: Add to Cart
├─ Add 2 Margherita pizzas
├─ See "✅ Margherita added to cart!"
├─ See cart count (2) in navbar
└─ Click View Cart button

Step 5: Checkout
├─ See both items with total
├─ Enter delivery address
├─ See "⏳ Placing your order..."
├─ Backend POSTs to /api/v1/cart/items for each
└─ Backend POSTs to /api/v1/orders

Step 6: Orders Page
├─ Auto-redirect to /orders
├─ See new order with order number
├─ See status (CONFIRMED/PENDING)
├─ See items and total
└─ Click to track delivery

Step 7: Order Tracking
├─ See current delivery status
├─ See timeline (ASSIGNED → PICKED_UP → DELIVERED)
├─ See driver info when assigned
└─ Auto-refreshes every 10 seconds

Step 8: Other Pages
├─ /wallet → shows balance
├─ /notifications → shows any notifications
├─ /profile → shows fullName, email, phone
└─ Navbar → shows notifications bell with unread count
```

---

## 🐛 Common Issues & Solutions

### Issue: "No restaurants found" on Home
**Solution**: Check that restaurants have `open: true` OR fix is working - should show closed too

### Issue: fullName not showing in navbar
**Solution**: Login not fetching profile. Check that Login.jsx is calling GET /api/v1/users/me

### Issue: "Restaurant not found" in Owner Dashboard
**Solution**: Check that Number() comparison is working. ownerId and user.id types might differ

### Issue: Cart empty when placing order
**Solution**: Check that POST /api/v1/cart/items is being called before POST /api/v1/orders

### Issue: Wallet shows error
**Solution**: Check 401 handling. May need to re-login if token expired

---

## 🎯 Success Criteria

All tests PASS when:
- ✅ Can register and login without asking for missing fields
- ✅ Can see all restaurants (open and closed)
- ✅ Can see menu items and add to cart
- ✅ Can place order successfully
- ✅ Can track order progress
- ✅ Can check wallet balance
- ✅ Can view notifications
- ✅ Profile shows correct user info
- ✅ No errors in browser console
- ✅ All API calls succeed (200/201)

---

## 🔍 Check Browser Console

Open DevTools (F12) and check:
```
✅ No red error messages in console
✅ Network tab shows:
   - POST /api/v1/auth/login (200)
   - GET /api/v1/users/me (200) [NEW!]
   - GET /api/v1/restaurants (200)
   - POST /api/v1/cart/items (200) [per item]
   - POST /api/v1/orders (200)
   - GET /api/v1/orders (200)
   - GET /api/v1/notifications (200)
```

---

Happy testing! 🚀
