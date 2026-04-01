import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ownerAPI } from "../utils/api";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { owner } = useAuth();
  const [users, setUsers] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, keyRes] = await Promise.all([
        ownerAPI.getUsers(),
        ownerAPI.getApiKey(),
      ]);
      setUsers(usersRes.data.users);
      setApiKey(keyRes.data.api_key);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone || "", address: user.address || "" });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await ownerAPI.updateUser(editUser.id, editForm);
      toast.success("User updated");
      setEditUser(null);
      fetchData();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-secondary" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h5 className="fw-semibold mb-1">Dashboard</h5>
          <p className="text-secondary small mb-0">
            Welcome back, {owner?.name}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="bg-white border rounded-3 p-3">
            <p className="text-secondary small mb-1">Total Users</p>
            <h4 className="fw-semibold mb-0">{users.length}</h4>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white border rounded-3 p-3">
            <p className="text-secondary small mb-1">Verified Users</p>
            <h4 className="fw-semibold mb-0">
              {users.filter((u) => u.email_verified).length}
            </h4>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white border rounded-3 p-3">
            <p className="text-secondary small mb-1">Pending Verification</p>
            <h4 className="fw-semibold mb-0">
              {users.filter((u) => !u.email_verified).length}
            </h4>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white border rounded-3 p-3 mb-4">
        <p className="small fw-medium mb-2">Your API Key</p>
        <div className="d-flex gap-2 align-items-center">
          <div className="api-key-box flex-grow-1">{apiKey}</div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={copyKey}
            style={{ whiteSpace: "nowrap" }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border rounded-3 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="fw-medium mb-0">Users</p>
          <input
            className="form-control form-control-sm"
            placeholder="Search..."
            style={{ maxWidth: 200 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-secondary text-center py-4 small">
            No users found.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="align-middle">{u.name}</td>
                    <td className="align-middle text-secondary">{u.email}</td>
                    <td className="align-middle">
                      {u.email_verified ? (
                        <span className="badge bg-success-subtle text-success">
                          Verified
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="align-middle text-secondary small">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="align-middle text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-sm rounded-3">
              <div className="modal-header border-0 pb-0">
                <h6 className="modal-title fw-semibold">Edit User</h6>
                <button
                  className="btn-close"
                  onClick={() => setEditUser(null)}
                />
              </div>
              <div className="modal-body">
                {["name", "email", "phone", "address"].map((field) => (
                  <div className="mb-3" key={field}>
                    <label className="form-label small fw-medium text-capitalize">
                      {field}
                    </label>
                    <input
                      className="form-control"
                      value={editForm[field]}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, [field]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setEditUser(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-dark btn-sm"
                  onClick={saveEdit}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
