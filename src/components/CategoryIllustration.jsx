import React from "react";

const ILLUSTRATIONS = {
  nature: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#E7F0E3" />
      <circle cx="90" cy="28" r="14" fill="#D89A3A" />
      <path d="M30 95 L30 60 L20 70 L30 55 L40 70 L30 60" fill="#5B8C68" stroke="#5B8C68" strokeWidth="4" strokeLinejoin="round" />
      <path d="M60 95 L60 50 L46 65 L60 42 L74 65 L60 50" fill="#74A582" stroke="#74A582" strokeWidth="4" strokeLinejoin="round" />
      <rect x="27" y="95" width="6" height="14" fill="#7D8C5B" />
      <rect x="57" y="95" width="6" height="14" fill="#7D8C5B" />
      <ellipse cx="60" cy="112" rx="50" ry="6" fill="#C7D8C2" />
    </svg>
  ),
  water: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#E2EFF1" />
      <circle cx="88" cy="30" r="13" fill="#D89A3A" />
      <path d="M0 70 Q15 60 30 70 T60 70 T90 70 T120 70 V120 H0 Z" fill="#4F9AA8" />
      <path d="M0 88 Q15 78 30 88 T60 88 T90 88 T120 88 V120 H0 Z" fill="#3E8A98" />
      <path d="M0 104 Q15 96 30 104 T60 104 T90 104 T120 104 V120 H0 Z" fill="#2E7986" />
    </svg>
  ),
  culture: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#F0E6D9" />
      <polygon points="60,28 95,52 25,52" fill="#C2854A" />
      <rect x="30" y="52" width="60" height="46" fill="#E0C9A6" />
      <rect x="38" y="60" width="8" height="38" fill="#C2854A" />
      <rect x="56" y="60" width="8" height="38" fill="#C2854A" />
      <rect x="74" y="60" width="8" height="38" fill="#C2854A" />
      <rect x="24" y="98" width="72" height="8" fill="#A6724F" />
    </svg>
  ),
  outdoor: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#E9EDE0" />
      <polygon points="20,95 45,45 70,95" fill="#7D8C5B" />
      <polygon points="50,95 78,35 106,95" fill="#94A371" />
      <circle cx="95" cy="26" r="11" fill="#D89A3A" />
      <path d="M44 95 Q60 80 76 95" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  ),
  games: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#F1E4DA" />
      <rect x="22" y="22" width="34" height="34" rx="6" fill="#A6724F" />
      <rect x="64" y="22" width="34" height="34" rx="6" fill="#C2854A" />
      <rect x="22" y="64" width="34" height="34" rx="6" fill="#C2854A" />
      <rect x="64" y="64" width="34" height="34" rx="6" fill="#A6724F" />
      <circle cx="60" cy="60" r="7" fill="#F1E4DA" />
    </svg>
  ),
};

// Shows the activity's real photo if it has one, otherwise a generic
// flat illustration matching its category (nature/water/culture/outdoor/games).
export default function CategoryIllustration({ category, photoUrl, alt, className }) {
  if (photoUrl) {
    return <img src={photoUrl} alt={alt || ""} className={className} style={{ objectFit: "cover" }} />;
  }
  return <div className={className}>{ILLUSTRATIONS[category] || ILLUSTRATIONS.nature}</div>;
}
