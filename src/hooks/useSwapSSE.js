import { useEffect, useRef } from "react";
import { useNotify } from "../context/NotifyContext";
import { useAuth } from "../context/AuthContext";

export default function useSwapSSE({ onRefreshRequests, onRefreshDashboard }) {
    const { user } = useAuth();
    const email = user?.email;
    const { pushToast, incUnreadRequests, isRequestsPageOpen } = useNotify();
    const esRef = useRef(null);

    useEffect(() => {
        if (!email) return;

        const base = import.meta.env.VITE_API_BASE || "http://localhost:8080";
        const es = new EventSource(`${base}/SSE/${encodeURIComponent(email)}`);
        esRef.current = es;

        es.addEventListener("swapRequest", () => {
            pushToast("🔔 New swap request received", "info");

            if (isRequestsPageOpen) onRefreshRequests?.();
            else incUnreadRequests(1);
        });

        es.addEventListener("swapResponse", (evt) => {
            try {
                const payload = JSON.parse(evt.data);
                const status = (payload.status || "").toUpperCase();

                if (status === "ACCEPTED") pushToast("✅ Your swap was accepted!", "success");
                else if (status === "REJECTED") pushToast("❌ Your swap was rejected.", "warn");
            } catch(err) {
                return err.message;
            }

            if (isRequestsPageOpen) onRefreshRequests?.();
            onRefreshDashboard?.();
        });

        es.onerror = () => {
        };

        return () => es.close();
    }, [email, isRequestsPageOpen]);               // ✅ Dependency on email only
}
