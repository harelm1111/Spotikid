import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin, Clock, Star, Search, SlidersHorizontal, Heart, ChevronRight,
  Globe, X, Plus, Users,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchActivities } from "../lib/api";

const COPY = {
  he: {
    dir: "rtl",
    brand: "מה עושים היום",
    searchPlaceholder: "חפשו עיר, אטרקציה או סוג פעילות...",
    myKids: "הילדים שלי",
    addChild: "הוסף ילד/ה",
    childAge: "גיל",
    done: "סגירה",
    results: "תוצאות נמצאו",
    distanceSort: "מרחק",
    ratingSort: "דירוג",
    away: "ק״מ",
    signup: "הרשמה / התחברות",
    emptyState: "לא מצאנו אטרקציות שתואמות לסינון. נסו להרחיב את החיפוש, או הוסיפו אטרקציה בעצמכם!",
    loading: "טוען אטרקציות...",
    noRatingsYet: "אין דירוגים עדיין",
  },
  en: {
    dir: "ltr",
    brand: "What To Do Today",
    searchPlaceholder: "Search city, attraction or activity type...",
    myKids: "My kids",
    addChild: "Add a child",
    childAge: "Age",
    done: "Done",
    results: "results found",
    distanceSort: "Distance",
    ratingSort: "Rating",
    away: "km",
    signup: "Sign up / Log in",
    emptyState: "No activities match your filters. Try widening your search, or add one yourself!",
    loading: "Loading activities...",
    noRatingsYet: "No ratings yet",
  },
};

const CATEGORY_KEYS = ["all", "nature", "water", "culture", "outdoor", "games"];
const CATEGORY_LABELS = {
  he: { all: "הכל", nature: "טבע ובעלי חיים", water: "מים וקיץ", culture: "תרבות ולמידה", outdoor: "טיולים בטבע", games: "אתגר ומשחק" },
  en: { all: "All", nature: "Nature & Animals", water: "Water & Summer", culture: "Culture & Learning", outdoor: "Outdoor & Hiking", games: "Games & Challenges" },
};

// Default map center: Israel
const DEFAULT_CENTER = [31.7683, 35.2137];

const markerIcon = (highlighted) =>
  L.divIcon({
    html: `<div style="
      background:${highlighted ? "#3E6B4A" : "#5B8C68"};
      width:${highlighted ? "28px" : "22px"}; height:${highlighted ? "28px" : "22px"};
      border-radius:50%; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.25);
    "></div>`,
    className: "",
    iconSize: highlighted ? [28, 28] : [22, 22],
  });

function ActivityCard({ a, lang, isRTL, onHover, hovered, onOpen, t }) {
  const [saved, setSaved] = useState(false);
  const rating = a.avgRating ? a.avgRating.toFixed(1) : null;

  return (
    <div
      onMouseEnter={() => onHover(a.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onOpen(a.id)}
      className="rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer bg-surface"
      style={{ borderColor: hovered === a.id ? "#5B8C68" : "#DCE6DC", boxShadow: hovered === a.id ? "0 6px 16px rgba(91,140,104,0.15)" : "none" }}
    >
      <div className="h-28 relative flex items-end p-3 bg-tint">
        {a.photo_url ? (
          <img src={a.photo_url} alt={a.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <span className="relative text-xs font-semibold rounded-full px-2.5 py-1 bg-primary text-white">
          {CATEGORY_LABELS[lang][a.category] || a.category}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} w-8 h-8 rounded-full flex items-center justify-center bg-white/90`}
        >
          <Heart size={16} className={saved ? "fill-primary text-primary" : "text-ink"} />
        </button>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-sm leading-snug mb-1.5 text-ink">{a.name}</h3>
        <div className="flex items-center gap-1.5 text-xs mb-1.5 text-inkSoft">
          <MapPin size={12} />
          <span>{a.city}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs mb-2 text-inkSoft">
          <Clock size={12} />
          <span>{a.hours}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          {rating ? (
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-star text-star" />
              <span className="font-semibold text-xs text-ink">{rating}</span>
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
            icon={markerIcon(hovered === a.id)}
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

export default function HomeScreen({ lang, setLang, onOpenActivity, onAdd, onAuth, isLoggedIn }) {
  const t = COPY[lang];
  const isRTL = t.dir === "rtl";
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [kids, setKids] = useState([{ id: 1, age: 4 }]);
  const [kidsOpen, setKidsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    fetchActivities()
      .then((data) => setActivities(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const kidAges = kids.map((k) => k.age);

  const filtered = useMemo(() => {
    let list = activities.filter((a) => {
      const mQ = !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.city.toLowerCase().includes(query.toLowerCase());
      const mA = kidAges.length === 0 || kidAges.some((age) => age >= a.age_min && age <= a.age_max);
      const mC = selectedCategory === "all" || a.category === selectedCategory;
      return mQ && mA && mC;
    });
    list.sort((a, b) => {
      if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0);
      return 0;
    });
    return list;
  }, [activities, query, kidAges.join(","), selectedCategory, sortBy]);

  const addChild = () => setKids([...kids, { id: (kids.length ? Math.max(...kids.map((k) => k.id)) : 0) + 1, age: 4 }]);
  const removeChild = (id) => setKids(kids.filter((k) => k.id !== id));
  const updateAge = (id, age) => setKids(kids.map((k) => (k.id === id ? { ...k, age } : k)));

  return (
    <div dir={t.dir} className="min-h-screen flex flex-col bg-bg">
      <header className="sticky top-0 z-30 backdrop-blur-sm border-b border-line bg-bg/95">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 bg-primary">
              🌿
            </div>
            <span className="font-bold text-lg hidden sm:inline text-ink">{t.brand}</span>
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
            {!isLoggedIn && (
              <button onClick={onAuth} className="text-xs sm:text-sm font-semibold rounded-full px-2.5 sm:px-4 py-1.5 bg-primaryDk text-white shrink-0 whitespace-nowrap">
                {t.signup}
              </button>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setKidsOpen(!kidsOpen)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              kidsOpen ? "bg-primaryDk text-white border-primaryDk" : "bg-surface text-ink border-line"
            }`}
          >
            <Users size={14} />
            {t.myKids}
            {kids.length > 0 && (
              <span className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${kidsOpen ? "bg-white text-primaryDk" : "bg-primary text-white"}`}>
                {kids.length}
              </span>
            )}
          </button>
          <div className="w-px h-5 shrink-0 bg-line" />
          {CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedCategory === key ? "bg-primary text-white border-primary" : "bg-surface text-ink border-line"
              }`}
            >
              {CATEGORY_LABELS[lang][key]}
            </button>
          ))}
        </div>

        {kidsOpen && (
          <div className="max-w-6xl mx-auto px-4 pb-4">
            <div className="rounded-2xl p-4 shadow-sm border border-line bg-surface">
              <div className="space-y-2.5 mb-3">
                {kids.map((kid, idx) => (
                  <div key={kid.id} className="flex items-center gap-3">
                    <span className="text-sm w-16 shrink-0 text-inkSoft">{lang === "he" ? `ילד/ה ${idx + 1}` : `Child ${idx + 1}`}</span>
                    <input type="range" min="0" max="14" value={kid.age} onChange={(e) => updateAge(kid.id, parseInt(e.target.value))} className="flex-1 accent-primary" />
                    <span className="text-sm font-semibold w-20 shrink-0 text-ink">{t.childAge} {kid.age}</span>
                    <button onClick={() => removeChild(kid.id)} className="text-inkSoft shrink-0"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={addChild} className="flex items-center gap-1 text-sm font-medium text-primaryDk">
                  <Plus size={14} /> {t.addChild}
                </button>
                <button onClick={() => setKidsOpen(false)} className="text-sm font-semibold rounded-full px-4 py-1.5 bg-primaryDk text-white">
                  {t.done}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <div className="h-64 lg:h-[calc(100vh-180px)] lg:sticky lg:top-[148px] order-1 lg:order-2">
          <MapPanel activities={filtered} hovered={hovered} onHover={setHovered} onOpen={onOpenActivity} />
        </div>

        <div className="order-2 lg:order-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-inkSoft">
              <span className="font-semibold text-ink">{filtered.length}</span> {t.results}
            </span>
            <button onClick={() => setSortBy(sortBy === "rating" ? "newest" : "rating")} className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <SlidersHorizontal size={14} /> {t.ratingSort}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16 text-sm text-inkSoft">{t.loading}</div>
          ) : error ? (
            <div className="text-center py-16 text-sm text-red-500">{error}</div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {filtered.map((a) => (
                <ActivityCard key={a.id} a={a} lang={lang} isRTL={isRTL} hovered={hovered} onHover={setHovered} onOpen={onOpenActivity} t={t} />
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
