import axios, { AxiosInstance } from "axios";

export class ApiClient {
  protected static instance: AxiosInstance = axios.create({
    baseURL: "http://localhost:3000",
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
