// =============================================
// File: src/pages/Calendar.jsx
// Style: C-SASSY (BLU) • Density: D2 • Single-file (SF-A)
// Uses your utilities: .card .btn .input and <Button />
// Keeps your original logic intact.
// =============================================

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Plus, Trash2, AlertCircle, Filter, Edit3, Lock, Info } from "lucide-react";
import { format } from "date-fns";
import api from "../services/api";
import { useSSE } from "../context/SSEContext";
import Button from "../components/ui/Button";

// =============================================
// Page Component
// =============================================
export default function Calendar() {
  const { user } = useAuth();          // user = { id, email }
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Create/Edit shared form data (Create modal uses this)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    status: "BUSY",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Global blocked ranges + fully blocked days
  const [blockedRanges, setBlockedRanges] = useState([]);
  const [blockedDays, setBlockedDays] = useState(new Set());

  // Dynamic end-time clamp for create modal
  const [endClamp, setEndClamp] = useState({ min: "", max: "" });

  const { eventData } = useSSE();

  useEffect(() => {
    if (eventData?.type === "swapResponse") {
      fetchEverything();
    }
  }, [eventData]);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);

  // Swap maps for locking/cancel
  const [lockedEventIds, setLockedEventIds] = useState(() => new Set());
  const [pendingSwapByEventId, setPendingSwapByEventId] = useState({});

  useEffect(() => {
    if (user) fetchEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchEverything() {
    setLoading(true);
    setError("");
    try {
      await Promise.all([fetchEvents(), fetchSwaps(), fetchBlockedTimes()]);
    } finally {
      setLoading(false);
    }
  }

  // ---------------- API ----------------
  async function fetchEvents() {
    try {
      const response = await api.get(`/getEvent/${user.id || user}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = response?.data?.data || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch events");
      console.error(err);
    }
  }

  async function fetchSwaps() {
    try {
      const res = await api.get(`/getSwap/${user.id || user}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const swaps = Array.isArray(res.data) ? res.data : [];

      const locked = new Set();
      const pendingMap = {};

      for (const s of swaps) {
        const fromId = s.fromEvent?._id || s.fromEvent;
        const toId = s.toEvent?._id || s.toEvent;
        if (fromId) locked.add(fromId);
        if (toId) locked.add(toId);
        const st = (s.status || "").toUpperCase();
        if (st === "PENDING") {
          if (fromId) pendingMap[fromId] = s._id;
          if (toId) pendingMap[toId] = s._id;
        }
      }

      setLockedEventIds(locked);
      setPendingSwapByEventId(pendingMap);
    } catch (err) {
      console.error("Failed to fetch swaps", err);
    }
  }

  async function fetchBlockedTimes() {
    try {
      const res = await api.get("/busy-times", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const ranges = Array.isArray(res.data) ? res.data : [];
      setBlockedRanges(ranges);
      setBlockedDays(computeFullyBlockedDays(ranges));
    } catch (err) {
      console.error("Failed to fetch blocked times", err);
    }
  }

  // ---------------- Helpers ----------------
  const dayKey = (d) => format(new Date(d), "yyyy-MM-dd");
  const endOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };
  const toLocalInput = (date) => {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const mergeIntervals = (intervals) => {
    if (!intervals.length) return [];
    const parsed = intervals
        .filter((r) => r.start && r.end)
        .map((r) => ({ start: new Date(r.start), end: new Date(r.end) }))
        .filter((r) => r.start < r.end)
        .sort((a, b) => a.start - b.start);

    const out = [parsed[0]];
    for (let i = 1; i < parsed.length; i++) {
      const cur = parsed[i];
      const last = out[out.length - 1];
      if (cur.start <= last.end) {
        last.end = new Date(Math.max(last.end.getTime(), cur.end.getTime()));
      } else {
        out.push(cur);
      }
    }
    return out;
  };

  const computeFullyBlockedDays = (ranges) => {
    const byDay = new Map();
    const merged = mergeIntervals(ranges);

    for (const r of merged) {
      const start = new Date(r.start);
      const end = new Date(r.end);

      for (
          let d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          dayKey(d) <= dayKey(end);
          d = new Date(d.getTime() + 86400000)
      ) {
        const key = dayKey(d);
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        const clipStart = new Date(Math.max(start.getTime(), dayStart.getTime()));
        const clipEnd = new Date(Math.min(end.getTime(), dayEnd.getTime()));
        if (clipStart < clipEnd) {
          if (!byDay.has(key)) byDay.set(key, []);
          byDay.get(key).push({ start: clipStart, end: clipEnd });
        }
      }
    }

    const full = new Set();
    for (const [key, intervals] of byDay.entries()) {
      const mergedDay = mergeIntervals(intervals.map((x) => ({ start: x.start, end: x.end })));
      const d = new Date(key);
      const fullStart = new Date(d);
      fullStart.setHours(0, 0, 0, 0);
      const fullEnd = new Date(d);
      fullEnd.setHours(23, 59, 59, 999);

      if (mergedDay.length === 1 && mergedDay[0].start <= fullStart && mergedDay[0].end >= fullEnd) {
        full.add(key);
      }
    }
    return full;
  };

  // Free window calculation
  const computeFreeWindowFrom = (startLocal, mergedBlocks) => {
    let s = new Date(startLocal);
    const dayEnd = endOfDay(s);

    for (let i = 0; i < mergedBlocks.length; i++) {
      const r = mergedBlocks[i];
      if (s >= r.start && s < r.end) {
        s = new Date(r.end);
      }
    }

    if (s >= dayEnd) return null;

    let nextStart = dayEnd;
    for (let i = 0; i < mergedBlocks.length; i++) {
      const r = mergedBlocks[i];
      if (r.start > s) {
        nextStart = r.start;
        break;
      }
    }

    const windowEnd = new Date(Math.min(nextStart.getTime(), dayEnd.getTime()));
    return { start: s, end: windowEnd };
  };

  // --- Dynamic clamp for CREATE modal ---
  useEffect(() => {
    if (!formData.startTime) {
      setEndClamp({ min: "", max: "" });
      return;
    }

    const start = new Date(formData.startTime);
    const key = dayKey(start);

    if (blockedDays.has(key)) {
      setError("This day is fully booked. Please choose another day.");
      setEndClamp({ min: "", max: "" });
      return;
    }

    const merged = mergeIntervals(blockedRanges);
    const win = computeFreeWindowFrom(start, merged);

    if (!win) {
      setError("No available time after this start. Pick another start time.");
      setEndClamp({ min: "", max: "" });
      return;
    }

    const windowMs = win.end.getTime() - win.start.getTime();
    if (windowMs < 5 * 60 * 1000) {
      setError("No sufficient free time after this start. Pick another start time.");
      setEndClamp({ min: "", max: "" });
      return;
    }

    const snappedStartLocal = toLocalInput(win.start);
    if (snappedStartLocal !== formData.startTime) {
      setFormData((old) => ({ ...old, startTime: snappedStartLocal }));
    }

    const minLocal = toLocalInput(win.start);
    const maxLocal = toLocalInput(win.end);
    setEndClamp({ min: minLocal, max: maxLocal });

    if (formData.endTime) {
      const end = new Date(formData.endTime);
      if (end > win.end) {
        setFormData((old) => ({ ...old, endTime: maxLocal }));
      } else if (end < win.start) {
        setFormData((old) => ({ ...old, endTime: minLocal }));
      }
    } else {
      const def = new Date(win.start.getTime() + 30 * 60 * 1000);
      const chosen = def > win.end ? win.end : def;
      setFormData((old) => ({ ...old, endTime: toLocalInput(chosen) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startTime, blockedRanges, blockedDays]);

  const overlapsISO = (aStartISO, aEndISO, bStartISO, bEndISO) => {
    const A1 = new Date(aStartISO), A2 = new Date(aEndISO);
    const B1 = new Date(bStartISO), B2 = new Date(bEndISO);
    return A1 < B2 && A2 > B1;
  };

  // ---------------- Submit Handlers ----------------
  async function handleCreateSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.startTime || !formData.endTime) {
      setError("Please fill in all required fields");
      return;
    }

    if (!endClamp.min || !endClamp.max) {
      setError("Selected time window is not available. Pick a different start.");
      return;
    }

    const end = new Date(formData.endTime);
    const max = new Date(endClamp.max);
    const min = new Date(endClamp.min);
    if (end < min || end > max) {
      setError("End time is outside the available window.");
      return;
    }

    const sISO = new Date(formData.startTime).toISOString();
    const eISO = new Date(formData.endTime).toISOString();
    const conflict = blockedRanges.some((r) => overlapsISO(sISO, eISO, r.start, r.end));
    if (conflict) {
      setError("This time overlaps with an existing event.");
      return;
    }

    try {
      await api.post(
          "/create",
          {
            userId: user.id || user, // keep compatibility
            title: formData.title,
            description: formData.description,
            start: formData.startTime,
            end: formData.endTime,
            type: formData.status,
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setFormData({ title: "", description: "", startTime: "", endTime: "", status: "BUSY" });
      setCreateOpen(false);
      setSuccess("Event created successfully");
      setTimeout(() => setSuccess(""), 2500);
      fetchEverything();
    } catch (err) {
      setError("Failed to create event");
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (lockedEventIds.has(id)) {
      setError("This event is involved in a swap and cannot be deleted.");
      setTimeout(() => setError(""), 2500);
      return;
    }
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess("Event deleted successfully");
      setTimeout(() => setSuccess(""), 2500);
      fetchEverything();
    } catch (err) {
      setError("Failed to delete event");
      console.error(err);
    }
  }

  function openEdit(event) {
    setEditing(event);
    setEditOpen(true);
  }

  async function handleEditSave(payload) {
    try {
      const isLocked = lockedEventIds.has(editing._id);

      if (!isLocked && payload.startTime && payload.endTime) {
        const merged = mergeIntervals(blockedRanges);
        const startLocal = new Date(payload.startTime);
        const key = dayKey(startLocal);
        if (blockedDays.has(key)) {
          setError("This day is fully booked. Choose another day.");
          return;
        }
        const win = computeFreeWindowFrom(startLocal, merged);
        if (!win) {
          setError("No available time after selected start.");
          return;
        }
        if (win.end.getTime() - win.start.getTime() < 5 * 60 * 1000) {
          setError("Insufficient free time after selected start.");
          return;
        }
        const newEnd = new Date(payload.endTime);
        if (newEnd < win.start || newEnd > win.end) {
          setError(`End must be between ${toLocalInput(win.start)} and ${toLocalInput(win.end)}.`);
          return;
        }
        const sISO = new Date(payload.startTime).toISOString();
        const eISO = new Date(payload.endTime).toISOString();
        const conflict = blockedRanges.some((r) => overlapsISO(sISO, eISO, r.start, r.end));
        if (conflict) {
          setError("Edited time overlaps with an existing event.");
          return;
        }
      }

      const toISO = (v) => (v ? new Date(v).toISOString() : undefined);
      const body = isLocked
          ? { title: payload.title, description: payload.description }
          : {
            title: payload.title,
            description: payload.description,
            startTime: toISO(payload.startTime),
            endTime: toISO(payload.endTime),
            status: payload.status,
          };

      await api.patch(`/update/${editing._id}`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setEditOpen(false);
      setEditing(null);
      setSuccess(isLocked ? "Event updated (time & status locked)" : "Event updated");
      setTimeout(() => setSuccess(""), 2000);
      fetchEverything();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update event");
      console.error(err);
    }
  }

  async function handleCancelSwap(eventId) {
    const swapId = pendingSwapByEventId[eventId];
    if (!swapId) return;
    if (!window.confirm("Cancel this pending swap?")) return;
    try {
      await api.post(
          `/cancelSwap/${swapId}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSuccess("Swap cancelled");
      setTimeout(() => setSuccess(""), 2000);
      fetchEverything();
    } catch (err) {
      setError("Failed to cancel swap");
      console.error(err);
    }
  }

  // ---------------- Derived UI ----------------
  const filteredEvents = events.filter((event) => {
    if (filter === "busy") return event.status === "BUSY";
    if (filter === "swappable") return event.status === "SWAPPABLE";
    return true;
  });

  const groupedEvents = useMemo(() => {
    return filteredEvents
        .filter((event) => event && event.startTime && event.endTime)
        .reduce((acc, event) => {
          const date = format(new Date(event.startTime), "yyyy-MM-dd");
          if (!acc[date]) acc[date] = [];
          acc[date].push(event);
          return acc;
        }, {});
  }, [filteredEvents]);

  // ---------------- Render ----------------
  if (loading)
    return (
        <Layout>
          <div className="py-24 text-center text-[rgb(var(--muted))]">Loading events…</div>
        </Layout>
    );

  return (
      <Layout>
        <div className="">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Calendar</h1>
              <p className="text-gray-600 mt-1">Manage your events and availability</p>
            </div>

            <Button
                onClick={() => {
                  setFormData({ title: "", description: "", startTime: "", endTime: "", status: "BUSY" });
                  setCreateOpen(true);
                }}
                iconLeft={<Plus className="w-5 h-5" />}
            >
              New Event
            </Button>
          </div>

          {/* Messages */}
          {success && <Banner type="success" text={success} />}
          {error && <Banner type="error" text={error} />}

          {/* Filters */}
          <FilterBar filter={filter} setFilter={setFilter} />

          {/* Events by day */}
          <div className="mt-6 space-y-6">
            {Object.keys(groupedEvents).length > 0 ? (
                Object.entries(groupedEvents).map(([date, dayEvents]) => (
                    <section key={date}>
                      <h3 className="text-base font-semibold text-gray-800 mb-3">
                        {format(new Date(date), "EEEE, MMMM d, yyyy")}
                      </h3>
                      <div className="space-y-3">
                        {dayEvents.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                locked={lockedEventIds.has(event._id)}
                                pendingSwapId={pendingSwapByEventId[event._id]}
                                onCancelSwap={() => handleCancelSwap(event._id)}
                                onEdit={() => openEdit(event)}
                                onDelete={() => handleDelete(event._id)}
                            />
                        ))}
                      </div>
                    </section>
                ))
            ) : (
                <EmptyState onCreate={() => setCreateOpen(true)} />
            )}
          </div>
        </div>

        {/* Create Modal */}
        {createOpen && (
            <EventModal
                mode="create"
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                values={formData}
                setValues={setFormData}
                onSubmit={handleCreateSubmit}
                endClamp={endClamp}
                blockedDays={blockedDays}
                dayKey={dayKey}
            />
        )}

        {/* Edit Modal */}
        {editOpen && editing && (
            <EventModal
                mode="edit"
                open={editOpen}
                onClose={() => {
                  setEditOpen(false);
                  setEditing(null);
                }}
                values={{
                  title: editing.title || "",
                  description: editing.description || "",
                  startTime: editing.startTime ? editing.startTime.slice(0, 16) : "",
                  endTime: editing.endTime ? editing.endTime.slice(0, 16) : "",
                  status: editing.status || "BUSY",
                }}
                setValues={(updater) => {
                  if (typeof updater === "function") {
                    const next = updater({
                      title: editing.title || "",
                      description: editing.description || "",
                      startTime: editing.startTime ? editing.startTime.slice(0, 16) : "",
                      endTime: editing.endTime ? editing.endTime.slice(0, 16) : "",
                      status: editing.status || "BUSY",
                    });
                    setEditing((prev) => ({ ...prev, ...next }));
                  } else {
                    setEditing((prev) => ({ ...prev, ...updater }));
                  }
                }}
                onSubmit={(e, vals) => {
                  e.preventDefault();
                  const payload = {
                    title: vals.title,
                    description: vals.description,
                    startTime: vals.startTime,
                    endTime: vals.endTime,
                    status: vals.status,
                  };
                  handleEditSave(payload);
                }}
                locked={lockedEventIds.has(editing._id)}
            />
        )}
      </Layout>
  );
}

// =============================================
// UI: Banners & Empty State
// =============================================
function Banner({ type, text }) {
  const base = "mb-4 md:mb-6 rounded-lg p-4 flex items-start gap-3";
  if (type === "success")
    return (
        <div className={`bg-green-50 border border-green-200 ${base}`}>
          <div className="w-5 h-5 text-green-600 mt-0.5">✓</div>
          <p className="text-green-700 text-sm">{text}</p>
        </div>
    );
  if (type === "error")
    return (
        <div className={`bg-red-50 border border-red-200 ${base}`}>
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{text}</p>
        </div>
    );
  return null;
}

function EmptyState({ onCreate }) {
  return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3">
          <Info className="w-6 h-6" />
        </div>
        <p className="text-gray-800 text-lg font-medium">No events yet</p>
        <p className="text-gray-500 mt-1">Create your first event to get started.</p>
        <div className="mt-4">
          <Button iconLeft={<Plus className="w-4 h-4" />} onClick={onCreate}>
            New Event
          </Button>
        </div>
      </div>
  );
}

// =============================================
// UI: Modal (Create & Edit use same component)
// =============================================
function EventModal({
                      mode = "create",
                      open,
                      onClose,
                      values,
                      setValues,
                      onSubmit,
                      // create-specific
                      endClamp,
                      blockedDays,
                      dayKey,
                      // edit-specific
                      locked,
                    }) {
  if (!open) return null;

  const isCreate = mode === "create";
  const title = isCreate ? "Create New Event" : "Edit Event";
  const canChangeSchedule = isCreate || !locked;

  return (
      <div className="fixed inset-0 z-[60] grid place-items-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        {/* Dialog */}
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 mx-4 animate-[fadeIn_.2s_ease]">
          <div className="p-5 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>

          <form onSubmit={(e) => onSubmit(e, values)} className="p-5 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                  className="input"
                  value={values.title}
                  onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
                  required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                  rows={3}
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-white/5 px-3 py-2 outline-none focus:ring-4"
                  value={values.description}
                  onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              />
            </div>

            {/* Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time {!isCreate && locked && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 ml-1"><Lock className="w-3 h-3" /> locked</span>
                )}
                </label>
                <input
                    type="datetime-local"
                    disabled={!canChangeSchedule}
                    className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={values.startTime}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (isCreate && blockedDays && dayKey && blockedDays.has(dayKey(v))) {
                        alert("🚫 This day is fully booked. Please choose another day.");
                        return;
                      }
                      setValues((prev) => ({ ...prev, startTime: v }));
                    }}
                    required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time {!isCreate && locked && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 ml-1"><Lock className="w-3 h-3" /> locked</span>
                )}
                </label>
                <input
                    type="datetime-local"
                    disabled={!canChangeSchedule}
                    className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={values.endTime}
                    min={isCreate && endClamp?.min ? endClamp.min : undefined}
                    max={isCreate && endClamp?.max ? endClamp.max : undefined}
                    onChange={(e) => setValues((prev) => ({ ...prev, endTime: e.target.value }))}
                    required
                />
                {isCreate && endClamp?.max && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available window ends at <span className="font-medium">{endClamp.max}</span>
                    </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status {!isCreate && locked && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 ml-1"><Lock className="w-3 h-3" /> locked</span>
              )}
              </label>
              <select
                  disabled={!canChangeSchedule}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={values.status}
                  onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}
              >
                <option value="BUSY">Busy (Not available)</option>
                <option value="SWAPPABLE">Swappable (Available for swap)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} type="button">Close</Button>
              <Button type="submit">{isCreate ? "Create" : "Save"}</Button>
            </div>
          </form>
        </div>
      </div>
  );
}

// =============================================
// UI: Event Card
// =============================================
function EventCard({ event, locked, pendingSwapId, onCancelSwap, onEdit, onDelete }) {
  const isBusy = event.status === "BUSY";

  return (
      <div
          className={`p-4 rounded-xl border flex items-center justify-between bg-white
        ${isBusy ? "border-red-200/70" : "border-emerald-200/70"}
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
            {locked && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <Lock className="w-3 h-3" /> locked
            </span>
            )}
          </div>
          {event.description && (
              <p className="text-sm text-gray-600 truncate">{event.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(event.startTime), "h:mm a")} – {format(new Date(event.endTime), "h:mm a")}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium
            ${isBusy ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}
        >
          {event.status}
        </span>

          {!!pendingSwapId && (
              <Button
                  variant="danger"
                  className="text-xs h-8 px-3"
                  onClick={onCancelSwap}
                  title="Cancel pending swap"
              >
                Cancel Swap
              </Button>
          )}

          <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg text-indigo-600 transition"
              title="Edit event"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
              onClick={onDelete}
              className={`p-2 rounded-lg transition ${locked ? "opacity-50 cursor-not-allowed text-red-400" : "hover:bg-gray-100 text-red-600"}`}
              title={locked ? "This event is involved in a swap and cannot be deleted" : "Delete event"}
              disabled={locked}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
  );
}

// =============================================
// UI: Filter Bar (Segmented Style)
// =============================================
function FilterBar({ filter, setFilter }) {
  const btn = (active) =>
      `px-3 py-1.5 rounded-lg text-sm font-medium transition
     ${active ? "bg-white shadow border border-gray-200" : "hover:bg-gray-100"}`;

  return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 px-2 py-1.5 rounded-xl bg-gray-100 border border-gray-200">
          <Filter className="w-4 h-4 text-gray-600" />
          <button onClick={() => setFilter("all")} className={btn(filter === "all")}>
            All
          </button>
          <button onClick={() => setFilter("busy")} className={btn(filter === "busy")}>
            Busy
          </button>
          <button onClick={() => setFilter("swappable")} className={btn(filter === "swappable")}>
            Swappable
          </button>
        </div>
      </div>
  );
}
