import axios, { AxiosInstance } from "axios";

export class ApiClient {
  protected static instance: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BACK_END_URL,
  });

  static setup() {
    this.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token found");
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }
}
ApiClient.setup();
