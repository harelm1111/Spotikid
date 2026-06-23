import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin, Clock, Star, Search, SlidersHorizontal, Heart, ChevronRight,
  Globe, Plus, Share2, User as UserIcon, LocateFixed,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchActivities, fetchSavedActivityIds, saveActivity, unsaveActivity } from "../lib/api";
import Logo from "../components/Logo";
import CategoryIllustration from "../components/CategoryIllustration";

const COPY = {
  he: {
    dir: "rtl",
    brand: "מה עושים היום",
    searchPlaceholder: "חפשו עיר, מקום או סוג בילוי...",
    results: "תוצאות נמצאו",
    ratingSort: "דירוג",
    distanceSort: "מרחק",
    newestSort: "חדש",
    away: "ק״מ",
    nearMe: "קרוב אליי",
    locating: "מאתר...",
    signup: "הרשמה / התחברות",
    profile: "האזור שלי",
    emptyState: "לא מצאנו מקומות שתואמים לסינון. נסו להרחיב את החיפוש, או הוסיפו מקום בעצמכם!",
    loading: "טוען...",
    noRatingsYet: "אין דירוגים עדיין",
    shareText: "תראו את המקום הזה שמצאתי",
    linkCopied: "הקישור הועתק!",
  },
  en: {
    dir: "ltr",
    brand: "What To Do Today",
    searchPlaceholder: "Search city, place or activity type...",
    results: "results found",
    ratingSort: "Rating",
    distanceSort: "Distance",
    newestSort: "Newest",
    away: "km",
    nearMe: "Near me",
    locating: "Locating...",
    signup: "Sign up / Log in",
    profile: "My Area",
    emptyState: "No places match your filters. Try widening your search, or add one yourself!",
    loading: "Loading...",
    noRatingsYet: "No ratings yet",
    shareText: "Check out this place I found",
    linkCopied: "Link copied!",
  },
};

const CATEGORY_LABELS = {
  he: {
    all: "הכל",
    // attractions
    nature: "טבע ובעלי חיים", water: "מים וקיץ", culture: "תרבות ולמידה",
    outdoor: "טיולים בטבע", games: "אתגר ומשחק", experience: "חוויה ייחודית",
    // restaurants
    cafe: "בית קפה", israeli: "ישראלי / מזרח-תיכוני", asian: "אסייאתי",
    italian: "איטלקי / פיצה", bar: "בר / אלכוהול", breakfast: "ארוחת בוקר",
    // events
    concert: "הופעה / מוזיקה", standup: "סטנדאפ", theater: "תיאטרון / מחזמר",
    sports: "ספורט", festival: "פסטיבל", workshop: "סדנה / קורס",
  },
  en: {
    all: "All",
    nature: "Nature & Animals", water: "Water & Summer", culture: "Culture & Learning",
    outdoor: "Outdoor & Hiking", games: "Games & Challenges", experience: "Unique Experience",
    cafe: "Café", israeli: "Israeli / Middle Eastern", asian: "Asian",
    italian: "Italian / Pizza", bar: "Bar / Drinks", breakfast: "Breakfast",
    concert: "Concert / Music", standup: "Stand-up", theater: "Theater / Musical",
    sports: "Sports", festival: "Festival", workshop: "Workshop / Course",
  },
};
const CATEGORY_COLORS = {
  nature: "#5B8C68", water: "#4F9AA8", culture: "#C2854A",
  outdoor: "#7D8C5B", games: "#A6724F", experience: "#9B6B9E",
  cafe: "#8C7B5B", israeli: "#C2854A", asian: "#7B5E3A",
  italian: "#C2564A", bar: "#4A5A8C", breakfast: "#D4A843",
  concert: "#7B4A9B", standup: "#C27B4A", theater: "#4A7B9B",
  sports: "#4A9B6B", festival: "#C2574A", workshop: "#5B7A8C",
};
const categoryColor = (key) => CATEGORY_COLORS[key] || "#5B8C68";

const CATEGORIES_BY_TYPE = {
  all: [],
  attraction: ["all", "nature", "water", "culture", "outdoor", "games", "experience"],
  restaurant: ["all", "cafe", "israeli", "asian", "italian", "bar", "breakfast"],
  event: ["all", "concert", "standup", "theater", "sports", "festival", "workshop"],
};

const TYPE_KEYS = ["all", "attraction", "restaurant", "event"];
const TYPE_LABELS = {
  he: { all: "הכל", attraction: "אטרקציות", restaurant: "מסעדות ובתי קפה", event: "אירועים" },
  en: { all: "All", attraction: "Attractions", restaurant: "Restaurants & Cafés", event: "Events" },
};
const TYPE_COLORS = { attraction: "#5B8C68", restaurant: "#C2854A", event: "#4F9AA8" };
const typeColor = (key) => TYPE_COLORS[key] || "#5B8C68";

const OCCASION_KEYS = ["all", "couple", "family", "kids", "friends"];
const OCCASION_LABELS = {
  he: { all: "כל הקהל", couple: "זוגי / דייט", family: "משפחתי", kids: "עם ילדים", friends: "עם חברים" },
  en: { all: "Everyone", couple: "Couple / Date", family: "Family", kids: "With kids", friends: "With friends" },
};

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Default map center: Israel
const DEFAULT_CENTER = [31.7683, 35.2137];

const markerIcon = (highlighted, color) =>
  L.divIcon({
    html: `<div style="
      background:${color};
      width:${highlighted ? "28px" : "22px"}; height:${highlighted ? "28px" : "22px"};
      border-radius:50%; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.25);
    "></div>`,
    className: "",
    iconSize: highlighted ? [28, 28] : [22, 22],
  });

// Builds a shareable link back to a specific activity and uses the device's
// native share sheet (WhatsApp, Messages, etc.) when available, otherwise
// falls back to copying the link to the clipboard.
async function shareActivity(activity, t) {
  const url = `${window.location.origin}${window.location.pathname}?activity=${activity.id}`;
  const shareData = { title: activity.name, text: t.shareText, url };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(url);
      alert(t.linkCopied);
    }
  } catch {
    // User cancelled the share sheet — nothing to do.
  }
}

function ActivityCard({ a, lang, isRTL, onHover, hovered, onOpen, t, isSaved, onToggleSave, isLoggedIn, onAuth }) {
  return (
    <div
      onMouseEnter={() => onHover(a.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onOpen(a.id)}
      className="rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer bg-surface"
      style={{ borderColor: hovered === a.id ? "#5B8C68" : "#DCE6DC", boxShadow: hovered === a.id ? "0 6px 16px rgba(91,140,104,0.15)" : "none" }}
    >
      <div className="h-28 relative flex items-end p-3 bg-tint overflow-hidden">
        <CategoryIllustration category={a.category} photoUrl={a.photo_url} alt={a.name} className="absolute inset-0 w-full h-full" />
        <span className="relative text-xs font-semibold rounded-full px-2.5 py-1 text-white" style={{ background: categoryColor(a.category) }}>
          {CATEGORY_LABELS[lang][a.category] || a.category}
        </span>
        <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} flex gap-1.5`}>
          <button
            onClick={(e) => { e.stopPropagation(); shareActivity(a, t); }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90"
          >
            <Share2 size={15} className="text-ink" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isLoggedIn) { onAuth(); return; }
              onToggleSave(a.id, isSaved);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90"
          >
            <Heart size={16} className={isSaved ? "fill-primary text-primary" : "text-ink"} />
          </button>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-sm leading-snug mb-1.5 text-ink">{a.name}</h3>
        <div className="flex items-center gap-1.5 text-xs mb-1.5 text-inkSoft">
          <MapPin size={12} />
          <span>{a.city}</span>
          {a.distance != null && (
            <span className="font-medium text-primaryDk">
              · {a.distance < 1 ? "<1" : a.distance.toFixed(0)} {t.away}
            </span>
          )}
        </div>
        {a.hours && (
          <div className="flex items-center gap-1.5 text-xs mb-2 text-inkSoft">
            <Clock size={12} />
            <span>{a.hours}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-1">
          {a.avgRating ? (
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-star text-star" />
              <span className="font-semibold text-xs text-ink">{a.avgRating.toFixed(1)}</span>
              <span className="text-xs text-inkSoft">({a.reviewCount})</span>
            </div>
          ) : (
            <span className="text-xs text-inkSoft">{t.noRatingsYet}</span>
          )}
          <ChevronRight size={16} className={`text-primary ${isRTL ? "rotate-180" : ""}`} />
        </div>
      </div>
    </div>
  );
}

function FlyToActivities({ activities }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = activities.filter((a) => a.lat && a.lng);
    if (withCoords.length > 0) {
      const bounds = L.latLngBounds(withCoords.map((a) => [a.lat, a.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [activities, map]);
  return null;
}

function MapPanel({ activities, hovered, onHover, onOpen }) {
  const withCoords = activities.filter((a) => a.lat && a.lng);
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-line">
      <MapContainer center={DEFAULT_CENTER} zoom={8} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToActivities activities={withCoords} />
        {withCoords.map((a) => (
          <Marker
            key={a.id}
            position={[a.lat, a.lng]}
            icon={markerIcon(hovered === a.id, categoryColor(a.category))}
            eventHandlers={{
              mouseover: () => onHover(a.id),
              mouseout: () => onHover(null),
              click: () => onOpen(a.id),
            }}
          >
            <Popup>{a.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default function HomeScreen({ lang, setLang, onOpenActivity, onAdd, onAuth, onProfile, isLoggedIn, userId }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState([]);

  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedOccasion, setSelectedOccasion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [hovered, setHovered] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);

  const handleLocate = () => {
    if (userLoc) {
      setUserLoc(null);
      if (sortBy === "distance") setSortBy("rating");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy("distance");
        setLocLoading(false);
      },
      () => setLocLoading(false),
      { timeout: 8000 }
    );
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSelectedCategory("all");
  };

  const cycleSortBy = () => {
    if (sortBy === "rating") setSortBy(userLoc ? "distance" : "newest");
    else if (sortBy === "distance") setSortBy("newest");
    else setSortBy("rating");
  };
  const SORT_LABEL = { rating: t.ratingSort, distance: t.distanceSort, newest: t.newestSort };

  useEffect(() => {
    fetchActivities()
      .then((data) => setActivities(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchSavedActivityIds(userId).then(setSavedIds).catch(() => {});
    } else {
      setSavedIds([]);
    }
  }, [isLoggedIn, userId]);

  const handleToggleSave = async (activityId, isSaved) => {
    // optimistic update
    setSavedIds((prev) => (isSaved ? prev.filter((id) => id !== activityId) : [...prev, activityId]));
    try {
      if (isSaved) {
        await unsaveActivity(userId, activityId);
      } else {
        await saveActivity(userId, activityId);
      }
    } catch {
      // revert on failure
      setSavedIds((prev) => (isSaved ? [...prev, activityId] : prev.filter((id) => id !== activityId)));
    }
  };

  const filtered = useMemo(() => {
    const now = new Date();
    let list = activities
      .filter((a) => {
        const mQ = !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.city.toLowerCase().includes(query.toLowerCase());
        const mT = selectedType === "all" || a.type === selectedType;
        const mOccasion =
          selectedOccasion === "all" ||
          !a.occasion_tags ||
          a.occasion_tags.length === 0 ||
          a.occasion_tags.includes(selectedOccasion);
        const mC = selectedCategory === "all" || a.category === selectedCategory;
        const mEvent = a.type !== "event" || !a.event_start || new Date(a.event_start) >= now;
        return mQ && mT && mOccasion && mC && mEvent;
      })
      .map((a) => ({
        ...a,
        distance: userLoc && a.lat && a.lng ? getDistanceKm(userLoc.lat, userLoc.lng, a.lat, a.lng) : null,
      }));

    list.sort((a, b) => {
      if (sortBy === "distance") {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      }
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      return (b.avgRating || 0) - (a.avgRating || 0);
    });
    return list;
  }, [activities, query, selectedType, selectedOccasion, selectedCategory, sortBy, userLoc]);

  return (
    <div dir={t.dir} className="min-h-screen flex flex-col bg-bg">
      <header className="sticky top-0 z-30 backdrop-blur-sm border-b border-line bg-bg/95">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <span className="hidden sm:block font-bold text-ink text-sm">{t.brand}</span>
          </div>
          <div className="flex-1 max-w-md mx-3 relative">
            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-inkSoft ${isRTL ? "right-3.5" : "left-3.5"}`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full rounded-full py-2 text-sm outline-none border border-line bg-surface text-ink focus:border-primary transition-colors ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "he" ? "en" : "he")} className="flex items-center gap-1 text-sm font-medium rounded-full px-3 py-1.5 border border-line text-ink shrink-0">
              <Globe size={14} />
              {lang === "he" ? "EN" : "עב"}
            </button>
            {isLoggedIn ? (
              <button onClick={onProfile} className="w-9 h-9 rounded-full flex items-center justify-center bg-primaryDk text-white shrink-0">
                <UserIcon size={16} />
              </button>
            ) : (
              <button onClick={onAuth} className="text-xs sm:text-sm font-semibold rounded-full px-2.5 sm:px-4 py-1.5 bg-primaryDk text-white shrink-0 whitespace-nowrap">
                {t.signup}
              </button>
            )}
          </div>
        </div>

        {/* Row 1: Location + Type filter */}
        <div className="max-w-6xl mx-auto px-4 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={handleLocate}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              userLoc ? "bg-primaryDk text-white border-primaryDk" : "bg-surface text-ink border-line"
            }`}
          >
            <LocateFixed size={14} className={locLoading ? "animate-pulse" : ""} />
            {locLoading ? t.locating : t.nearMe}
          </button>
          <div className="w-px h-5 shrink-0 bg-line" />
          {TYPE_KEYS.map((key) => {
            const isSelected = selectedType === key;
            const color = key === "all" ? "#5B8C68" : typeColor(key);
            return (
              <button
                key={key}
                onClick={() => handleTypeChange(key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  isSelected ? "text-white" : "bg-surface text-ink border-line"
                }`}
                style={isSelected ? { background: color, borderColor: color } : undefined}
              >
                {TYPE_LABELS[lang][key]}
              </button>
            );
          })}
        </div>

        {/* Row 2: Occasion + Category filter */}
        <div className="max-w-6xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {OCCASION_KEYS.map((key) => {
            const isSelected = selectedOccasion === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedOccasion(key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  isSelected ? "bg-primaryDk text-white border-primaryDk" : "bg-surface text-ink border-line"
                }`}
              >
                {OCCASION_LABELS[lang][key]}
              </button>
            );
          })}
          {CATEGORIES_BY_TYPE[selectedType]?.length > 0 && (
            <>
              <div className="w-px h-5 shrink-0 bg-line" />
              {CATEGORIES_BY_TYPE[selectedType].map((key) => {
                const isSelected = selectedCategory === key;
                const color = key === "all" ? "#5B8C68" : categoryColor(key);
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      isSelected ? "text-white" : "bg-surface text-ink border-line"
                    }`}
                    style={isSelected ? { background: color, borderColor: color } : undefined}
                  >
                    {CATEGORY_LABELS[lang][key]}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <div className="h-64 lg:h-[calc(100vh-210px)] lg:sticky lg:top-[172px] order-1 lg:order-2">
          <MapPanel activities={filtered} hovered={hovered} onHover={setHovered} onOpen={onOpenActivity} />
        </div>

        <div className="order-2 lg:order-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-inkSoft">
              <span className="font-semibold text-ink">{filtered.length}</span> {t.results}
            </span>
            <button onClick={cycleSortBy} className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <SlidersHorizontal size={14} /> {SORT_LABEL[sortBy]}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16 text-sm text-inkSoft">{t.loading}</div>
          ) : error ? (
            <div className="text-center py-16 text-sm text-red-500">{error}</div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {filtered.map((a) => (
                <ActivityCard
                  key={a.id}
                  a={a}
                  lang={lang}
                  isRTL={isRTL}
                  hovered={hovered}
                  onHover={setHovered}
                  onOpen={onOpenActivity}
                  t={t}
                  isSaved={savedIds.includes(a.id)}
                  onToggleSave={handleToggleSave}
                  isLoggedIn={isLoggedIn}
                  onAuth={onAuth}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-sm text-inkSoft">{t.emptyState}</div>
          )}
        </div>
      </div>

      <button onClick={onAdd} className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center bg-primary z-30`}>
        <Plus size={24} />
      </button>
    </div>
  );
}
