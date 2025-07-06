import { useEffect } from "react";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-hot-toast";
import BackToPage from "../../components/BackToPage";

export default function Moderator() {
  const { users, fetchUsers, toggleBan, loading, error } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (user, isBanned) => {
    await toggleBan(user.id, !isBanned);
    await fetchUsers();
  };

  return (
    <div className="min-h-screen bg-base-200 px-6 py-10">
      <BackToPage page="home" />
      <h2 className="text-4xl font-bold text-center text-info mb-8">
        User Management
      </h2>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      ) : error ? (
        <p className="text-center text-error">{error}</p>
      ) : users?.length === 0 ? (
        <p className="text-center text-base-content/70 text-xl">
          No users found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra bg-base-100 rounded-xl shadow">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id}>
                  <td>{idx + 1}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.user_role}</td>
                  <td>
                    {u.is_banned ? (
                      <span className="badge text-error">Banned</span>
                    ) : (
                      <span className="badge text-success">Active</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      className={`btn btn-sm ${
                        u.is_banned
                          ? "text-success btn-ghost"
                          : "text-error btn-ghost"
                      }`}
                      onClick={() => handleToggleBan(u, u.is_banned)}
                    >
                      {u.is_banned ? "Unban" : "Ban"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
