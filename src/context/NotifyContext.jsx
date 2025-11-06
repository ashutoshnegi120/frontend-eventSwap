import { createContext, useContext, useMemo, useState, useCallback, useRef, useEffect } from "react";

const NotifyCtx = createContext(null);

/**
 * NotifyProvider
 * Handles:
 * - Toast notifications
 * - Unread request badge count
 * - Tracks if Requests page is open (to reset unread)
 *
 * NOTE: API kept same to avoid breaking existing pages
 */
export function NotifyProvider({ children }) {
    const [unreadRequests, setUnreadRequests] = useState(0);
    const [toasts, setToasts] = useState([]);
    const [isRequestsPageOpen, setIsRequestsPageOpen] = useState(false);

    const timersRef = useRef([]);

    /** Toast system (info/success/error/warn) */
    const pushToast = useCallback((msg, variant = "info") => {
        const id = crypto.randomUUID();

        setToasts((prev) => {
            // Optional safety: cap to last 5 toasts
            if (prev.length >= 5) prev = prev.slice(1);
            return [...prev, { id, msg, variant }];
        });

        const timer = setTimeout(() => {
            setToasts((prev) => prev.filter((x) => x.id !== id));
            timersRef.current = timersRef.current.filter((t) => t !== timer);
        }, 4000);

        timersRef.current.push(timer);
    }, []);

    /** Reset unread count when user views Requests */
    const markRequestsViewed = useCallback(() => setUnreadRequests(0), []);

    /** Increase unread count (used for SSE or new swap request) */
    const incUnreadRequests = useCallback((by = 1) => {
        setUnreadRequests((n) => n + by);
    }, []);

    /** Cleanup timers on unmount (avoid memory leaks) */
    useEffect(() => {
        return () => {
            timersRef.current.forEach((t) => clearTimeout(t));
        };
    }, []);

    const value = useMemo(
        () => ({
            unreadRequests,
            incUnreadRequests,
            markRequestsViewed,
            toasts,
            pushToast,
            isRequestsPageOpen,
            setIsRequestsPageOpen,
        }),
        [
            unreadRequests,
            incUnreadRequests,
            markRequestsViewed,
            toasts,
            pushToast,
            isRequestsPageOpen,
        ]
    );

    return <NotifyCtx.Provider value={value}>{children}</NotifyCtx.Provider>;
}

/** Hook */
export function useNotify() {
    const ctx = useContext(NotifyCtx);
    if (!ctx) throw new Error("useNotify must be used inside <NotifyProvider />");
    return ctx;
}
