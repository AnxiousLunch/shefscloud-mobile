import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "@/types/types";

export interface UserInfo {
  access_token: string;
  bio: string | null;
  contract_signed: string | null;
  cover_pic: string | null;
  created_at: string;
  deleted_at: string | null;
  email: string;
  email_verified_at: string;
  first_name: string;
  food_handle_certificate: string | null;
  id: number;
  is_active: number;
  is_admin: number;
  is_chef: number;
  last_name: string;
  last_order_address: {
    order_delivery_address: Address;
  };
  order_capacity: number | null;
  phone: string;
  profile_pic: string | null;
  updated_at: string;
  user_addresses: any[]; 
}

type Address = {
  address_type: "home" | "apartment" | "office" | string; // string fallback for unexpected values

  // Apartment fields
  apartment_addition_direction: string;
  apartment_apartment_no: string;
  apartment_city: string;
  apartment_floor: string;
  apartment_name: string;
  apartment_street_address: string;

  // Home fields
  home_addition_direction: string;
  home_city: string;
  home_house_no: string;
  home_street_address: string;

  // Office fields
  office_addition_direction: string;
  office_building_no: string;
  office_city: string;
  office_company: string;
  office_department: string;
  office_floor: string;
  office_street_address: string;

  // Common fields
  city: string;
  delivery_instruction: string;
  delivery_notes: string;
  latitude: number;
  longitude: number;
  line2: string;
  name: string;
  phone: string;
  postal_code: string;
  state: string;
};


export interface UserState {
  userInfo: UserInfo | null;
  authToken: string;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Async thunk to load user data from AsyncStorage
export const loadUserFromStorage = createAsyncThunk<
  { userInfo: UserInfo | null; authToken: string },
  void
>(
  'user/loadFromStorage',
  async () => {
    try {
      const userInfo = await AsyncStorage.getItem("user");
      const authToken = await AsyncStorage.getItem("auth");

      return {
        userInfo: userInfo ? JSON.parse(userInfo) as UserInfo : null,
        authToken: authToken || ""
      };
    } catch (error) {
      console.error('Error loading user from storage:', error);
      return {
        userInfo: null,
        authToken: ""
      };
    }
  }
);

// Async thunk to save user data to AsyncStorage
export const saveUserToStorage = createAsyncThunk<
  { userInfo: UserInfo; authToken: string },
  { userInfo: UserInfo; authToken: string }
>(
  'user/saveToStorage',
  async ({ userInfo, authToken }) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userInfo));
      await AsyncStorage.setItem("auth", authToken);
      return { userInfo, authToken };
    } catch (error) {
      console.error('Error saving user to storage:', error);
      throw error;
    }
  }
);

// Async thunk to clear user data from AsyncStorage
export const clearUserFromStorage = createAsyncThunk<boolean, void>(
  'user/clearFromStorage',
  async () => {
    try {
      await AsyncStorage.removeItem("auth");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("cart");
      return true;
    } catch (error) {
      console.error('Error clearing user from storage:', error);
      throw error;
    }
  }
);

const initialState: UserState = {
  userInfo: null,
  authToken: "",
  isLoading: false,
  error: null,
  isInitialized: false
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<{ data: UserInfo }>) => {
      state.userInfo = action.payload.data;
      state.authToken = action.payload.data.access_token;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = action.payload.userInfo;
        state.authToken = action.payload.authToken;
        state.isInitialized = true;
      })
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? null;
        state.isInitialized = true;
      })
      .addCase(saveUserToStorage.fulfilled, (state) => {})
      .addCase(saveUserToStorage.rejected, (state, action) => {
        state.error = action.error.message ?? null;
      })
      .addCase(clearUserFromStorage.fulfilled, (state) => {
        state.userInfo = null;
        state.authToken = "";
        state.error = null;
      })
      .addCase(clearUserFromStorage.rejected, (state, action) => {
        state.error = action.error.message ?? null;
      });
  }
});

export const { loginUser, updateUser, clearError } = userSlice.actions;

// Custom action creator that combines loginUser and saveUserToStorage
export const loginAndSaveUser = (userData: { data: UserInfo }) => async (dispatch: AppDispatch) => {
  dispatch(loginUser(userData));
  await dispatch(saveUserToStorage({
    userInfo: userData.data,
    authToken: userData.data.access_token
  }));
};

export const signOutUser = () => async (dispatch: AppDispatch) => {
  await dispatch(clearUserFromStorage());
};

export default userSlice.reducer;