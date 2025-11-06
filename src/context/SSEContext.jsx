import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

const SSEContext = createContext(null);

/**
 * SSEProvider
 * - Subscribes to Server-Sent Events for the logged-in user
 * - Currently listens for: "swapResponse"
 * - Auto-cleans connection on logout/unmount
 *
 * NOTE: API kept same to avoid breaking pages.
 */
export function SSEProvider({ children }) {
    const { user } = useAuth(); // user = { id, email }
    const email = user?.email;

    const [eventData, setEventData] = useState(null);
    const [connected, setConnected] = useState(false);

    const sourceRef = useRef(null);
    const reconnectTimer = useRef(null);
    const reconnectAttempts = useRef(0);

    useEffect(() => {
        if (!email) return;

        // Avoid duplicate connections
        if (sourceRef.current) {
            sourceRef.current.close();
            sourceRef.current = null;
        }

        const connect = () => {
            const sseUrl = `http://localhost:8080/api/SSE/${encodeURIComponent(email)}`;
            const eventSource = new EventSource(sseUrl);
            sourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log("📡 SSE connected for", email);
                setConnected(true);
                reconnectAttempts.current = 0; // reset retry count
            };

            eventSource.onerror = (err) => {
                console.error("❌ SSE error", err);
                setConnected(false);
                eventSource.close();

                // Optional Auto-Reconnect with backoff
                const maxRetries = 5;
                if (reconnectAttempts.current < maxRetries) {
                    const timeout = 1000 * (reconnectAttempts.current + 1);
                    reconnectAttempts.current++;
                    console.log(`🔁 Reconnecting SSE in ${timeout}ms...`);

                    reconnectTimer.current = setTimeout(() => {
                        connect();
                    }, timeout);
                }
            };

            // ---- Listen to swap responses ----
            eventSource.addEventListener("swapResponse", (e) => {
                try {
                    const data = JSON.parse(e.data);
                    console.log("🔥 SSE swapResponse received", data);
                    setEventData({ type: "swapResponse", payload: data });
                } catch (err) {
                    console.error("SSE parse error", err);
                }
            });
        };

        connect();

        return () => {
            console.log("🔌 SSE cleanup");
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (sourceRef.current) {
                sourceRef.current.close();
                sourceRef.current = null;
            }
            setConnected(false);
        };
    }, [email]);

    return (
        <SSEContext.Provider value={{ connected, eventData }}>
            {children}
        </SSEContext.Provider>
    );
}

export function useSSE() {
    const ctx = useContext(SSEContext);
    if (!ctx) throw new Error("useSSE must be used inside <SSEProvider />");
    return ctx;
}

