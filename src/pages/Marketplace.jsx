import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import Layout from "../components/Layout"
import Button from "../components/ui/Button"
import { Search, Filter, ArrowRightLeft, User } from "lucide-react"
import { format } from "date-fns"
import api from "../services/api.js";

export default function Marketplace() {
  const { user } = useAuth()
  const [availableEvents, setAvailableEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("earliest")
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showSwapDialog, setShowSwapDialog] = useState(false)
  const [selectedUserEvent, setSelectedUserEvent] = useState(null)
  const [swapError, setSwapError] = useState("")
  const [success, setSuccess] = useState("")
  const [myEvents, setMyEvents] = useState([]);

  const handleSwapRequest = async (eventId, userEventId) => {
    if (!selectedUserEvent) {
      setSwapError("Please select an event to swap");
      return;
    }

    try {
      setSwapError(""); // clear previous errors

      const response = await api.post(
          `/swapRequest/${user?.id}/${eventId}/${userEventId}`, // only send IDs
          {},
          { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log(response.data.message);
      setSuccess("Swap request sent!");
      setTimeout(() => {
        setShowSwapDialog(false);
        setSelectedEvent(null);
        setSelectedUserEvent(null);
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Swap request failed:", err);
      setSwapError(err.response?.data?.error || "Failed to send swap request");
    }
  };

  const fetchMyEvents = async () => {
    try {
      const response = await api.get(`/getEvent/${user?.id}`, {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMyEvents(response.data.data);
    } catch (err) {
      console.error("Failed to fetch my events:", err);
    }
  };

  useEffect(() => {
    fetchAvailableEvents()
  }, [])

  useEffect(() => {
    filterAndSortEvents()
  }, [availableEvents, searchTerm, sortBy])

  const fetchAvailableEvents = async () => {
    try {
      const response = await api.get(`/getAll/${user?.id}`, {
        headers: { "authorization": `Bearer ${localStorage.getItem("token")}` }
      })
      setAvailableEvents(response.data.data)
    } catch (err) {
      console.error("Failed to fetch marketplace events:", err)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortEvents = () => {
    const filtered = availableEvents.filter(
        (event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.username.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (sortBy === "earliest") {
      filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    } else if (sortBy === "latest") {
      filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    }

    setFilteredEvents(filtered)
  }

  return (
      <Layout>
        <div className="p-6 md:p-8">

          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Marketplace</h1>
            <p className="text-gray-600">Browse available time slots and swap with other users</p>
          </div>

          {/* Success Message */}
          {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-5 h-5 text-green-600 mt-0.5">✓</div>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
          )}

          {/* Search + Sort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                  type="text"
                  placeholder="Search events or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input"
              >
                <option value="earliest">Earliest First</option>
                <option value="latest">Latest First</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
              <div className="card p-6 mb-8">
                <p className="text-gray-600">Loading marketplace events…</p>
              </div>
          )}

          {/* Events Grid */}
          {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <div
                            key={event.id || event._id}
                            className="card overflow-hidden hover:shadow-lg transition"
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold text-gray-900 flex-1">{event.title}</h3>
                            </div>

                            {event.description && (
                                <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                            )}

                            <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                              <p className="text-sm text-gray-700">
                        <span className="font-medium">
                          {format(new Date(event.startTime), "MMM d, h:mm a")}
                        </span>
                                {" – "}
                                <span className="font-medium">
                          {format(new Date(event.endTime), "h:mm a")}
                        </span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{event.username}</p>
                                <p className="text-xs text-gray-500">Available for swap</p>
                              </div>
                            </div>

                            {/* Request Swap Button — logic unchanged */}
                            <Button
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowSwapDialog(true);
                                  fetchMyEvents();
                                }}
                                fullWidth
                                iconLeft={<ArrowRightLeft className="w-4 h-4" />}
                            >
                              Request Swap
                            </Button>
                          </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                      <p className="text-gray-600 text-lg">
                        {availableEvents.length === 0
                            ? "No events available in the marketplace yet"
                            : "No events match your search"}
                      </p>
                    </div>
                )}
              </div>
          )}

          {/* Swap Dialog */}
          {showSwapDialog && selectedEvent && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="card w-full max-w-md">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Request Swap</h2>

                    {swapError && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                          {swapError}
                        </div>
                    )}

                    {/* Their Event */}
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-3">They offer</p>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="font-semibold text-gray-900 mb-2">{selectedEvent.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {format(new Date(selectedEvent.startTime), "MMM d, h:mm a")} –{" "}
                          {format(new Date(selectedEvent.endTime), "h:mm a")}
                        </p>
                        <p className="text-xs text-gray-500">by {selectedEvent.username}</p>
                      </div>
                    </div>

                    {/* Your Events to Select */}
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Select Your Event</p>
                      <div className="grid gap-2 max-h-48 overflow-y-auto">
                        {myEvents
                            .filter((e) => e.status === "SWAPPABLE")
                            .map((e) => (
                                <div
                                    key={e.id || e._id}
                                    onClick={() => setSelectedUserEvent(e)}
                                    className={`cursor-pointer p-3 border rounded-lg ${
                                        selectedUserEvent?.id === e.id ? "border-blue-600 bg-blue-50" : "border-gray-200"
                                    }`}
                                >
                                  <h3 className="text-gray-900 font-medium">{e.title}</h3>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(e.startTime), "MMM d, h:mm a")} –{" "}
                                    {format(new Date(e.endTime), "h:mm a")}
                                  </p>
                                </div>
                            ))}
                      </div>
                    </div>

                    {/* Buttons (SD-A). Logic unchanged; disabled is plain as requested */}
                    <div className="flex gap-3 pt-2">
                      <Button
                          onClick={() => handleSwapRequest(selectedEvent._id, selectedUserEvent._id)}
                          disabled={!selectedUserEvent}
                          fullWidth
                          variant="primary"
                      >
                        Send Request
                      </Button>

                      <Button
                          onClick={() => {
                            setShowSwapDialog(false);
                            setSelectedEvent(null);
                            setSelectedUserEvent(null);
                            setSwapError("");
                          }}
                          fullWidth
                          variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
          )}

        </div>
      </Layout>
  )
}
