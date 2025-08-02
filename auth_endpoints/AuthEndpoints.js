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