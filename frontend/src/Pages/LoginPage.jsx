import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

export default function LoginPage() {
  const { login, formData, setFormData, loading, resetForm } = useAuthStore();
  useEffect(() => {
    resetForm();
  }, [resetForm]);
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-base-100 shadow-lg rounded-2xl w-full max-w-md p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-primary">Login</h2>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <input
            type="text"
            placeholder="Username"
            minLength={3}
            maxLength={30}
            className="input input-bordered w-full"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            minLength={6}
            className="input input-bordered w-full"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || !formData.username || !formData.password}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>Login</>
            )}
          </button>
        </form>

        <p className="text-sm text-center text-base-content/70">
          Don’t have an account?
          <Link
            to="/signup"
            className="text-primary font-medium ml-1 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
