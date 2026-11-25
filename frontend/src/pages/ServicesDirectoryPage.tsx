import React, { useState, useEffect } from "react";
import { serviceService } from "../services/api";
import { PublicService } from "../types";
import { Building, Search, MapPin, Phone, Clock, Mail, ExternalLink } from "lucide-react";

interface ServicesDirectoryPageProps {
  onNavigate: (page: string) => void;
}

const SERVICE_CATEGORIES = [
  "All",
  "Hospitals",
  "Police stations",
  "Fire stations",
  "EV charging stations",
  "Parks",
  "Bus stops",
  "Parking areas",
  "Public toilets",
  "Libraries",
  "Government offices",
];

export const ServicesDirectoryPage: React.FC<ServicesDirectoryPageProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<PublicService[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const data = await serviceService.getServices({
          category: category !== "All" ? category : undefined,
          search: search || undefined,
        });
        setServices(data);
      } catch (err) {
        console.error("Services fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, [category, search]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Building className="w-6 h-6 text-brand-600" />
          <span>City Public Services Directory</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Search emergency healthcare, police stations, EV charging superhubs, public transit stations, and government citizen service centers
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category === cat
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <input
            type="text"
            placeholder="Search by facility name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 w-full sm:w-64"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-brand-300 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  {s.category}
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">{s.name}</h3>
              <p className="text-xs text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{s.address}</span>
              </p>

              {s.phone && (
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{s.phone}</span>
                </p>
              )}

              {s.email && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{s.email}</span>
                </p>
              )}

              {s.opening_hours && (
                <p className="text-[11px] text-brand-800 font-medium flex items-center gap-1.5 pt-1 bg-brand-50/50 p-2 rounded-lg border border-brand-100">
                  <Clock className="w-3 h-3 text-brand-600" />
                  <span>{s.opening_hours}</span>
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
              </span>
              <button
                onClick={() => onNavigate("city-map")}
                className="text-brand-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>View on GIS Map</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};