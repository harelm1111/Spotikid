import React from "react";

export default function Logo({ size = 36 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 bg-tint"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size * 0.8} height={size * 0.8}>
        <ellipse cx="36" cy="26" rx="9.5" ry="23" fill="#5B8C68" transform="rotate(-14 36 26)" />
        <ellipse cx="64" cy="26" rx="9.5" ry="23" fill="#5B8C68" transform="rotate(14 64 26)" />
        <ellipse cx="36" cy="27" rx="4.8" ry="16" fill="#E7F0E3" transform="rotate(-14 36 27)" />
        <ellipse cx="64" cy="27" rx="4.8" ry="16" fill="#E7F0E3" transform="rotate(14 64 27)" />

        <circle cx="50" cy="57" r="29" fill="#74A582" />
        <circle cx="50" cy="59" r="25" fill="#8FBB9B" />

        <ellipse cx="33" cy="65" rx="6" ry="4.5" fill="#D89A3A" opacity="0.3" />
        <ellipse cx="67" cy="65" rx="6" ry="4.5" fill="#D89A3A" opacity="0.3" />

        <circle cx="41" cy="56" r="4" fill="#24322A" />
        <circle cx="59" cy="56" r="4" fill="#24322A" />
        <circle cx="42.2" cy="54.6" r="1.2" fill="#FFFFFF" />
        <circle cx="60.2" cy="54.6" r="1.2" fill="#FFFFFF" />

        <ellipse cx="50" cy="63" rx="2.8" ry="2" fill="#3E6B4A" />
        <path d="M 50 65 Q 45 70 39 67" stroke="#3E6B4A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 50 65 Q 55 70 61 67" stroke="#3E6B4A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="47.5" y="65" width="5" height="6" rx="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
