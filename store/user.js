import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';


// Async thunk to load user data from AsyncStorage
export const loadUserFromStorage = createAsyncThunk(
  'user/loadFromStorage',
  async () => {
    try {
      const userInfo = await AsyncStorage.getItem("user");
      const authToken = await AsyncStorage.getItem("auth");

      return {
        userInfo: userInfo ? JSON.parse(userInfo)  : null,
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
export const saveUserToStorage = createAsyncThunk(
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
export const clearUserFromStorage = createAsyncThunk(
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

const initialState = {
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
    loginUser: (state, action) => {
      state.userInfo = action.payload.data;
      state.authToken = action.payload.data.access_token;
      state.error = null;
    },
    updateUser: (state, action) => {
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
export const loginAndSaveUser = (userData) => async (dispatch) => {
  dispatch(loginUser(userData));
  await dispatch(saveUserToStorage({
    userInfo: userData.data,
    authToken: userData.data.access_token
  }));
};

export const signOutUser = () => async (dispatch) => {
  await dispatch(clearUserFromStorage());
};

export default userSlice.reducer;
