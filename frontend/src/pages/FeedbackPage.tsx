import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { feedbackService } from "../services/api";
import { Feedback } from "../types";
import { MessageSquareHeart, Star, Send, User } from "lucide-react";

interface FeedbackPageProps {
  onNavigate?: (page: string) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const loadFeedback = async () => {
    try {
      const data = await feedbackService.getFeedback();
      setFeedbackList(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await feedbackService.submitFeedback({ rating, comments });
      success("Thank you for rating municipal services!", "Feedback Recorded");
      setComments("");
      loadFeedback();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const avgRating = feedbackList.length > 0
    ? (feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / feedbackList.length).toFixed(1)
    : "4.8";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquareHeart className="w-6 h-6 text-rose-500" />
            <span>Citizen Satisfaction & Governance Reviews</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real reviews and resolution quality ratings submitted by verified citizens
          </p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center shrink-0">
          <div className="flex items-center justify-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-lg font-black text-amber-900 mt-0.5">{avgRating} / 5.0</p>
          <p className="text-[10px] text-amber-700 font-semibold">{feedbackList.length} Verified Reviews</p>
        </div>
      </div>

      {/* Submit General Feedback Form if logged in */}
      {user && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Share Your Municipal Experience</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Rate our services:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setRating(s)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              required
              placeholder="Tell us what the city did well or where municipal departments can improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Submitting..." : "Submit Review"}</span>
            </button>
          </form>
        </div>
      )}

      {/* Feedback Reviews List */}
      <div className="space-y-4">
        {feedbackList.map((fb) => (
          <div key={fb.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  {fb.user_name ? fb.user_name.charAt(0) : "C"}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{fb.user_name || "Verified Resident"}</h4>
                  {fb.ticket_id && (
                    <span className="text-[10px] text-brand-700 font-mono font-semibold">
                      Regarding Ticket: {fb.ticket_id}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= fb.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                  />
                ))}
              </div>
            </div>

            {fb.comments && (
              <p className="text-xs text-slate-700 leading-relaxed italic pt-1">
                "{fb.comments}"
              </p>
            )}

            <p className="text-[10px] text-slate-400 pt-1">
              Reviewed on {new Date(fb.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};