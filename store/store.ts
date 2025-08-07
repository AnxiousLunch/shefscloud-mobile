import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user";
import cartReducer from "./cart"


export const store = configureStore({
    reducer: {
    user: userReducer,
        cart: cartReducer,
    }
})