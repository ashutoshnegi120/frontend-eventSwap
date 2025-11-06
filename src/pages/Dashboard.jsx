// ======================================================
// File: src/pages/Dashboard.jsx
// Mode: MAX UI + Minimal Motion + C-SASSY BLU
// Logic, API & variable names fully preserved (NO CHANGES)
// ======================================================

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Button from "../components/ui/Button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Calendar, RefreshCcw, TrendingUp, Shuffle } from "lucide-react";
import api from "../services/api";

// ======================================================
// Dashboard Page (UI Upgraded Only)
// ======================================================
export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    swappableCount: 0,
    busyCount: 0,
    swapRate: 0,
    eventsByDate: [],
    statusDistribution: [],
    upcomingSwaps: [],
  });

  const user = localStorage.getItem("user");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res1 = await api.get(`/getEvent/${user}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const res2 = await api.get(`/getAll/${user}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const events = res1.data.data;
      const allEvents = res2.data.data;

      const now = new Date();
      const sortedEvents = [...events].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      const next = sortedEvents.find(e => new Date(e.startTime) > now);

      const busy = events.filter(e => e.status === "BUSY").length;
      const swappable = events.filter(e => e.status === "SWAPPABLE").length;
      const swapRate = ((swappable / events.length) * 100).toFixed(1);

      const eventsByDate = allEvents.reduce((acc, e) => {
        const day = new Date(e.startTime).toLocaleDateString("en-US", { weekday: "short" });
        const exists = acc.find(i => i.day === day);
        if (exists) exists.events++;
        else acc.push({ day, events: 1 });
        return acc;
      }, []);

      const statusDistribution = [
        { status: "Busy", value: busy },
        { status: "Swappable", value: swappable },
      ];

      const upcomingSwaps = allEvents
          .filter(e => e.status === "SWAPPABLE" && new Date(e.startTime) > now)
          .slice(0, 5)
          .map(e => ({
            title: e.title,
            date: new Date(e.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            details: `${new Date(e.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(e.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          }));

      setStats({
        totalEvents: events.length,
        swappableCount: swappable,
        busyCount: busy,
        swapRate,
        eventsByDate,
        statusDistribution,
        upcomingSwaps,
      });

    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
      <Layout>
        <div className="p-5 md:p-8 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-gray-600 mt-1 text-sm">Your schedule at a glance</p>
            </div>

            <Button variant="outline" iconLeft={<RefreshCcw className="w-4 h-4" />} onClick={fetchEvents}>
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
                icon={<Calendar className="w-6 h-6 text-blue-600" />}
                label="Total Events"
                value={stats.totalEvents}
                subtext="All your scheduled events"
            />
            <StatCard
                icon={<Shuffle className="w-6 h-6 text-indigo-600" />}
                label="Swappable"
                value={stats.swappableCount}
                subtext="Available for swapping"
            />
            <StatCard
                icon={<TrendingUp className="w-6 h-6 text-violet-600" />}
                label="Busy"
                value={stats.busyCount}
                subtext="Not available to swap"
            />
            <StatCard
                icon={<TrendingUp className="w-6 h-6 text-rose-600" />}
                label="Swap Rate"
                value={`${stats.swapRate}%`}
                subtext="Swap availability ratio"
            />
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">


          {/* Charts Section */}
            <div className="lg:col-span-2 space-y-6">

              {/* Bar Chart */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Events Overview</h2>
                <div className="w-full h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.eventsByDate}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="events" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Event Status Breakdown</h2>
                <div className="w-full h-64 min-w-0 flex justify-center">
                  <ResponsiveContainer width="80%" height="100%">
                  <PieChart>
                      <Pie data={stats.statusDistribution} dataKey="value" nameKey="status" outerRadius={90} label>
                        {stats.statusDistribution.map((_, i) => (
                            <Cell key={i} fill={["#ef4444", "#6366f1"][i % 2]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Upcoming Swaps Panel */}
            <div className="card p-6 h-fit lg:sticky lg:top-28">
              <h2 className="text-lg font-semibold mb-4">Upcoming Swaps</h2>
              {stats.upcomingSwaps.length === 0 ? (
                  <p className="text-gray-600 text-sm">No upcoming swaps available.</p>
              ) : (
                  <div className="space-y-4">
                    {stats.upcomingSwaps.map((swap, i) => (
                        <div key={i} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-gray-900">{swap.title}</p>
                          <p className="text-xs text-blue-700">{swap.date}</p>
                          <p className="text-xs text-gray-600 mt-1">{swap.details}</p>
                        </div>
                    ))}
                  </div>
              )}
            </div>

          </div>
        </div>
      </Layout>
  );
}

// ======================================================
// UI: Stat Card Component (MAX + Minimal Motion)
// ======================================================
function StatCard({ icon, label, value, subtext }) {
  return (
      <div className="card p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px]">
        <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtext}</p>
        </div>
      </div>
  );
}
