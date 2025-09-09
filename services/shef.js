import axios from "axios";
import { api } from "@/api/api"

export const handleGetIngredients = async (token) => {
  try {
    const { data } = await api.get("/api/ingredients", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while fetching ingredients"
    );
  }
};

export const handleGetSpiceLevel = async (token) => {
  try {
    const { data } = await api.get("/api/spice_levels", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while fetching spice level"
    );
  }
};

export const handleGetFoodType = async (token) => {
  try {
    const { data } = await api.get("/api/food_types", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while fetching food type"
    );
  }
};

export const handleGetPortionType = async (token) => {
  try {
    const { data } = await api.get("/api/portion_types", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while fetching portion type"
    );
  }
};

export const handleGetHeatingInstruction = async (token) => {
  try {
    const { data } = await api.get("/api/instructions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while fetching heating instruction"
    );
  }
};

export const handleGetPlatformRate = async (token) => {
  try {
    const { data } = await api.get("/api/platform_rates", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while fetching platform rate"
    );
  }
};

export const handleGetTags = async (token) => {
  try {
    const { data } = await api.get("/api/tags", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message || "Something is wrong while fetching tags");
  }
};

// Create Menu
export const handleCreateMenu = async (token, payload) => {
  try {
    const { data } = await api.post("/api/menu", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    console.log("Error while create menu ", error);
    let err;
    if (error.response) {
      err =
        error.response.data.errors[
          Object.keys(error.response.data.errors)[0]
        ][0];
    }
    throw new Error(err || error.message);
  }
};

// Update Menu
export const handleUpdateMenu = async (id, token, payload) => {
  try {
    payload._method = "PUT";
    const { data } = await api.post(`/api/menu/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    console.log("Error while update menu ", error);
    let err;
    if (error.response && error.response.data.errors) {
      err =
        error.response.data?.errors[
          Object.keys(error.response.data.errors)[0]
        ][0];
    } else if (error.response) {
      err = error.response.data.error;
    }
    throw new Error(err || error.message);
  }
};

// Get All Dishes
export const handleGetAllDishes = async (token) => {
  try {
    const { data } = await api.get("/api/menu", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while Fetching Dishes"
    );
  }
};

// Create Discount
export const handleCreateDiscount = async (token, payload) => {
  try {
    const { data } = await api.post("/api/discount", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    console.log("Error while creating discount ", error);
    let err;
    if (error.response) {
      err =
        error.response.data.errors[
          Object.keys(error.response.data.errors)[0]
        ][0];
    }
    throw new Error(err || error.message);
  }
};

// Get All Discount
export const handleGetAllDiscount = async (token) => {
  try {
    const { data } = await api.get("/api/discount", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while Fetching Dishes"
    );
  }
};
// Get chef Discount
export const handleGetChefDiscount = async (token) => {
  try {
    const { data } = await api.post(`/api/userdiscount`,{}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while Fetching Dishes"
    );
  }
};
// Update Discount
export const handleUpdateDiscount = async (token, id, payload) => {
  try {
    //payload._method = "PUT";
    //const { data } = await api.post(`/api/discount/${id}/status`, payload, {
      const { data } = await api.post(`/api/discount/edit/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type': 'multipart/form-data'
      },
    });
    return data;
  } catch (error) {
    console.log("Error while updating discount", error);
    let err;
    if (error.response) {
      err =
        error.response.data.errors[
          Object.keys(error.response.data.errors)[0]
        ][0];
    }
    throw new Error(err || error.message);
  }
};

// Update Discount Status
export const handleUpdateDiscountStatus = async (token, id, payload) => {
    try {
        const { data } = await api.post(`/api/discount/${id}/status`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                // 'Content-Type': 'multipart/form-data'
            },
        });
        return data;
    } catch (error) {
        console.log("Error while updating discount status", error);
        let err;
        if (error.response) {
            err =
                error.response.data.errors[
                Object.keys(error.response.data.errors)[0]
                ][0];
        }
        throw new Error(err || error.message);
    }
};

export const handleGetDiscountWithMenus = async (token, id) => {
  try {
    const response = await api.get(`/api/discount/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};
export const handleDeleteDiscount = async (token, id) => {
  try {
    const response = await api.delete(`/api/discount/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};

// Availability Time slot
export const handleGetAvailabilityTimeSlot = async () => {
  try {
    const { data } = await api.get("/api/availability_time_slots");
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
//get transactions
export const handleGetTransaction = async (
  token,
  chefId,
  startDate,
  endDate,
  dishname
) => {
  try {
    // Build query parameters dynamically
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("from_date", startDate);
    if (endDate) queryParams.append("to_date", endDate);
    if (dishname) queryParams.append("dish_name", dishname);
    if (chefId) queryParams.append("chef_id", chefId);

    // Construct the final URL
    const url = `/api/reports/transactions${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;

    // Make the API call
    const { data } = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while fetching transactions"
    );
  }
};
//get post transactions
export const handlePostTransaction = async (
  token,
  chefId,
  startDate,
  endDate,
  dishname
) => {
  try {
    // Build query parameters dynamically
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("from_date", startDate);
    if (endDate) queryParams.append("to_date", endDate);
    if (dishname) queryParams.append("dish_name", dishname);
    if (chefId) queryParams.append("chef_id", chefId);

    // Construct the final URL
    const url = `/api/reports/transactions${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;

    // Make the API call
    const { data } = await api.get(
      url,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while fetching transactions"
    );
  }
};

// get quick report for transacrtion
export const handleGetQuickReport = async (
  token,
  startDate,
  endDate,
  dishname
) => {
  try {
    const { data } = await api.get(
      `/api/reports/quick?from_date=${startDate}&to_date=${endDate}&dish_name=${dishname}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while Fetching Dishes"
    );
  }
};

export const handleUpdateChefProfile = async (token, profileData) => {
  try {
    const formData = new FormData();

    // Append text fields
    formData.append("id", profileData.id);
    formData.append("first_name", profileData.first_name);
    formData.append("last_name", profileData.last_name);
    formData.append("email", profileData.email);
    formData.append("phone", profileData.phone);
    formData.append("bio", profileData.bio);
    formData.append("address", profileData.address);
    formData.append("latitude", profileData.latitude || "");
    formData.append("longitude", profileData.longitude || "");

    // Append images only if they are newly picked (local file URIs)
    if (profileData.profile_pic?.uri) {
      const uriParts = profileData.profile_pic.uri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("profile_pic", {
        uri: profileData.profile_pic.uri,
        name: `profile_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    const res = await api.post("/api/update-profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    formData._parts.forEach(([key, value]) => console.log(key, value));

    // const res = await fetch("http://backend-shef.shefscloud.com/api/update-profile", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: formData,
    // });

    return res; // let the screen decide how to handle it
  } catch (error) {
    console.error("Error updating chef profile:", error);
    throw error;
  }
};

//get chef address
export const handleGetChefAddress = async (token, id) => {
  try {
    const { data } = await api.get(`/api/chef-address/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while Fetching Dishes"
    );
  }
};

// distance calculate
export const handleGetDistance = async (origin, destination) => {
  try {
    const GOOGLE_MAPS_API_KEY = "AIzaSyBiA5URXPErjPFP5LqtYlEjo62sbze_2SE";
    // const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
    // const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=d-10, PECHS Block 9, Karachi&key=${GOOGLE_MAPS_API_KEY}`;

    const { data } = await api.get(apiUrl, {
      headers: {
        // Authorization: `Bearer ${token}`, // Add your token if required by your app
      },
    });

    if (data.rows[0].elements[0].status !== "OK") {
      throw new Error("Unable to calculate distance. Check coordinates.");
    }

    return {
      distance: data.rows[0].elements[0].distance.text,
      duration: data.rows[0].elements[0].duration.text,
    };
  } catch (error) {
    console.error(error);
    throw new Error(
      error.message || "Something went wrong while calculating distance"
    );
  }
};
// get address from coordinates
export const handleGetUserAddress = async (latitude, longitude) => {
  try {
    if (!latitude || !longitude) {
      throw new Error("Latitude and Longitude are required.");
    }

    const GOOGLE_MAPS_API_KEY = "AIzaSyBiA5URXPErjPFP5LqtYlEjo62sbze_2SE";
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

    const { data } = await api.get(apiUrl);

    if (data.status === "OK") {
      // const address = data.results[0]?.formatted_address;
      const address = data.results[0];
      return address || "No address found for the given coordinates.";
    } else {
      throw new Error(`Geocoding API error: ${data.status}`);
    }
  } catch (error) {
    console.error(error);
    throw new Error(
      error.message || "Something went wrong while getting address"
    );
  }
};

export const handleGetBykeaAuthorization = async (payload) => {
  try {
    const { data } = await axios.post(
      "https://sandbox-raptor.bykea.dev/v2/authenticate/customer",
      // headers: { Authorization: `Bearer ${token}` },
      payload
    );
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while Fetching Bykea Authorization"
    );
  }
};
export const handleGetBykeaFare = async (payload, bykeaToken) => {
  try {
    const { data } = await axios.post(
      "https://sandbox.bykea.dev/api/v2/bookings/fareEstimate", // Removed extra space
      payload, // Payload should come as the second parameter
      {
        headers: {
          "x-api-customer-token": `${bykeaToken}`, // Correct placement for headers
        },
      }
    );
    return data;
  } catch (error) {
    console.error(
      "Error fetching Bykea fare estimate:",
      error.response || error
    );
    throw new Error(
      error.message || "Something went wrong while fetching Bykea Authorization"
    );
  }
};

//get stats
export const handleGetStats = async (token, chefId) => {
  try {
    const url = `/api/chef/stats/${chefId}`;

    // Make the API call
    const { data } = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message || "Something is wrong while fetching stats");
  }
};


