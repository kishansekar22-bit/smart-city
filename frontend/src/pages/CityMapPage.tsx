import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import { complaintService, serviceService } from "../services/api";
import { Complaint, PublicService } from "../types";
import { getServiceIcon, getComplaintMarkerIcon } from "../utils/leafletIcons";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import {
  MapPin,
  Filter,
  Layers,
  Search,
  Phone,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface CityMapPageProps {
  onNavigate: (page: string) => void;
}

const CATEGORY_FILTERS = [
  { id: "complaints", label: "Civic Complaints", color: "bg-sky-500" },
  { id: "Hospitals", label: "Hospitals", color: "bg-rose-500" },
  { id: "Police stations", label: "Police Stations", color: "bg-blue-700" },
  { id: "Fire stations", label: "Fire Stations", color: "bg-amber-600" },
  { id: "EV charging stations", label: "EV Chargers", color: "bg-emerald-600" },
  { id: "Parks", label: "Parks & Gardens", color: "bg-green-600" },
  { id: "Bus stops", label: "Transit & Bus Stops", color: "bg-cyan-600" },
  { id: "Parking areas", label: "Smart Parking", color: "bg-indigo-600" },
  { id: "Public toilets", label: "Public e-Toilets", color: "bg-teal-600" },
  { id: "Government offices", label: "Civic Offices", color: "bg-purple-600" },
];

export const CityMapPage: React.FC<CityMapPageProps> = ({ onNavigate }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);

  // Active category filters (all on by default)
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({
    complaints: true,
    Hospitals: true,
    "Police stations": true,
    "Fire stations": true,
    "EV charging stations": true,
    Parks: true,
    "Bus stops": true,
    "Parking areas": true,
    "Public toilets": true,
    "Government offices": true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cData, sData] = await Promise.all([
        complaintService.getComplaints({ limit: 100 }),
        serviceService.getServices(),
      ]);
      setComplaints(cData.complaints);
      setServices(sData);
    } catch (err) {
      console.error("Map data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (enable: boolean) => {
    const next: Record<string, boolean> = {};
    CATEGORY_FILTERS.forEach((f) => {
      next[f.id] = enable;
    });
    setActiveFilters(next);
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (!activeFilters.complaints) return false;
    if (!c.latitude || !c.longitude) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.ticket_id.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter services
  const filteredServices = services.filter((s) => {
    if (!activeFilters[s.category]) return false;
    if (!s.latitude || !s.longitude) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600" />
            <span>Interactive Smart City GIS Map</span>
          </h1>
          <p className="text-xs text-slate-500">
            Displaying live reported civic defects, public amenities, and emergency facilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search map places or tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none w-48 sm:w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              showFilterPanel
                ? "bg-brand-50 text-brand-700 border-brand-300"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Layers ({Object.values(activeFilters).filter(Boolean).length})</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Refresh map pins"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Layer Filter Pills */}
      {showFilterPanel && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Map Marker Layers</span>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => toggleAll(true)}
                className="text-brand-600 font-bold hover:underline"
              >
                Select All
              </button>
              <span>&bull;</span>
              <button
                onClick={() => toggleAll(false)}
                className="text-slate-500 hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {CATEGORY_FILTERS.map((f) => {
              const active = !!activeFilters[f.id];
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    active
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${f.color}`} />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Full-Screen Map Container */}
      <div className="h-[68vh] rounded-2xl overflow-hidden border border-slate-300 shadow-md relative">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render Complaints Markers */}
          {filteredComplaints.map((c) => (
            <Marker
              key={c.id}
              position={[c.latitude!, c.longitude!]}
              icon={getComplaintMarkerIcon(c.status, c.priority)}
            >
              <Popup>
                <div className="p-3 max-w-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                      {c.ticket_id}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                  <p className="text-slate-500 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{c.address}</span>
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-700 text-[11px]">{c.category}</span>
                    <button
                      onClick={() => onNavigate(`complaint-detail-${c.id}`)}
                      className="text-brand-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Public Services Markers */}
          {filteredServices.map((s) => (
            <Marker
              key={s.id}
              position={[s.latitude, s.longitude]}
              icon={getServiceIcon(s.category)}
            >
              <Popup>
                <div className="p-3 max-w-xs space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {s.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                  <p className="text-slate-500 text-[11px]">{s.address}</p>
                  {s.phone && (
                    <p className="text-emerald-700 font-medium text-[11px] flex items-center gap-1 pt-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{s.phone}</span>
                    </p>
                  )}
                  {s.opening_hours && (
                    <p className="text-brand-700 font-medium text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-600" />
                      <span>{s.opening_hours}</span>
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Legend Floating Overlay */}
        <div className="absolute bottom-4 left-4 z-[500] bg-white/95 backdrop-blur px-3 py-2 rounded-xl shadow-lg border border-slate-200 text-[11px] hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600" />
            <span className="font-medium text-slate-700">Critical / Hospitals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="font-medium text-slate-700">In Progress / Police</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="font-medium text-slate-700">Resolved / EV Chargers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-700" />
            <span className="font-medium text-slate-700">Parks</span>
          </div>
        </div>
      </div>
    </div>
  );
};