import { create } from "zustand";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/questions";

const axiosInstance = axios.create({ baseURL: BASE_URL });

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);
export const useQuestionStore = create((set, get) => ({
  loading: false,
  error: null,
  formData: {
    question_text: "",
    options: {
      A: "",
      B: "",
      C: "",
      D: "",
    },
    correct_option: "A",
    category: "",
    difficulty: "easy",
  },
  categories: [],
  fetchCategories: async () => {
    set({ loading: true });
    try {
      const response = axiosInstance.get("/categories");
      set({ categories });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Something went wrong";
      set({
        error: message,
        categories: [],
      });
    } finally {
      set({ loading: false });
    }
  },
  setFormData: (formData) => set({ formData }),
  resetForm: () =>
    set({
      formData: {
        question_text: "",
        options: {
          A: "",
          B: "",
          C: "",
          D: "",
        },
        correct_option: "A",
        category: "",
        difficulty: "easy",
      },
    }),

  submitQuestion: async (navigate) => {
    try {
      // TODO: Replace with real API call
      console.log("Submitting question", formData);
      toast.success("Question submitted for review!");
      navigate("/question/status");
    } catch (err) {
      toast.error("Failed to submit question");
    }
  },
}));
