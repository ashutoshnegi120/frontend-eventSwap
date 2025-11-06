import { useNotify } from "../context/NotifyContext";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

/**
 * Modern Toast Stack (C-SASSY)
 * - Soft glass UI
 * - Animated entrance
 * - Icons per variant
 * - Click to dismiss (optional)
 */

export default function ToastStack() {
    const { toasts, removeToast } = useNotify();

    const variantStyles = {
        success: {
            icon: <CheckCircle className="text-green-600 dark:text-green-400" />,
            bg: "bg-green-100 dark:bg-green-500/15",
            text: "text-green-800 dark:text-green-300",
        },
        error: {
            icon: <XCircle className="text-red-600 dark:text-red-400" />,
            bg: "bg-red-100 dark:bg-red-500/15",
            text: "text-red-800 dark:text-red-300",
        },
        warn: {
            icon: <AlertTriangle className="text-yellow-600 dark:text-yellow-400" />,
            bg: "bg-yellow-100 dark:bg-yellow-500/15",
            text: "text-yellow-800 dark:text-yellow-300",
        },
        info: {
            icon: <Info className="text-blue-600 dark:text-blue-400" />,
            bg: "bg-blue-100 dark:bg-blue-500/15",
            text: "text-blue-800 dark:text-blue-300",
        },
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
            {toasts.map((t) => {
                const v = variantStyles[t.variant] || variantStyles.info;
                return (
                    <div
                        key={t.id}
                        onClick={() => removeToast?.(t.id)}
                        className={`
              min-w-[240px] max-w-[320px] px-4 py-3 flex items-center gap-3 rounded-xl shadow-lg
              backdrop-blur-md border border-black/10 dark:border-white/10 cursor-pointer
              animate-slide-in
              ${v.bg} ${v.text}
            `}
                    >
                        {v.icon}
                        <p className="text-sm font-medium">{t.msg}</p>
                    </div>
                );
            })}
        </div>
    );
}
