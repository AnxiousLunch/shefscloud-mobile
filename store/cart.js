// cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuration
const CART_LIFESPAN_DAYS = 7; // Days

// Helper functions for user-specific cart persistence
const getCartKey = (userId) => `cart_${userId}`;
const getCartTimestampKey = (userId) => `cart_timestamp_${userId}`;

// Async helper functions
export const saveCartToStorage = async (userId, cartData) => {
  if (!userId) return;
  
  const cartKey = getCartKey(userId);
  const timestampKey = getCartTimestampKey(userId);
  
  try {
    await AsyncStorage.setItem(cartKey, JSON.stringify(cartData));
    await AsyncStorage.setItem(timestampKey, Date.now().toString());
  } catch (error) {
    console.error('Error saving cart:', error);
    throw error;
  }
};

const clearUserCart = async (userId) => {
  if (!userId) return;
  
  const cartKey = getCartKey(userId);
  const timestampKey = getCartTimestampKey(userId);
  
  try {
    await AsyncStorage.multiRemove([cartKey, timestampKey]);
  } catch (error) {
    console.error('Error clearing user cart:', error);
    throw error;
  }
};

const loadCartFromStorage = async (userId) => {
  if (!userId) return [];
  
  const cartKey = getCartKey(userId);
  const timestampKey = getCartTimestampKey(userId);
  
  try {
    const [cartData, timestamp] = await AsyncStorage.multiGet([cartKey, timestampKey]);
    
    if (!cartData[1] || !timestamp[1]) return [];
    
    // Check if cart has expired
    const cartAge = Date.now() - parseInt(timestamp[1], 10);
    const maxAge = CART_LIFESPAN_DAYS * 24 * 60 * 60 * 1000;
    
    if (cartAge > maxAge) {
      await clearUserCart(userId);
      return [];
    }
    
    return JSON.parse(cartData[1]);
  } catch (error) {
    console.error('Error loading cart:', error);
    throw error;
  }
};

const updateCartTimestamp = async (userId) => {
  if (!userId) return;
  
  const timestampKey = getCartTimestampKey(userId);
  try {
    await AsyncStorage.setItem(timestampKey, Date.now().toString());
  } catch (error) {
    console.error('Error updating cart timestamp:', error);
    throw error;
  }
};

const cleanupExpiredCarts = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const timestampKeys = keys.filter(key => key.startsWith('cart_timestamp_'));
    
    for (const timestampKey of timestampKeys) {
      try {
        const timestamp = await AsyncStorage.getItem(timestampKey);
        if (!timestamp) continue;
        
        const cartAge = Date.now() - parseInt(timestamp, 10);
        const maxAge = CART_LIFESPAN_DAYS * 24 * 60 * 60 * 1000;
        
        if (cartAge > maxAge) {
          const userId = timestampKey.replace('cart_timestamp_', '');
          await clearUserCart(userId);
        }
      } catch (error) {
        console.error(`Error cleaning cart for ${timestampKey}:`, error);
      }
    }
  } catch (error) {
    console.error('Error during cart cleanup:', error);
    throw error;
  }
};

// Thunks
export const initializeUserCart = createAsyncThunk(
  'cart/initializeUserCart',
  async (userId, { dispatch }) => {
    try {
      const cart = await loadCartFromStorage(userId);
      await updateCartTimestamp(userId);
      return { userId, cart };
    } catch (error) {
      console.error('Failed to initialize cart:', error);
      throw error;
    }
  }
);

export const addToCartThunk = createAsyncThunk(
  'cart/addToCartThunk',
  async (payload, { getState, dispatch }) => {
    try {
      dispatch(cartSlice.actions.addToCart(payload));
      
      const state = getState();
      const { currentUserId, cartItem } = state.cart;
      
      if (currentUserId) {
        await saveCartToStorage(currentUserId, cartItem);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  }
);

export const removeFromCartThunk = createAsyncThunk(
  'cart/removeFromCartThunk',
  async (payload, { getState, dispatch }) => {
    try {
      dispatch(cartSlice.actions.removeFromCart(payload));
      
      const state = getState();
      const { currentUserId, cartItem } = state.cart;
      
      if (currentUserId) {
        await saveCartToStorage(currentUserId, cartItem);
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  }
);

export const updateCartItemThunk = createAsyncThunk(
  'cart/updateCartItemThunk',
  async (payload, { getState, dispatch }) => {
    try {
      dispatch(cartSlice.actions.updateCartItem(payload));
      
      const state = getState();
      const { currentUserId, cartItem } = state.cart;
      
      if (currentUserId) {
        await saveCartToStorage(currentUserId, cartItem);
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  }
);

export const emptyCartThunk = createAsyncThunk(
  'cart/emptyCartThunk',
  async (_, { getState, dispatch }) => {
    try {
      dispatch(cartSlice.actions.emptyCart());
      
      const state = getState();
      const { currentUserId } = state.cart;
      
      if (currentUserId) {
        console.log("here ish");
        await clearUserCart(currentUserId);
        console.log("cart cleared");
      }
    } catch (error) {
      console.error('Failed to empty cart:', error);
      throw error;
    }
  }
);

export const onOrderSubmitThunk = createAsyncThunk(
  'cart/onOrderSubmitThunk',
  async (payload, { getState, dispatch }) => {
    try {
      dispatch(cartSlice.actions.onOrderSubmit(payload));
      
      const state = getState();
      const { currentUserId, cartItem } = state.cart;
      
      if (currentUserId) {
        await saveCartToStorage(currentUserId, cartItem);
      }
    } catch (error) {
      console.error('Failed to submit order:', error);
      throw error;
    }
  }
);

export const cleanExpiredCartsThunk = createAsyncThunk(
  'cart/cleanExpiredCarts',
  async () => {
    try {
      await cleanupExpiredCarts();
    } catch (error) {
      console.error('Failed to clean expired carts:', error);
      throw error;
    }
  }
);

export const clearCurrentUserThunk = createAsyncThunk(
  'cart/clearCurrentUser',
  async (_, { getState, dispatch }) => {
    try {
      const state = getState();
      const { currentUserId, cartItem } = state.cart;
      
      if (currentUserId) {
        await saveCartToStorage(currentUserId, cartItem);
      }
      
      dispatch(cartSlice.actions.clearCurrentUser());
    } catch (error) {
      console.error('Failed to clear current user:', error);
      throw error;
    }
  }
);

// Slice with synchronous reducers
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItem: [],
    currentUserId: null,
    cartInitialized: false,
    loading: false,
    error: null,
  },
  reducers: {
    addToCart: (state, action) => {
      console.log("main yahan hoon")
      const payload = action.payload;
      
      const chefIndex = state.cartItem.findIndex(
        (chef) =>
          chef.id === payload.user_id &&
          chef.delivery_date === payload.chef.delivery_date &&
          chef.delivery_slot === payload.chef.delivery_slot
      );
      console.log("main yahan hoon2")
      if (chefIndex !== -1) {
        const menuIndex = state.cartItem[chefIndex].menu.findIndex(
          (menu) => menu.id === payload.id
        );

        if (menuIndex !== -1) {
          state.cartItem[chefIndex].menu[menuIndex].quantity = payload.quantity;
        } else {
          state.cartItem[chefIndex].menu.push(payload);
        }
      } else {
        const { chef, ...menuItem } = payload;
        const newChef = {
          ...chef,
          menu: [menuItem],
        };
        console.log("pushing");
        state.cartItem.push(newChef);
        console.log("cartItem", state.cartItem);
      }
    },

    removeFromCart: (state, action) => {
      const { chefIndex, menuIndex } = action.payload;

      if (chefIndex >= 0 && menuIndex >= 0 && state.cartItem[chefIndex]) {
        const updatedMenu = state.cartItem[chefIndex].menu.filter(
          (_, index) => index !== menuIndex
        );

        if (updatedMenu.length === 0) {
          state.cartItem.splice(chefIndex, 1);
        } else {
          state.cartItem[chefIndex].menu = updatedMenu;
        }
      }
    },
    
    updateCartItem: (state, action) => {
      const { chefIndex, menuIndex, key, value } = action.payload;

      if (
        chefIndex >= 0 && 
        menuIndex >= 0 && 
        state.cartItem[chefIndex]?.menu[menuIndex]
      ) {
        state.cartItem[chefIndex].menu[menuIndex][key] = value;
      }
    },
    
    onOrderSubmit: (state, action) => {
      const { chefId, delivery_date, delivery_slot } = action.payload;
      
      state.cartItem = state.cartItem.filter(chef => 
        !(chef.id === chefId && 
          chef.delivery_date === delivery_date && 
          chef.delivery_slot === delivery_slot)
      );
    },

    emptyCart: (state) => {
      state.cartItem = [];
    },
    
    clearCurrentUser: (state) => {
      state.currentUserId = null;
      state.cartItem = [];
      state.cartInitialized = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeUserCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeUserCart.fulfilled, (state, action) => {
        const { userId, cart } = action.payload;
        state.currentUserId = userId;
        state.cartItem = cart;
        state.cartInitialized = true;
        state.loading = false;
      })
      .addCase(initializeUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const {
  addToCart,
  removeFromCart,
  updateCartItem,
  onOrderSubmit,
  emptyCart,
  clearCurrentUser,
} = cartSlice.actions;

export default cartSlice.reducer;