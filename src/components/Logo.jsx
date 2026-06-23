import React from "react";

export default function Logo({ size = 36 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 bg-tint"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size * 0.62} height={size * 0.62}>
        {/* Map-pin silhouette */}
        <path
          d="M50 7 C30 7 14 23 14 43 C14 65 45 88 50 94 C55 88 86 65 86 43 C86 23 70 7 50 7Z"
          fill="#5B8C68"
        />
        {/* White ring */}
        <circle cx="50" cy="42" r="17" fill="white" />
        {/* Inner dot */}
        <circle cx="50" cy="42" r="7" fill="#5B8C68" />
      </svg>
    </div>
  );
}
