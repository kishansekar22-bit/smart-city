import axios from "axios";
import {
  User,
  Complaint,
  EmergencyAlert,
  Announcement,
  PublicService,
  Department,
  AnalyticsData,
  Feedback,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smart_city_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized on protected call, clear invalid credentials
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register" && currentPath !== "/") {
        // localStorage.removeItem("smart_city_token");
        // localStorage.removeItem("smart_city_user");
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ message: string; token: string; user: User }>("/auth/login", { email, password });
    return res.data;
  },
  register: async (full_name: string, email: string, phone: string, password: string) => {
    const res = await api.post<{ message: string; token: string; user: User }>("/auth/register", {
      full_name,
      email,
      phone,
      password,
    });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<{ user: User }>("/auth/me");
    return res.data.user;
  },
};

export const complaintService = {
  getComplaints: async (params?: {
    category?: string;
    status?: string;
    priority?: string;
    department_id?: string;
    citizen_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const res = await api.get<{ total: number; complaints: Complaint[] }>("/complaints", { params });
    return res.data;
  },
  getComplaintById: async (id: string) => {
    const res = await api.get<{ complaint: Complaint }>(`/complaints/${id}`);
    return res.data.complaint;
  },
  createComplaint: async (formData: FormData) => {
    const res = await api.post<{ message: string; ticket_id: string; complaint: Complaint }>("/complaints", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  updateComplaintStatus: async (
    id: string,
    data: { status?: string; note?: string; resolution_notes?: string; department_id?: string; priority?: string }
  ) => {
    const res = await api.put<{ message: string; complaintId: string; status: string }>(`/complaints/${id}/status`, data);
    return res.data;
  },
  addComment: async (id: string, comment: string, is_internal: boolean = false) => {
    const res = await api.post<{ message: string; comment: any }>(`/complaints/${id}/comments`, {
      comment,
      is_internal,
    });
    return res.data.comment;
  },
  deleteComplaint: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/complaints/${id}`);
    return res.data;
  },
};

export const alertService = {
  getAlerts: async (params?: { active_only?: boolean; severity?: string }) => {
    const res = await api.get<{ alerts: EmergencyAlert[] }>("/alerts", { params });
    return res.data.alerts;
  },
  createAlert: async (data: { title: string; description: string; severity: string; area?: string }) => {
    const res = await api.post<{ message: string; alert: EmergencyAlert }>("/alerts", data);
    return res.data.alert;
  },
  updateAlert: async (id: string, data: Partial<EmergencyAlert>) => {
    const res = await api.put<{ message: string; alert: EmergencyAlert }>(`/alerts/${id}`, data);
    return res.data.alert;
  },
  deleteAlert: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/alerts/${id}`);
    return res.data;
  },
};

export const announcementService = {
  getAnnouncements: async (params?: { category?: string; search?: string }) => {
    const res = await api.get<{ announcements: Announcement[] }>("/announcements", { params });
    return res.data.announcements;
  },
  createAnnouncement: async (data: { title: string; category: string; content: string; is_pinned?: boolean; image_url?: string }) => {
    const res = await api.post<{ message: string; announcement: Announcement }>("/announcements", data);
    return res.data.announcement;
  },
  deleteAnnouncement: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/announcements/${id}`);
    return res.data;
  },
};

export const serviceService = {
  getServices: async (params?: { category?: string; search?: string }) => {
    const res = await api.get<{ services: PublicService[] }>("/services", { params });
    return res.data.services;
  },
  createService: async (data: Partial<PublicService>) => {
    const res = await api.post<{ message: string; service: PublicService }>("/services", data);
    return res.data.service;
  },
  deleteService: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/services/${id}`);
    return res.data;
  },
};

export const analyticsService = {
  getDashboard: async () => {
    const res = await api.get<AnalyticsData>("/analytics/dashboard");
    return res.data;
  },
};

export const departmentService = {
  getDepartments: async () => {
    const res = await api.get<{ departments: Department[] }>("/departments");
    return res.data.departments;
  },
};

export const feedbackService = {
  getFeedback: async () => {
    const res = await api.get<{ feedback: Feedback[] }>("/feedback");
    return res.data.feedback;
  },
  submitFeedback: async (data: { complaint_id?: string; rating: number; comments?: string }) => {
    const res = await api.post<{ message: string; feedbackId: string }>("/feedback", data);
    return res.data;
  },
};