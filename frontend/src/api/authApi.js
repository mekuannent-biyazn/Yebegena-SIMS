import api from "./axios";

export const registerUser = async (data) => {
  const response = await api.post("/register", data);

  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/login", data);

  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.post("/change-password", data);

  return response.data;
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/logout");
    return response.data;
  } catch (error) {
    // Even if the API call fails, we should still clear local data
    console.error("Logout API error:", error);
    return { success: true };
  }
};
