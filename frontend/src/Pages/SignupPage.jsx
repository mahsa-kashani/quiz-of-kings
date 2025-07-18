import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";
import LogoHeader from "../components/LogoHeader";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, formData, setFormData, loading, resetForm } = useAuthStore();
  useEffect(() => {
    resetForm();
  }, [resetForm]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <LogoHeader />
      <div className="bg-base-100 shadow-lg rounded-2xl w-full max-w-md p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-primary">Sign Up</h2>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            signup(navigate);
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
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
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
            disabled={
              loading ||
              !formData.username ||
              !formData.email ||
              !formData.password
            }
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>Sign up</>
            )}
          </button>
        </form>

        <p className="text-sm text-center text-base-content/70">
          Already have an account?
          <Link
            to="/login"
            className="text-primary font-medium ml-1 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
