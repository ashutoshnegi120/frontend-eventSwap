import React from "react";

export default function Button({
                                   children,
                                   variant = "primary",
                                   loading = false,
                                   fullWidth = false,
                                   iconLeft,
                                   iconRight,
                                   className = "",
                                   disabled,
                                   ...rest
                               }) {
    const variantClass = {
        primary: "btn-primary",
        outline: "btn-outline",
        subtle: "btn-subtle",
        ghost: "btn-ghost",
        danger: "btn-danger",
    }[variant];

    return (
        <button
            className={`btn ${variantClass} ${fullWidth ? "w-full" : ""} ${className}`}
            disabled={disabled || loading}
            {...rest}
        >
            {/* Spinner when loading */}
            {loading ? (
                <span className="inline-flex items-center gap-2">
          <Spinner />
                    {typeof children === "string" ? <span>{children}</span> : children}
        </span>
            ) : (
                <span className="inline-flex items-center gap-2">
          {iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}
                    {children}
                    {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
        </span>
            )}
        </button>
    );
}

/* --- Small Circular Spinner for loading state --- */
function Spinner() {
    return (
        <svg
            className="animate-spin h-4 w-4 text-white opacity-90"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
        </svg>
    );
}
