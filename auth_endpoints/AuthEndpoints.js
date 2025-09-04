import { api } from "../api/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const handleUserLogin = async (credentials) => {
  try {
    const { data } = await api.post("/api/login", credentials);
    try {
      await Promise.all([
        AsyncStorage.setItem("user", JSON.stringify(data.data)),
        AsyncStorage.setItem("auth", data.data.access_token)
      ]);
    } catch (storageError) {
      await AsyncStorage.multiRemove(["user", "auth"]);
      throw storageError;
    }
    
    return data;
  } catch (error) {
    throw new Error(error.response?.data.message || error.message);
  }
};

export const handleUserSignUp = async (credentials) => {
  try {
    const { data } = await api.post("/api/register", credentials);
    return data;
  } catch (error) {
    if (error.response.data.message && typeof error.response.data.message!=="string" ) {
      // console.log("response ", error.response)
      //Error Object
      const errorObj = error.response.data.message;
      // Error object's key OR keys
      const errorObjKey = Object.keys(error.response.data.message)[0];
      //Array of Error message - getting first message
      throw new Error(errorObj[errorObjKey][0]);
    }

    throw new Error(error.message);
  }
};

export const handleChefSignUp = async (credentials) => {
  try {
    const { data } = await api.post("/api/register", credentials, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    if (error.response) {
      //Error Object
      const errorObj = error.response.data.errors;
      // Error object's key OR keys
      const errorObjKey = Object.keys(error.response.data.errors)[0];
      //Array of Error message - getting first message
      throw new Error(errorObj[errorObjKey][0]);
    }

    throw new Error(error.message);
  }
};

export const handleShowProfile = async (token) => {
  try {
    const { data } = await api.get("/api/show-profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log("error while calling show profile ", error);
  }
};

export async function handleUpdateProfile(token, formData) {
  return fetch("http://backend-shef.shefscloud.com/api/update-profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

// Forget Password
export const handleForgetPassword = async (credentials) => {
  try {
    // const { data } = await api.post("/api/forget-password", credentials);
    const { data } = await api.post(
      `/api/forget-password?email=${credentials.email}`
    );
    return data;
  } catch (error) {
    console.log(error);
    if (error.response.data.errors) {
      //Error Object
      const errorObj = error.response.data.errors;
      // Error object's key OR keys
      const errorObjKey = Object.keys(error.response.data.errors)[0];
      //Array of Error message - getting first message
      throw new Error(errorObj[errorObjKey][0]);
    }
    if (
      error.response.data.message &&
      typeof error.response.data.message === "string"
    ) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message);
  }
};
// Reset Password - Verify token
export const handleForgetTokenVerification = async (token) => {
  try {
    const { data } = await api.post(`/api/verify-token?token=${token}`);
    return data;
  } catch (error) {
    if (
      error.response.data.message &&
      typeof error.response.data.message === "string"
    ) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message);
  }
};
// Reset Password - Change Password
export const handlePostResetPassword = async (token, credentials) => {
  try {
    // const { data } = await api.post(`/api/resetpassword?token=${token}`, credentials);
    const { data } = await api.post(
      `/api/reset-password?token=${token}&password=${credentials.password}&password_confirmation=${credentials.password_confirmation}`
    );
    return data;
  } catch (error) {
    if (
      error.response.data.message &&
      typeof error.response.data.message === "string"
    ) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message);
  }
};