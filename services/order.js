import { api } from "@/api/api";

export const handleCreateOrder = async (token, payload) => {
  try {
    const { data } = await api.post("/api/order", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error) {
    console.log("Error while order ", error);
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
// Get All Orders
export const handleGetOrders = async (token, params) => {
  try {
    const { data } = await api.get("/api/order", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return data;
  } catch (error) {
    console.error("Error While fetching orders\n", error);
  }
};
// Get Single Order
export const handleGetSingleOrder = async (orderId, token, params) => {
  try {
    const { data } = await api.get(`/api/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return data;
  } catch (error) {
    console.error("Error While fetching orders\n", error);
  }
};

export const handleChangeOrderStatus = async (token, payload, id) => {
  try {
    // console.log(token, payload, id);
    const { data } = await api.post("/api/update_order_status/" + id, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Error While updating orders status \n", error);
    if (error.error) {
      throw new Error(error);
    }
    throw new Error(
      error.message || "Something wrong while updating order status"
    );
  }
};
// Get Discount - Promo Code (Checkout page)
export const handleCheckDiscount = async (token, payload) => {
  try {
    const { data } = await api.post("/api/check-discount", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

// Get Pending ORders count for Chef
export const handleGetPendingOrdersForChef = async (shef_id, token) => {
  try {
    const { data } = await api.get(`/api/pending-orders/${shef_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

// Post - Review and Rating of Order
export const handleOrderReviewAndRating = async (token, payload) => {
  try {
    const { data } = await api.post("/api/review", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error);
  }
};

// API call function to post review
export const handleChefPostReview = async (authToken, index, reply) => {
  try {
    // const { data } = await api.post(`/api/review/${index + 1}/reply?reply=${reply}`, {}, {
    const { data } = await api.post(
      `/api/review/${index}/reply?reply=${reply}`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return data;
  } catch (error) {
    console.error("Error in handleChefPostReview:", error);
    throw new Error(error?.response?.data?.message || error);
  }
};
export const handleChefReplyToReply = async (
  authToken,
  reviewId,
  replyToReplyID,
  reply
) => {
  try {
    const { data } = await api.post(
      `review/${reviewId}/reply/${replyToReplyID}?reply=${reply}`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return data;
  } catch (error) {
    console.error("Error in handleChefPostReview:", error);
    throw new Error(error?.response?.data?.message || error);
  }
};

//GetAll -  (Review-detail page)
export const handleGetAllReview = async (token, chefId) => {
  try {
    const { data } = await api.get(`/api/review/chef/${chefId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while fetching Review with chef"
    );
  }
};
//GetAll -  (Review-detail page)
export const handleGetAllUserReview = async (token) => {
  try {
    const { data } = await api.get(`/api/user/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while fetching Review with chef"
    );
  }
};

//GetAll -  (get review replies)
export const handleGetAllReviewReplies = async (token, replyId) => {
  try {
    const { data } = await api.get(`/api/review/${replyId}/replies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Something is wrong while fetching Review with chef"
    );
  }
};
