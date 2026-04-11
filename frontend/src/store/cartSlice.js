import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    restaurantId: null,
    total: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find(
        (i) => i.menuItemId === item.menuItemId
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
      state.restaurantId = item.restaurantId;
      state.total = state.items.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity, 0
      );
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (i) => i.menuItemId !== action.payload
      );
      state.total = state.items.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity, 0
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;