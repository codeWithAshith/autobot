export const errorHandler = (error) => {
  const { code, message, status, errors } = error?.response?.data?.error || {};
  return {
    code: code || 500,
    message: errors[0]?.message || message || "Unknown error occurred",
    status: status || "INTERNAL_SERVER_ERROR",
  };
};

export const fetchVideoFile = async (url, fileName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch video file: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new File([blob], `${fileName}.mp4`, { type: blob.type });
  } catch (error) {
    console.error("Error fetching video file:", error);
    throw error;
  }
};
