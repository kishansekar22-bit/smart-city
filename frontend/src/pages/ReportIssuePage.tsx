import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { complaintService } from "../services/api";
import { LocationPicker } from "../components/LocationPicker";
import { ComplaintPriority, Complaint } from "../types";
import {
  FileCheck,
  MapPin,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  UploadCloud,
  X,
  Sparkles,
  Ticket,
  Copy,
} from "lucide-react";

interface ReportIssuePageProps {
  onNavigate: (page: string) => void;
}

const CATEGORIES = [
  "Roads & Potholes",
  "Streetlights",
  "Garbage & Waste",
  "Water Supply",
  "Drainage",
  "Traffic Signals",
  "Public Transport",
  "Parks & Public Spaces",
  "Electricity",
  "Pollution",
  "Other",
];

const PRIORITIES: { value: ComplaintPriority; label: string; desc: string }[] = [
  { value: "Low", label: "Low", desc: "Non-urgent minor aesthetic or delayed issues" },
  { value: "Medium", label: "Medium", desc: "Standard inconvenience requiring scheduled repair" },
  { value: "High", label: "High", desc: "Substantial obstruction, damage or public hazard" },
  { value: "Critical", label: "Critical", desc: "Immediate public safety emergency or hazard" },
];

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Roads & Potholes");
  const [priority, setPriority] = useState<ComplaintPriority>("Medium");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [latitude, setLatitude] = useState<number | null>(12.9716);
  const [longitude, setLongitude] = useState<number | null>(77.5946);
  const [additionalComments, setAdditionalComments] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Success Confirmation State
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Only image files (JPEG, PNG, WebP) are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error("Image file size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    // If address is empty, provide a helpful default area hint
    if (!address) {
      setAddress(`Near Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}, Bengaluru`);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!title.trim()) {
        error("Please enter a descriptive issue title.");
        return;
      }
    }
    if (step === 2) {
      if (!description.trim()) {
        error("Please provide a detailed description of the problem.");
        return;
      }
      if (!address.trim()) {
        error("Please enter the street address or locality.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("description", description.trim());
      formData.append("address", address.trim());
      if (landmark.trim()) formData.append("landmark", landmark.trim());
      if (latitude) formData.append("latitude", latitude.toString());
      if (longitude) formData.append("longitude", longitude.toString());
      if (additionalComments.trim()) formData.append("landmark", `${landmark ? landmark + " | " : ""}Comments: ${additionalComments}`);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await complaintService.createComplaint(formData);
      setSubmittedComplaint(res.complaint);
      success(`Ticket ${res.ticket_id} registered successfully!`, "Grievance Lodged");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to submit civic issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTicketId = () => {
    if (submittedComplaint) {
      navigator.clipboard.writeText(submittedComplaint.ticket_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // If submitted successfully, display Confirmation Screen
  if (submittedComplaint) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Grievance Successfully Registered
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Thank You, Citizen!</h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your report has been logged in the Municipal Corporation central dispatch system and assigned to the relevant department.
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-tealbrand-50 border border-brand-200 max-w-md mx-auto">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Unique Ticket Reference</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-brand-900 tracking-tight">
                {submittedComplaint.ticket_id}
              </span>
              <button
                onClick={copyTicketId}
                className="p-2 rounded-lg bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors shadow-sm"
                title="Copy Ticket ID"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && <p className="text-[11px] text-emerald-600 font-semibold mt-1">Copied to clipboard!</p>}

            <div className="mt-4 pt-3 border-t border-brand-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Status: <strong className="text-brand-800 font-bold">Submitted</strong></span>
              <span>Dept: <strong className="text-slate-800">{submittedComplaint.department_name || "Auto-Routing"}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate(`complaint-detail-${submittedComplaint.id}`)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Track Complaint Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate("city-map")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
            >
              View on Live City Map
            </button>

            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setStep(1);
                setTitle("");
                setDescription("");
                setAddress("");
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="w-full sm:w-auto px-4 py-3 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              + Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-8 pb-16">
      {/* Wizard Header */}
      <div>
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Citizen Grievance Redressal</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Report a Civic Issue</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Help maintain clean roads, working utilities, and safe public infrastructure across our smart city.
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2 border-b border-slate-200 pb-4">
        {[
          { num: 1, label: "Issue Category" },
          { num: 2, label: "Location & Details" },
          { num: 3, label: "Photo Evidence" },
          { num: 4, label: "Review & Lodge" },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 cursor-pointer pb-1 border-b-2 transition-all ${
              step === s.num
                ? "border-brand-600 text-brand-700 font-bold"
                : step > s.num
                ? "border-emerald-500 text-emerald-600 font-medium"
                : "border-transparent text-slate-400"
            }`}
            onClick={() => s.num < step && setStep(s.num)}
          >
            <span
              className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                step === s.num
                  ? "bg-brand-600 text-white"
                  : step > s.num
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </span>
            <span className="text-xs hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Category, Title, Priority */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              1. Issue Title / Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Broken water pipe leaking continuously on 80 Feet Road"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">Briefly summarize the defect or nuisance.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. Civic Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    category === cat
                      ? "bg-brand-50 border-brand-600 text-brand-800 ring-2 ring-brand-500/20 shadow-sm"
                      : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. Priority Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    priority === p.value
                      ? "bg-brand-50 border-brand-600 ring-2 ring-brand-500/20"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mb-1 ${
                    p.value === "Critical" ? "bg-rose-100 text-rose-800" :
                    p.value === "High" ? "bg-amber-100 text-amber-800" :
                    p.value === "Medium" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-700"
                  }`}>
                    {p.label}
                  </span>
                  <p className="text-xs text-slate-600">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Next: Location Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Description & Map Pin & Address */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe the issue in detail, how long it has been present, and any immediate hazards to pedestrians or vehicles..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Interactive Leaflet Map Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Pin Exact Location on City Map <span className="text-rose-500">*</span>
            </label>
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={handleLocationChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Street Address / Ward <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 100 Feet Road, Indiranagar"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Prominent Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Opposite Metro Pillar 142"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Next: Photo Evidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Photo Upload & Additional Comments */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Upload Photo Evidence
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Attaching a clear photo speeds up municipal verification and field dispatch by 60%. Max file size 5MB.
            </p>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-sm">
                <img src={previewUrl} alt="Preview" className="w-full h-56 object-cover" />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-brand-50/30 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 text-brand-500 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Click to upload or drag and drop</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, or WebP (max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Optional Additional Notes for Dispatch Officer
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Best time for field inspection is morning before peak office traffic..."
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Next: Review & Lodge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Final Review & Submit */}
      {step === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">Review Grievance Summary</h3>
            <p className="text-xs text-slate-500">Please review the captured information before final dispatch.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Title:</span>
              <span className="font-bold text-slate-800 text-right max-w-sm">{title}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Category:</span>
              <span className="font-bold text-brand-700">{category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Priority:</span>
              <span className="font-bold">{priority}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Address:</span>
              <span className="font-medium text-slate-800 text-right max-w-sm">{address}</span>
            </div>
            {landmark && (
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Landmark:</span>
                <span className="text-slate-800">{landmark}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">GPS Coordinates:</span>
              <span className="font-mono text-slate-700">{latitude?.toFixed(4)}, {longitude?.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Description:</span>
              <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                {description}
              </p>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 pt-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Photo attached: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-tealbrand-600 hover:from-emerald-700 hover:to-tealbrand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Registering Grievance..." : "Confirm & Lodge Grievance"}</span>
              <FileCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};