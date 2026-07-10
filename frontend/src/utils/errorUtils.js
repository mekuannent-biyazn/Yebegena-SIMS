export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const data = error.response.data;

    if (status === 400) {
      return data.message || "Bad request. Please check your input.";
    } else if (status === 401) {
      return "Unauthorized. Please login again.";
    } else if (status === 403) {
      return "Forbidden. You do not have permission.";
    } else if (status === 404) {
      return data.message || "Resource not found.";
    } else if (status === 409) {
      return data.message || "Conflict. Resource already exists.";
    } else if (status === 500) {
      return "Server error. Please try again later.";
    } else {
      return data.message || "An error occurred.";
    }
  } else if (error.request) {
    // Request made but no response
    return "Network error. Please check your connection.";
  } else {
    // Something else happened
    return error.message || "An unexpected error occurred.";
  }
};
