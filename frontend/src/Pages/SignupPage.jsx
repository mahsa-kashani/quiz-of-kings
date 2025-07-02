import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-base-100 shadow-lg rounded-2xl w-full max-w-md p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-primary">Sign Up</h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="input input-bordered w-full"
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="input input-bordered w-full"
            required
          />

          <button type="submit" className="btn btn-primary w-full">
            Sign Up
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
