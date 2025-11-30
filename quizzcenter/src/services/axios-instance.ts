import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACK_END_URL, // thay URL nếu BE của mày khác
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Tự động thêm accessToken vào header mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
