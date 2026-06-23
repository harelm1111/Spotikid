import React from "react";

const ILLUSTRATIONS = {
  /* ── Attractions ──────────────────────────────────────────── */
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
  experience: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#F2EEFF" />
      <polygon points="60,22 66,44 90,44 71,57 78,80 60,67 42,80 49,57 30,44 54,44" fill="#9B6B9E" />
      <circle cx="22" cy="28" r="5" fill="#C9A8D4" />
      <circle cx="98" cy="34" r="4" fill="#C9A8D4" />
      <circle cx="88" cy="90" r="6" fill="#C9A8D4" />
      <circle cx="28" cy="85" r="4" fill="#C9A8D4" />
    </svg>
  ),

  /* ── Restaurants & Cafés ──────────────────────────────────── */
  cafe: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#F2EAE0" />
      <rect x="32" y="58" width="56" height="38" rx="6" fill="#8C7B5B" />
      <rect x="88" y="68" width="14" height="18" rx="7" fill="none" stroke="#8C7B5B" strokeWidth="5" />
      <rect x="28" y="96" width="64" height="7" rx="3" fill="#6A5C44" />
      <path d="M44 54 Q44 36 52 30" stroke="#C9A88A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 54 Q60 32 68 26" stroke="#C9A88A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  ),
  israeli: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#F5EAD8" />
      <ellipse cx="60" cy="80" rx="40" ry="12" fill="#E0C9A6" />
      <ellipse cx="60" cy="72" rx="38" ry="28" fill="#D4B483" />
      <circle cx="48" cy="62" r="9" fill="#8C6B30" />
      <circle cx="65" cy="58" r="9" fill="#8C6B30" />
      <circle cx="60" cy="74" r="9" fill="#7A5C28" />
      <ellipse cx="60" cy="50" rx="28" ry="10" fill="#C8A870" />
    </svg>
  ),
  asian: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#F0EEE4" />
      <ellipse cx="60" cy="80" rx="42" ry="14" fill="#D4C9A0" />
      <path d="M18 66 Q60 42 102 66" fill="#E8DEB8" stroke="#C8BA90" strokeWidth="2" />
      <ellipse cx="60" cy="66" rx="42" ry="8" fill="#E8DEB8" />
      <line x1="72" y1="30" x2="58" y2="70" stroke="#8C6B30" strokeWidth="4" strokeLinecap="round" />
      <line x1="82" y1="28" x2="68" y2="68" stroke="#8C6B30" strokeWidth="4" strokeLinecap="round" />
      <path d="M54 54 Q60 48 66 54 Q60 64 54 54Z" fill="#C2564A" />
    </svg>
  ),
  italian: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#FFF0EC" />
      <circle cx="60" cy="72" r="36" fill="#F5C8A0" />
      <circle cx="60" cy="72" r="28" fill="#E8A878" />
      <circle cx="44" cy="64" r="8" fill="#C2564A" />
      <circle cx="68" cy="58" r="7" fill="#C2564A" />
      <circle cx="60" cy="80" r="7" fill="#5B8C68" />
      <path d="M56 38 Q58 28 62 22 Q65 28 68 38" fill="#F5C8A0" stroke="#D4A870" strokeWidth="2" />
    </svg>
  ),
  bar: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#E8EAF4" />
      <polygon points="40,30 80,30 72,70 48,70" fill="#A8B8D8" stroke="#8898C0" strokeWidth="2" />
      <ellipse cx="60" cy="30" rx="20" ry="6" fill="#C0CCDF" />
      <rect x="57" y="70" width="6" height="24" fill="#8898C0" />
      <ellipse cx="60" cy="94" rx="18" ry="5" fill="#8898C0" />
      <circle cx="60" cy="48" r="6" fill="#C2574A" />
      <line x1="60" y1="30" x2="60" y2="48" stroke="#6A8AB0" strokeWidth="2" />
    </svg>
  ),
  breakfast: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#FFF8E0" />
      <circle cx="82" cy="30" r="16" fill="#D89A3A" />
      <line x1="82" y1="10" x2="82" y2="16" stroke="#D89A3A" strokeWidth="3" strokeLinecap="round" />
      <line x1="96" y1="16" x2="92" y2="20" stroke="#D89A3A" strokeWidth="3" strokeLinecap="round" />
      <line x1="102" y1="30" x2="96" y2="30" stroke="#D89A3A" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="50" cy="80" rx="34" ry="20" fill="#F0E0C0" stroke="#D8C090" strokeWidth="2" />
      <ellipse cx="46" cy="76" rx="14" ry="14" fill="#FFF8C0" />
      <circle cx="46" cy="76" r="8" fill="#D89A3A" />
    </svg>
  ),

  /* ── Events ───────────────────────────────────────────────── */
  concert: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#EEE0FF" />
      <rect x="0" y="88" width="120" height="32" fill="#3A2A5A" />
      <ellipse cx="60" cy="88" rx="60" ry="8" fill="#4A3A6A" />
      <circle cx="60" cy="50" r="16" fill="#C8A0F0" />
      <rect x="54" y="66" width="12" height="24" rx="2" fill="#9B6B9E" />
      <path d="M36 44 Q28 28 36 20 Q44 28 36 44Z" fill="#9B6B9E" opacity="0.6" />
      <path d="M84 44 Q92 28 84 20 Q76 28 84 44Z" fill="#9B6B9E" opacity="0.6" />
      <circle cx="26" cy="100" r="4" fill="#C8A0F0" opacity="0.8" />
      <circle cx="60" cy="96" r="4" fill="#C8A0F0" opacity="0.8" />
      <circle cx="94" cy="100" r="4" fill="#C8A0F0" opacity="0.8" />
    </svg>
  ),
  standup: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#FFF0E0" />
      <rect x="0" y="90" width="120" height="30" fill="#3A2A1A" />
      <ellipse cx="60" cy="90" rx="60" ry="7" fill="#4A3A2A" />
      <ellipse cx="60" cy="44" rx="10" ry="14" fill="#C27B4A" />
      <rect x="56" y="56" width="8" height="6" rx="2" fill="#A05A2A" />
      <rect x="57" y="62" width="6" height="30" rx="2" fill="#C27B4A" />
      <circle cx="60" cy="104" r="4" fill="#E8A870" opacity="0.8" />
      <path d="M30 20 Q60 5 90 20" stroke="#E8C888" strokeWidth="3" fill="none" opacity="0.6" />
    </svg>
  ),
  theater: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#E0EEFF" />
      <rect x="0" y="0" width="48" height="100" fill="#4A7B9B" />
      <rect x="72" y="0" width="48" height="100" fill="#4A7B9B" />
      <path d="M48 0 Q60 30 48 100" fill="#3A6A8A" />
      <path d="M72 0 Q60 30 72 100" fill="#3A6A8A" />
      <rect x="0" y="100" width="120" height="20" fill="#2A4A6A" />
      <circle cx="38" cy="50" r="12" fill="#FFE87C" stroke="#D4A843" strokeWidth="2" />
      <circle cx="82" cy="50" r="12" fill="#A0C8F0" stroke="#6098C0" strokeWidth="2" />
    </svg>
  ),
  sports: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#E0F4EA" />
      <rect x="0" y="80" width="120" height="40" fill="#6AAB7A" />
      <rect x="0" y="76" width="120" height="8" fill="#58984A" />
      <circle cx="60" cy="54" r="28" fill="white" stroke="#333" strokeWidth="3" />
      <path d="M60 26 Q72 36 72 54 Q72 72 60 82 Q48 72 48 54 Q48 36 60 26Z" fill="#222" />
      <path d="M32 40 Q46 44 48 54 Q46 64 32 68" fill="#222" />
      <path d="M88 40 Q74 44 72 54 Q74 64 88 68" fill="#222" />
    </svg>
  ),
  festival: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#FFF0F0" />
      <circle cx="30" cy="50" r="18" fill="#C2574A" />
      <line x1="30" y1="68" x2="30" y2="110" stroke="#A04030" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="40" r="20" fill="#D4A843" />
      <line x1="60" y1="60" x2="60" y2="110" stroke="#B08030" strokeWidth="3" strokeLinecap="round" />
      <circle cx="90" cy="52" r="18" fill="#4A7B9B" />
      <line x1="90" y1="70" x2="90" y2="110" stroke="#3A6080" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 110 Q60 104 110 110" stroke="#888" strokeWidth="2" fill="none" />
    </svg>
  ),
  workshop: (
    <svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="120" height="120" fill="#E8F4F8" />
      <circle cx="60" cy="46" r="26" fill="#FFE87C" stroke="#D4A843" strokeWidth="3" />
      <path d="M46 66 Q60 76 74 66 L74 80 Q60 90 46 80 Z" fill="#D4A843" />
      <rect x="50" y="80" width="20" height="6" rx="2" fill="#B08030" />
      <rect x="52" y="86" width="16" height="6" rx="2" fill="#907020" />
      <line x1="60" y1="20" x2="60" y2="14" stroke="#D4A843" strokeWidth="4" strokeLinecap="round" />
      <line x1="40" y1="26" x2="36" y2="22" stroke="#D4A843" strokeWidth="4" strokeLinecap="round" />
      <line x1="80" y1="26" x2="84" y2="22" stroke="#D4A843" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="46" r="10" fill="#D4A843" opacity="0.4" />
    </svg>
  ),
};

// Shows the item's real photo if available, otherwise a flat illustration per category.
// Falls back to the 'nature' illustration for unknown categories.
export default function CategoryIllustration({ category, photoUrl, alt, className }) {
  if (photoUrl) {
    return <img src={photoUrl} alt={alt || ""} className={className} style={{ objectFit: "cover" }} />;
  }
  return <div className={className}>{ILLUSTRATIONS[category] || ILLUSTRATIONS.nature}</div>;
}
