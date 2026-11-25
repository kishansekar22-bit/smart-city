import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { announcementService } from "../services/api";
import { Announcement } from "../types";
import { Radio, Search, PlusCircle, Pin, Calendar, X, Trash2, ArrowRight } from "lucide-react";

const CATEGORIES = [
  "All",
  "Infrastructure",
  "Public Meetings",
  "Road Maintenance",
  "Utility Updates",
  "Public Events",
  "Government Notices",
];

interface AnnouncementsPageProps {
  onNavigate?: (page: string) => void;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedCat, setSelectedCat] = useState("Infrastructure");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Selected item modal for reading full content
  const [viewItem, setViewItem] = useState<Announcement | null>(null);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAnnouncements({
        category: category !== "All" ? category : undefined,
        search: search || undefined,
      });
      setAnnouncements(data);
    } catch (err: any) {
      error("Failed to fetch announcements: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [category, search]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      error("Please fill in title and content.");
      return;
    }
    try {
      setPublishing(true);
      await announcementService.createAnnouncement({
        title,
        category: selectedCat,
        content,
        image_url: imageUrl || undefined,
        is_pinned: isPinned,
      });
      success("City announcement published successfully!", "Notice Broadcasted");
      setShowModal(false);
      setTitle("");
      setContent("");
      setImageUrl("");
      setIsPinned(false);
      loadAnnouncements();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to publish notice");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this city announcement?")) return;
    try {
      await announcementService.deleteAnnouncement(id);
      success("Announcement removed", "Deleted");
      loadAnnouncements();
    } catch (err: any) {
      error("Failed to delete announcement: " + err.message);
    }
  };

  const isStaff = user && (user.role === "official" || user.role === "admin");

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-brand-600" />
            <span>City Announcements & Public Notices</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official municipal communications regarding tenders, civic events, ward meetings, and infrastructure works
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
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
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 w-full sm:w-60"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
              ann.is_pinned ? "border-brand-400 ring-1 ring-brand-400/30" : "border-slate-200"
            }`}
          >
            <div>
              {ann.image_url && (
                <div className="h-44 overflow-hidden bg-slate-100 relative">
                  <img
                    src={ann.image_url}
                    alt={ann.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {ann.is_pinned && (
                    <span className="absolute top-3 right-3 bg-brand-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned Notice
                    </span>
                  )}
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(ann.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">{ann.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{ann.content}</p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between">
              <button
                onClick={() => setViewItem(ann)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 pt-3"
              >
                <span>Read Full Announcement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {isStaff && (
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors pt-3"
                  title="Delete notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Full Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  {viewItem.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{viewItem.title}</h3>
              </div>
              <button onClick={() => setViewItem(null)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewItem.image_url && (
              <img src={viewItem.image_url} alt={viewItem.title} className="w-full h-56 object-cover rounded-xl" />
            )}

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {viewItem.content}
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Published: {new Date(viewItem.created_at).toLocaleString("en-IN")}</span>
              <button
                onClick={() => setViewItem(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Publish Public Notice</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asphalting of Old Airport Road Begins"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-brand-500"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Full text of the municipal update or public announcement..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Pin this notice to top of announcements</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {publishing ? "Publishing..." : "Broadcast Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};