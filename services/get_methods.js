import { api } from "@/api/api";

// Food category on Home
export const handleGetFoodCategory = async () => {
  try {
    const { data } = await api.get("/api/food_types");
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while fetching food category"
    );
  }
};

// All Dishes in a city (all-dishes)
export const handleGetAllDishesOfCity = async (cityId) => {
  try {
    const { data } = await api.get(`/api/all_dishes/${cityId}`);
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while fetching All dishes of city "
    );
  }
};

// Categorize Dishes in a City (categorizeDishes)
export const handleGetCategorizeDishesOfCity = async (foodTypeId, cityId) => {
  try {
    const { data } = await api.get(`/api/category_menus/${foodTypeId}/${cityId}`);
    return data;
  } catch(error){
    console.error("Error While fetching Categorize Dish\n", error)
  }
}

// Popular Dishes in a city (Home page)
export const handleGetPopularDishes = async (cityId) => {
  try {
    const { data } = await api.get(`/api/popular_dishes_with_chef/${cityId}`);
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while fetching Popular dishes "
    );
  }
}

// Popular Chef with dishes (Home page - Most loved chef)
export const handleGetPopularChefWithDishes = async (cityId) => {
  try {
    const { data } = await api.get(`/api/popular_chef_with_dishes/${cityId}`);
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while fetching Popular dishes "
    );
  }
}

// Get All chefs in a city (all-chef page)
export const handleGetAllChefs = async (cityId) => {
  try {
    const { data } = await api.get(`/api/all_chef/${cityId}`);
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while fetching Chefs "
    );
  }
}



// Get Chef with dishes (Chef-detail page)
export const handleGetChefWithDishes = async (chefId, cityId) => {
  try {
    const { data } = await api.get(`/api/chef_with_dishes/${chefId}/${cityId}`);
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while fetching Chef with dishes "
    );
  }
}


// Get Single Dish (dish-detail-single page)
export const handleGetSingleDish = async ( dishId) => {
  try {
    const { data } = await api.get(`/api/single_menu/${dishId.id}`);
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.message || "Something is wrong while Fetching Dishes"
    );
  }
}


export const handleGetCountries = async () => {
  try {
    const { data } = await api.get("/api/countries_api");
    return data;
  } catch (error) {
    console.error("Error While fetching countries\n", error);
  }
};

export const handleGetCitites = async () => {
  try {
    const { data } = await api.get("/api/cities_api");
    return data;
  } catch (error) {
    console.error("Error While fetching cities\n", error);
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

// Chef Orders
export const handleGetChefOrders = async (chefId, authToken) => {
  try {
    const { data } = await api.get(`/api/order`, {
      params: { chef_id: chefId },
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while fetching chef orders"
    );
  }
};

// Update Order Status
export const handleUpdateOrderStatus = async (orderId, status, authToken) => {
  try {
    const { data } = await api.post(
      `/api/update_order_status/${orderId}`, 
      { status },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while updating order status"
    );
  }
};

// Get Pending Orders Count
export const handleGetPendingOrdersCount = async (chefId, authToken) => {
  try {
    const { data } = await api.get(`/api/pending-orders/${chefId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while fetching pending orders count"
    );
  }
};


// ==================== Chef Menu Management ====================

// Create new menu item
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
    if (error.response && error.response.data.errors) {
      err =
        error.response.data.errors[
          Object.keys(error.response.data.errors)[0]
        ][0];
    }
    throw new Error(err || error.message);
  }
};

// Update existing menu item
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
        error.response.data.errors[
          Object.keys(error.response.data.errors)[0]
        ][0];
    } else if (error.response) {
      err = error.response.data.error;
    }
    throw new Error(err || error.message);
  }
};

// Get all dishes for current chef
export const handleGetAllDishes = async (token) => {
  try {
    const { data } = await api.get("/api/menu", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log("Error while fetching dishes", error);
    throw new Error(
      error.message || "Something is wrong while fetching dishes"
    );
  }
};

// Get food types (categories)
export const handleGetFoodType = async (token) => {
  try {
    const { data } = await api.get("/api/food_types", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.log("Error while fetching food types", error);
    throw new Error(
      error.message || "Something is wrong while fetching food types"
    );
  }
};

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