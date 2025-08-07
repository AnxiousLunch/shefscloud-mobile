// cartMiddleware.js
import {saveCartToStorage} from '@/store/cart'


export const cartMiddleware = store => next => async action => {
  const result = next(action);
  
  const state = store.getState();
  const { currentUserId, cartItem } = state.cart;
  
  const cartActions = [
    'cart/addToCart',
    'cart/removeFromCart',
    'cart/updateCartItem',
    'cart/onOrderSubmit',
  ];
  
  if (cartActions.includes(action.type) && currentUserId) {
    try {
      await saveCartToStorage(currentUserId, cartItem);
    } catch (error) {
      console.error('Error saving cart after action:', error);
    }
  }
  
  return result;
};