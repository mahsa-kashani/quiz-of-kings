import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

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
    category_id: null,
    difficulty: "easy",
  },
  categories: [],
  userQuestions: [],
  fetchUserQuestions: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/user");
      set({ userQuestions: response.data.questions });
    } catch (err) {
      console.log(err);
      const message = err.response?.data?.message || "Something went wrong";
      set({
        error: message,
        userQuestions: [],
      });
    } finally {
      set({ loading: false });
    }
  },
  fetchCategories: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/categories");
      set({ categories: response.data.categories });
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
        category_id: null,
        difficulty: "easy",
      },
    }),

  submitQuestion: async (navigate) => {
    set({ loading: true });
    try {
      const { formData } = get();
      await axiosInstance.post("/new", formData);
      toast.success("Question submitted for review!");
      get().resetForm();
      navigate("/question/status");
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      set({ loading: false });
    }
  },
}));
