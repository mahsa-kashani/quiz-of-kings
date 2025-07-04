import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FilePlus } from "lucide-react";
import BackToPage from "../components/BackToPage";
import { useEffect } from "react";
import { useQuestionStore } from "../store/useQuestionStore";

export default function SubmitQuestionPage() {
  const navigate = useNavigate();

  const {
    formData,
    setFormData,
    submitQuestion,
    resetForm,
    categories,
    fetchCategories,
    loading,
    error,
  } = useQuestionStore();

  useEffect(() => {
    resetForm();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      setFormData({
        ...formData,
        category: categories[0].category_name,
        category_id: categories[0].id,
      });
    }
  }, [categories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-base-200 px-4">
        <h2 className="text-2xl font-bold text-error mb-2">Error</h2>
        <p className="text-base-content/70">{error}</p>
        <Link to="/" className="mt-4 btn btn-outline btn-error">
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-base-200">
      <BackToPage page={"question"} />
      <h2 className="text-3xl font-bold text-center text-info mb-10">
        Submit New Question
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitQuestion(navigate);
        }}
        className="bg-base-100 shadow-lg rounded-xl p-6 max-w-2xl mx-auto space-y-4"
      >
        <input
          name="question_text"
          type="text"
          placeholder="Question Text"
          className="input input-bordered w-full"
          value={formData.question_text}
          onChange={(e) =>
            setFormData({ ...formData, question_text: e.target.value })
          }
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            name="option_a"
            placeholder="Option A"
            className="input input-bordered w-full"
            value={formData.options.A}
            onChange={(e) =>
              setFormData({
                ...formData,
                options: {
                  ...formData.options,
                  A: e.target.value,
                },
              })
            }
          />
          <input
            name="option_b"
            placeholder="Option B"
            className="input input-bordered w-full"
            value={formData.options.B}
            onChange={(e) =>
              setFormData({
                ...formData,
                options: {
                  ...formData.options,
                  B: e.target.value,
                },
              })
            }
          />
          <input
            name="option_c"
            placeholder="Option C"
            className="input input-bordered w-full"
            value={formData.options.C}
            onChange={(e) =>
              setFormData({
                ...formData,
                options: {
                  ...formData.options,
                  C: e.target.value,
                },
              })
            }
          />
          <input
            name="option_d"
            placeholder="Option D"
            className="input input-bordered w-full"
            value={formData.options.D}
            onChange={(e) =>
              setFormData({
                ...formData,
                options: {
                  ...formData.options,
                  D: e.target.value,
                },
              })
            }
          />
        </div>

        <div className="flex gap-4">
          <select
            name="correct_option"
            className="select select-bordered w-full"
            value={formData.correct_option}
            onChange={(e) =>
              setFormData({
                ...formData,
                correct_option: e.target.value,
              })
            }
          >
            <option value="A">Correct Option: A</option>
            <option value="B">Correct Option: B</option>
            <option value="C">Correct Option: C</option>
            <option value="D">Correct Option: D</option>
          </select>

          <select
            name="difficulty"
            className="select select-bordered w-full"
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({
                ...formData,
                difficulty: e.target.value,
              })
            }
          >
            {["easy", "medium", "hard"].map((level, index) => (
              <option value={level} key={index}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>

          <select
            name="category"
            className="select select-bordered w-full"
            value={formData.category.category_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const selectedCategory = categories.find(
                (cat) => cat.category_name === selectedName
              );

              setFormData({
                ...formData,
                category: selectedName,
                category_id: selectedCategory?.id || null,
              });
            }}
          >
            {categories.map((cat) => (
              <option value={cat.category_name} key={cat.id}>
                {cat.category_name.charAt(0).toUpperCase() +
                  cat.category_name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-info w-full mt-4"
          disabled={loading}
        >
          <FilePlus className="w-4 h-4 mr-2" />
          Submit Question
        </button>
      </form>
    </div>
  );
}
