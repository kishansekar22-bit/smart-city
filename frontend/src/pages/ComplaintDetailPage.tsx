import { resolveImageUrl } from "../utils/imageUrl"
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { complaintService, feedbackService, departmentService } from "../services/api";
import { Complaint, Department, ComplaintStatus, ComplaintPriority } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { ComplaintTimeline } from "../components/ComplaintTimeline";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getComplaintMarkerIcon } from "../utils/leafletIcons";
import {
  MapPin,
  Calendar,
  Building,
  User,
  MessageSquare,
  Star,
  Send,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Sliders,
  Maximize2,
  X,
  Phone,
  Mail,
} from "lucide-react";

interface ComplaintDetailPageProps {
  complaintId: string;
  onNavigate: (page: string) => void;
}

export const ComplaintDetailPage: React.FC<ComplaintDetailPageProps> = ({ complaintId, onNavigate }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Comments state
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Official Status Update state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>("In Progress");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Feedback State
  const [rating, setRating] = useState<number>(5);
  const [feedbackComments, setFeedbackComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Image Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getComplaintById(complaintId);
      setComplaint(data);
      setSelectedStatus(data.status);
      setSelectedDept(data.department_id || "");
    } catch (err: any) {
      error("Could not load complaint details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
    departmentService.getDepartments().then(setDepartments).catch(() => {});
  }, [complaintId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !complaint) return;
    try {
      setSubmittingComment(true);
      const added = await complaintService.addComment(complaint.id, newComment.trim(), isInternal);
      setComplaint((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...(prev.comments || []), added],
        };
      });
      setNewComment("");
      success("Comment posted successfully");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    try {
      setUpdatingStatus(true);
      await complaintService.updateComplaintStatus(complaint.id, {
        status: selectedStatus,
        department_id: selectedDept || undefined,
        note: statusNote || `Status updated to ${selectedStatus}`,
        resolution_notes: selectedStatus === "Resolved" ? statusNote : undefined,
      });
      success(`Complaint status updated to ${selectedStatus}`, "Status Updated");
      setShowStatusModal(false);
      setStatusNote("");
      await fetchComplaint();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    try {
      setSubmittingFeedback(true);
      await feedbackService.submitFeedback({
        complaint_id: complaint.id,
        rating,
        comments: feedbackComments,
      });
      success("Thank you for your rating and civic feedback!", "Feedback Submitted");
      await fetchComplaint();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading civic grievance record...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-base font-bold text-slate-800">Complaint record not found.</p>
        <button
          onClick={() => onNavigate("citizen-dashboard")}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isStaff = user && (user.role === "official" || user.role === "admin");
  const lat = complaint.latitude || 12.9716;
  const lng = complaint.longitude || 77.5946;

  return (
    <div className="space-y-8 pb-16">
      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-5 right-5 text-white p-2 rounded-full hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={resolveImageUrl(lightboxImg)}
            alt="Enlarged complaint view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
          />
        </div>
      )}

      {/* Breadcrumb / Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => onNavigate(isStaff ? "admin-complaints" : "citizen-dashboard")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {isStaff ? "Incident Console" : "Dashboard"}</span>
        </button>

        {isStaff && (
          <button
            onClick={() => setShowStatusModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>Update Status / Reassign Department</span>
          </button>
        )}
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm sm:text-base font-black text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                {complaint.ticket_id}
              </span>
              <StatusBadge status={complaint.status} size="lg" />
              <PriorityBadge priority={complaint.priority} />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {complaint.category}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {complaint.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Lodged on {new Date(complaint.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}</span>
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 sm:min-w-[220px]">
            <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Department</p>
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-brand-600" />
              <span>{complaint.department_name || "Central Municipal Intake"}</span>
            </p>
            {complaint.department_phone && (
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{complaint.department_phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Visual 6-Stage Timeline */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Progress Tracker</h3>
          <ComplaintTimeline currentStatus={complaint.status} history={complaint.status_history} />
        </div>
      </div>

      {/* Grid: Details, Photos, Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Image (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Grievance Description</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
            {complaint.landmark && (
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <strong className="text-slate-700">Landmark / Note:</strong>
                <span>{complaint.landmark}</span>
              </div>
            )}
          </div>

          {/* Photo Evidence Gallery */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Photographic Evidence</h3>
            {complaint.images && complaint.images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {complaint.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer"
                    onClick={() => setLightboxImg(img.image_url)}
                  >
                    <img
                      src={resolveImageUrl(img.image_url)}
                      alt="Complaint photo"
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <Maximize2 className="w-4 h-4" />
                      <span>Click to enlarge</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No photographs attached with this ticket.</p>
            )}
          </div>

          {/* Citizen Feedback Section if Resolved or Closed */}
          {["Resolved", "Closed"].includes(complaint.status) && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm sm:text-base">Citizen Resolution Rating & Feedback</h3>
              </div>

              {complaint.feedback ? (
                <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= complaint.feedback!.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                      />
                    ))}
                    <span className="font-bold text-slate-700 ml-2">{complaint.feedback.rating} out of 5 stars</span>
                  </div>
                  {complaint.feedback.comments && (
                    <p className="text-slate-700 italic">"{complaint.feedback.comments}"</p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Submitted on {new Date(complaint.feedback.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <p className="text-xs text-slate-600">
                    The department marked this grievance resolved. How satisfied are you with the repair quality and turnaround speed?
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Provide optional remarks about the resolution quality..."
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    {submittingFeedback ? "Submitting Rating..." : "Submit Civic Rating"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Comments & Discussion Thread */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Public Updates & Discussion ({complaint.comments?.length || 0})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {(!complaint.comments || complaint.comments.length === 0) && (
                <p className="text-xs text-slate-400 italic">No notes or comments posted yet.</p>
              )}

              {complaint.comments?.map((cm) => (
                <div
                  key={cm.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    cm.is_internal
                      ? "bg-amber-50/70 border-amber-200 text-amber-950"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{cm.user_name || "Citizen / Officer"}</span>
                      {cm.user_role && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-white/70 border rounded">
                          {cm.user_role}
                        </span>
                      )}
                      {cm.is_internal && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Internal Note
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(cm.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{cm.comment}</p>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 space-y-2">
                <textarea
                  rows={2}
                  required
                  placeholder="Post an update or question regarding this grievance..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />

                <div className="flex items-center justify-between">
                  {isStaff ? (
                    <label className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Mark as Internal Staff Note
                      </span>
                    </label>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Send className="w-3 h-3" />
                    <span>{submittingComment ? "Posting..." : "Post Comment"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">
                Please log in to participate in the civic grievance comments.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Mini Map & Location Details (Span 1) */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Location on Smart City Map</span>
            </h3>

            <div className="h-56 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <MapContainer
                center={[lat, lng]}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[lat, lng]}
                  icon={getComplaintMarkerIcon(complaint.status, complaint.priority)}
                >
                  <Popup>
                    <div className="p-2 text-xs">
                      <p className="font-bold text-slate-900">{complaint.title}</p>
                      <p className="text-slate-500">{complaint.address}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="text-xs space-y-1 pt-1">
              <p className="text-slate-500 text-[11px] font-medium">Verified Address:</p>
              <p className="font-semibold text-slate-800">{complaint.address}</p>
              <p className="text-[11px] text-slate-400 font-mono">
                GPS: {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>
          </div>

          {/* Citizen Reporter Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <span>Reported By</span>
            </h3>
            <div className="space-y-1">
              <p className="font-bold text-slate-900">{complaint.citizen_name || "Verified Resident"}</p>
              {complaint.citizen_email && (
                <p className="text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{complaint.citizen_email}</span>
                </p>
              )}
              {complaint.citizen_phone && (
                <p className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{complaint.citizen_phone}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-600" />
                <span>Update Grievance Status & Routing</span>
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Lifecycle Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Submitted">1. Submitted (Logged)</option>
                  <option value="Acknowledged">2. Acknowledged (Screened)</option>
                  <option value="Assigned">3. Assigned to Squad</option>
                  <option value="In Progress">4. In Progress (Repairs underway)</option>
                  <option value="Resolved">5. Resolved (Completed)</option>
                  <option value="Closed">6. Closed (Verified)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign / Reassign Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Keep Current Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Resolution / Progress Notes (Public audit log)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Field inspection completed. Patching crew scheduled for night shift..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {updatingStatus ? "Updating..." : "Commit Status Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};