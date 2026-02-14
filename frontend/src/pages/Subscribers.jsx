import { useEffect, useState } from "react";
import { Mail, Search, RotateCcw, Trash2, UserCheck, UserX, Upload, Send } from "lucide-react";
import api from "../api/axios.js";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [toast, setToast] = useState(null);
  const [autoBlogEmail, setAutoBlogEmail] = useState(false);
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false);

  // Broadcast email state
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    subject: '',
    htmlContent: ''
  });
  const [sending, setSending] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 20;

  const loadSubscribers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('limit', limit);

      const res = await api.get(`/subscribers?${params}`);
      setSubscribers(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      setError("Unable to load subscribers.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get("/subscribers/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadStats();
  }, []);
  useEffect(() => {
  api.get("/admin/settings")
    .then(res => {
      setAutoBlogEmail(res.data.data.autoBlogEmail);
    })
    .catch(() => {});
}, []);
useEffect(() => {
  console.log("Confirm modal:", showBroadcastConfirm);
}, [showBroadcastConfirm]);


  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      await api.delete(`/subscribers/${deleteId}`);
      setSubscribers((prev) => prev.filter((s) => s._id !== deleteId));
      showToast("Subscriber deleted successfully");
      loadStats();
    } catch {
      showToast("Failed to delete subscriber", "error");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/subscribers/${id}`, { status: newStatus });
      setSubscribers((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, status: newStatus } : s
        )
      );
      showToast(`Subscriber ${newStatus === 'subscribed' ? 'resubscribed' : 'unsubscribed'} successfully`);
      loadStats();
    } catch {
      showToast("Failed to update subscriber", "error");
    }
  };

  const handleBroadcast = async () => {
  if (!broadcastData.subject || !broadcastData.htmlContent) {
    showToast("Please fill in all fields", "error");
    return;
  }

  setSending(true);
  try {
    const response = await api.post('/subscribers/broadcast', broadcastData);
    showToast(response.data.message);
    setShowBroadcast(false);
    setBroadcastData({ subject: '', htmlContent: '' });
  } catch (error) {
    showToast(
      error.response?.data?.error || "Failed to send broadcast email",
      "error"
    );
  } finally {
    setSending(false);
  }
};


  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesDate =
      !dateFilter ||
      new Date(subscriber.subscribedAt).toISOString().split("T")[0] === dateFilter;

    return matchesDate;
  });

  return (
    <section>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm shadow-lg border backdrop-blur-xl
          ${toast.type === "error"
            ? "bg-red-500/20 text-red-200 border-red-500/30"
            : "bg-green-500/20 text-green-200 border-green-500/30"}`}>
          {toast.message}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <p className="text-sm text-white/60 mb-2">Total Subscribers</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <p className="text-sm text-white/60 mb-2">Active</p>
            <p className="text-3xl font-bold text-green-400">{stats.subscribed}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <p className="text-sm text-white/60 mb-2">Unsubscribed</p>
            <p className="text-3xl font-bold text-red-400">{stats.unsubscribed}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <p className="text-sm text-white/60 mb-2">Recent (30 days)</p>
            <p className="text-3xl font-bold text-purple-400">{stats.recentSubscribers}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* LEFT: Search + Filters + Reset */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-64 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 pl-10 text-sm text-white placeholder-white/40 focus:border-white/20 focus:bg-white/10 focus:outline-none transition"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 text-sm text-white focus:border-white/20 focus:bg-white/10 focus:outline-none transition"
          >
            <option value="all" className="bg-black text-white">All Status</option>
            <option value="subscribed" className="bg-black text-white">Subscribed</option>
            <option value="unsubscribed" className="bg-black text-white">Unsubscribed</option>
          </select>

          {/* Date */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 text-sm text-white focus:border-white/20 focus:bg-white/10 focus:outline-none transition"
          />

          {/* Reset */}
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setDateFilter("");
              setPage(1);
            }}
            className="h-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-4 text-sm text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">

  {/* Auto Email Toggle */}
  <div
    onClick={async () => {
      const nextValue = !autoBlogEmail;
      setAutoBlogEmail(nextValue);

      try {
        await api.put("/admin/settings", {
          autoBlogEmail: nextValue
        });

        showToast(
          nextValue
            ? "Auto email enabled for new blogs"
            : "Auto email disabled"
        );
      } catch {
        showToast("Failed to update auto email setting", "error");
        setAutoBlogEmail(!nextValue);
      }
    }}
    className={`cursor-pointer flex items-center gap-3 px-4 h-10 rounded-xl border backdrop-blur transition
      ${autoBlogEmail
        ? "bg-green-500/20 border-green-500/30 text-green-300"
        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}
  >
    <span className="text-sm whitespace-nowrap">
      Auto Email on New Blog
    </span>

    <div className={`w-10 h-5 rounded-full relative transition
      ${autoBlogEmail ? "bg-green-500" : "bg-gray-600"}`}>
      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition
        ${autoBlogEmail ? "right-0.5" : "left-0.5"}`} />
    </div>
  </div>

  {/* Existing Broadcast Button */}
  <Button
    onClick={() => setShowBroadcast(true)}
    className="flex items-center gap-2"
  >
    <Send className="w-4 h-4" />
    Send Broadcast
  </Button>
</div>

      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
        {loading && <div className="p-6"><Loader /></div>}
        {error && <p className="p-6 text-sm text-red-300">{error}</p>}
        {!loading && !error && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Subscribed At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber._id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-5">
                    <div className="font-medium text-white">
                      {subscriber.name}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-white/70">
                    {subscriber.email}
                  </td>
                  <td className="px-6 py-5 text-white/70">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      subscriber.status === 'subscribed' 
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-red-500/20 text-red-200 border border-red-500/30'
                    }`}>
                      {subscriber.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-white/70">
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      {/* Toggle Status */}
                      <button
                        onClick={() => handleStatusChange(
                          subscriber._id,
                          subscriber.status === 'subscribed' ? 'unsubscribed' : 'subscribed'
                        )}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                          subscriber.status === 'subscribed'
                            ? 'border-white/10 text-red-400/70 hover:border-red-500/30 hover:text-red-300 hover:bg-red-500/10'
                            : 'border-white/10 text-green-400/70 hover:border-green-500/30 hover:text-green-300 hover:bg-green-500/10'
                        }`}
                        title={subscriber.status === 'subscribed' ? 'Unsubscribe' : 'Resubscribe'}
                      >
                        {subscriber.status === 'subscribed' ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteId(subscriber._id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-red-400/70 transition hover:border-red-500/30 hover:text-red-300 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-white/50">
                    No subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-sm text-white/60">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} subscribers
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">
              Delete subscriber?
            </h3>
            <p className="mt-2 text-sm text-white/60">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Broadcast Confirmation Modal */}
{showBroadcastConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-white">
        Send broadcast email?
      </h3>
      <p className="mt-2 text-sm text-white/60">
        This email will be sent to {stats?.subscribed || 0} active subscribers.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setShowBroadcastConfirm(false)}
          disabled={sending}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            setShowBroadcastConfirm(false);
            await handleBroadcast();
          }}
          disabled={sending}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}


      {/* Broadcast Email Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Send Broadcast Email</h2>
              <p className="text-sm text-white/60 mt-1">
                This will be sent to {stats?.subscribed || 0} active subscribers
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={broadcastData.subject}
                  onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur text-white placeholder-white/40 focus:border-white/20 focus:bg-white/10 focus:outline-none transition"
                  placeholder="Your email subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email Content (HTML)
                </label>
                <textarea
                  value={broadcastData.htmlContent}
                  onChange={(e) => setBroadcastData({ ...broadcastData, htmlContent: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur text-white placeholder-white/40 focus:border-white/20 focus:bg-white/10 focus:outline-none transition font-mono text-sm"
                  placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                />
                <p className="text-xs text-white/40 mt-2">
                  Note: Unsubscribe link will be automatically added to the bottom
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBroadcast(false);
                  setBroadcastData({ subject: '', htmlContent: '' });
                }}
                disabled={sending}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 transition"
              >
                Cancel
              </button>

              <button
  onClick={() => {
    setShowBroadcast(false);      // 👈 close editor
    setShowBroadcastConfirm(true); // 👈 then open confirm
  }}
  disabled={sending}
  className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50 transition flex items-center gap-2"
>
  <Send className="w-4 h-4" />
  Send to All Subscribers
</button>


            </div>
          </div>
        </div>
      )}
    </section>
  );
}