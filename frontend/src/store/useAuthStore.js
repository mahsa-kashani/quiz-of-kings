import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:3000/api/auth";
const axiosInstance = axios.create({ baseURL: BASE_URL });

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  formData: {
    username: "",
    email: "",
    password: "",
  },
  setFormData: (formData) => set({ formData }),
  resetForm: () =>
    set({
      formData: {
        username: "",
        email: "",
        password: "",
      },
    }),
  signup: async (navigate) => {
    set({ loading: true });
    try {
      const { formData } = get();
      const response = await axiosInstance.post("/signup", formData);
      set({ token: response.data.token, user: response.data.user });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("you've signed up successfully!");
      navigate("/dashboard");
      get().resetForm();
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      localStorage.setItem("token", null);
      localStorage.setItem("user", null);
      set({ user: null, token: null });
      toast.error(message);
    } finally {
      set({ loading: false });
    }
  },
  login: async (navigate) => {
    set({ loading: true });
    try {
      const { formData } = get();
      const response = await axiosInstance.post("/login", formData);
      set({ token: response.data.token, user: response.data.user });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("you've logged in successfully!");
      navigate("/dashboard");
      get().resetForm();
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Something went wrong";
      localStorage.setItem("token", null);
      localStorage.setItem("user", null);
      set({ user: null, token: null });
      toast.error(message);
    } finally {
      set({ loading: false });
    }
  },
}));
