import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Check, X, Clock, AlertCircle, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import api from "../services/api";
import { useNotify } from "../context/NotifyContext";
import useSwapSSE from "../hooks/useSwapSSE";

/**
 * Requests Page
 * - Keeps your EXACT logic & API calls
 * - Upgrades only the UI to: Tabs + soft badges + hover action bar (Version Y)
 * - Mixed list with Incoming/Outgoing badge (Option B)
 * - Event text style Option 2 (includes date)
 */
export default function Requests() {
  const { user } = useAuth(); // user = userId (string)
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending"); // default to Pending tab
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const { setIsRequestsPageOpen, markRequestsViewed } = useNotify();

  // ---------- Logic preserved ----------
  useEffect(() => {
    if (user) fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/getSwap/${user?.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = Array.isArray(res.data) ? res.data : [];

      // Transform backend → UI format (UNCHANGED)
      const formatted = data.map((s) => {
        const isOutgoing = s.fromUser?._id === user?.id;
        const type = isOutgoing ? "outgoing" : "incoming";
        const status = (s.status || "pending").toUpperCase();

        const fromName = s.fromUser?.name || "Unknown";
        const toName = s.toUser?.name || "Unknown";

        const fromEvent = s.fromEvent || {};
        const toEvent = s.toEvent || {};

        const theirEvent = type === "incoming" ? fromEvent : toEvent;
        const yourEvent = type === "incoming" ? toEvent : fromEvent;

        return {
          id: s._id,
          type,
          status,
          from: fromName,
          to: toName,
          theirEvent: {
            title: theirEvent.title || "Untitled",
            startTime: theirEvent.startTime,
            endTime: theirEvent.endTime,
          },
          yourEvent: {
            title: yourEvent.title || "Untitled",
            startTime: yourEvent.startTime,
            endTime: yourEvent.endTime,
          },
        };
      });

      setRequests(formatted);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useSwapSSE({
    onRefreshRequests: fetchRequests,
    onRefreshDashboard: undefined,
  });

  useEffect(() => {
    if (!user) return;
    setIsRequestsPageOpen(true);
    markRequestsViewed();
    fetchRequests();
    return () => setIsRequestsPageOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAccept = async (id) => {
    try {
      await api.post(
          `/responceToRequest/${id}`,
          { isAccepted: true },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "ACCEPTED" } : r)));
      toastOnce("Swap request accepted!");
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(
          `/responceToRequest/${id}`,
          { isAccepted: false },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)));
      toastOnce("Swap request declined.");
    } catch (err) {
      console.error("Failed to reject request:", err);
    }
  };

  const toastOnce = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // ---------- Derived state ----------
  const filteredRequests = useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "pending") return requests.filter((r) => r.status === "PENDING");
    if (filter === "accepted") return requests.filter((r) => r.status === "ACCEPTED");
    if (filter === "rejected") return requests.filter((r) => r.status === "REJECTED");
    return requests;
  }, [requests, filter]);

  const incomingPending = requests.filter((r) => r.type === "incoming" && r.status === "PENDING");
  const outgoingPending = requests.filter((r) => r.type === "outgoing" && r.status === "PENDING");
  const allPending = requests.filter((r) => r.status === "PENDING");

  // ---------- UI ----------
  if (loading) {
    return (
        <Layout>
          <div className="p-8">
            <SkeletonHeader />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
            <div className="mt-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <div className="p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
              <p className="text-gray-600 mt-1 text-sm">Manage your incoming & outgoing requests</p>
            </div>
          </div>

          {/* Success toast */}
          {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
                {success}
              </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Total Requests" value={requests.length} color="blue" />
            <StatCard label="Pending" value={allPending.length} icon={Clock} color="yellow" />
            <StatCard label="Incoming" value={incomingPending.length} color="purple" />
            <StatCard label="Outgoing" value={outgoingPending.length} color="green" />
          </div>

          {/* Tabs (Primary) */}
          <div className="flex items-center gap-2 flex-wrap">
            <PrimaryTab label="Pending" active={filter === "pending"} onClick={() => setFilter("pending")} />
            <PrimaryTab label="Accepted" active={filter === "accepted"} onClick={() => setFilter("accepted")} />
            <PrimaryTab label="Rejected" active={filter === "rejected"} onClick={() => setFilter("rejected")} />
            <PrimaryTab label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          </div>

          {/* Requests List */}
          <div className="space-y-5">
            {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                    <RequestCard
                        key={req.id}
                        request={req}
                        onAccept={() => handleAccept(req.id)}
                        onReject={() => handleReject(req.id)}
                    />
                ))
            ) : (
                <EmptyState hasAny={requests.length > 0} />
            )}
          </div>
        </div>
      </Layout>
  );
}

// =============== Components ===============
function PrimaryTab({ label, active, onClick }) {
  return (
      <button
          onClick={onClick}
          className={`px-4 py-2 rounded-xl border font-medium transition-all select-none
        ${active ? "bg-blue-600 text-white border-blue-600 shadow" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
      >
        {label}
      </button>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
      <div className={`rounded-2xl border p-4 ${colorClasses[color]} flex items-center gap-3`}>
        <div className="shrink-0 w-9 h-9 rounded-xl bg-white/60 border border-black/5 flex items-center justify-center">
          {Icon ? <Icon className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
        </div>
      </div>
  );
}

function EmptyState({ hasAny }) {
  return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-700 text-lg">
          {hasAny ? "No requests match this tab" : "No swap requests yet"}
        </p>
      </div>
  );
}

function BadgeType({ type }) {
  const isIncoming = type === "incoming";
  return (
      <span className={`px-2 py-1 text-xs rounded font-medium select-none
      ${isIncoming ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600"}
    `}>
      {isIncoming ? "Incoming" : "Outgoing"}
    </span>
  );
}

function BadgeStatus({ status }) {
  const cls =
      status === "PENDING"
          ? "bg-yellow-100 text-yellow-800"
          : status === "ACCEPTED"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800";
  return <span className={`px-2 py-1 text-xs rounded font-medium ${cls}`}>{status}</span>;
}

function RequestCard({ request, onAccept, onReject }) {
  const { type, status, from, to, theirEvent, yourEvent } = request;
  const isIncoming = type === "incoming";
  const canAct = isIncoming && status === "PENDING";

  return (
      <div className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
        {/* Top row */}
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <BadgeType type={type} />
              <BadgeStatus status={status} />
            </div>
            <h3 className="mt-2 text-lg font-semibold text-gray-900 truncate">
              {isIncoming ? (
                  <>Swap request from <span className="text-blue-600">{from}</span></>
              ) : (
                  <>Swap request to <span className="text-blue-600">{to}</span></>
              )}
            </h3>
            {/* Show primary date from theirEvent if available */}
            <p className="text-sm text-gray-600 mt-1">
              {theirEvent?.startTime ? format(new Date(theirEvent.startTime), "MMM d, yyyy") : "-"}
            </p>
          </div>
        </div>

        {/* Events comparison */}
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Their Event */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                {isIncoming ? "They offer" : "They want"}
              </p>
              <h4 className="font-semibold text-gray-900">{theirEvent?.title || "Untitled"}</h4>
              <p className="text-sm text-gray-700 mt-1">
                {theirEvent?.startTime
                    ? `\u23F1\uFE0F ${format(new Date(theirEvent.startTime), "h:mm a")} – ${format(
                        new Date(theirEvent.endTime),
                        "h:mm a"
                    )} • ${format(new Date(theirEvent.startTime), "MMM d")}`
                    : "-"}
              </p>
            </div>

            {/* Your Event */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                {isIncoming ? "You offer" : "You want"}
              </p>
              <h4 className="font-semibold text-gray-900">{yourEvent?.title || "Untitled"}</h4>
              <p className="text-sm text-gray-700 mt-1">
                {yourEvent?.startTime
                    ? `\u23F1\uFE0F ${format(new Date(yourEvent.startTime), "h:mm a")} – ${format(
                        new Date(yourEvent.endTime),
                        "h:mm a"
                    )} • ${format(new Date(yourEvent.startTime), "MMM d")}`
                    : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Hover actions (Version Y) */}
        <div
            className={`absolute inset-x-0 bottom-0 p-3 bg-white/95 border-t border-gray-200 backdrop-blur-sm
        transition-all duration-200 translate-y-full group-hover:translate-y-0
        ${canAct ? "md:flex" : "md:hidden"} hidden items-center justify-end gap-3`}
        >
          <button
              onClick={onReject}
              className="px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-medium"
          >
            <X className="w-4 h-4 inline -mt-0.5 mr-1" /> Decline
          </button>
          <button
              onClick={onAccept}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium shadow"
          >
            <Check className="w-4 h-4 inline -mt-0.5 mr-1" /> Accept Swap
          </button>
        </div>

        {/* Mobile actions: always visible for pending incoming */}
        {canAct && (
            <div className="md:hidden px-5 pb-4 flex items-center justify-end gap-3">
              <button
                  onClick={onReject}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-medium"
              >
                <X className="w-4 h-4 inline -mt-0.5 mr-1" /> Decline
              </button>
              <button
                  onClick={onAccept}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium shadow"
              >
                <Check className="w-4 h-4 inline -mt-0.5 mr-1" /> Accept
              </button>
            </div>
        )}

        {/* Status note for completed/outgoing */}
        {!canAct && (
            <div className="px-5 pb-4 text-center text-sm text-gray-600">
              {status === "PENDING" && !isIncoming && `Waiting for ${to} to respond...`}
              {status !== "PENDING" && isIncoming && (status === "ACCEPTED" ? "✓ Swap accepted - check your calendar" : "✗ Swap declined")}
              {status !== "PENDING" && !isIncoming && (status === "ACCEPTED" ? `✓ Swap accepted by ${to}` : `✗ Swap declined by ${to}`)}
            </div>
        )}
      </div>
  );
}

function SkeletonHeader() {
  return (
      <div className="animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded"></div>
        <div className="h-4 w-64 bg-gray-200 rounded mt-2"></div>
      </div>
  );
}
