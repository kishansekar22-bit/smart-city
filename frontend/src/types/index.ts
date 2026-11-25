export type UserRole = 'citizen' | 'official' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  role_id?: string;
  department_id?: string | null;
  department_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintStatus = 'Submitted' | 'Acknowledged' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';

export interface ComplaintImage {
  id: string;
  complaint_id: string;
  image_url: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  user_id: string;
  user_name?: string;
  user_role?: string;
  avatar_url?: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  changed_by: string;
  changed_by_name?: string;
  role_name?: string;
  status: ComplaintStatus;
  note?: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  complaint_id?: string | null;
  complaint_title?: string | null;
  ticket_id?: string | null;
  user_id: string;
  user_name?: string;
  avatar_url?: string;
  rating: number;
  comments?: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  ticket_id: string;
  citizen_id: string;
  citizen_name?: string;
  citizen_email?: string;
  citizen_phone?: string;
  citizen_avatar?: string;
  department_id?: string | null;
  department_name?: string | null;
  department_code?: string | null;
  department_email?: string | null;
  department_phone?: string | null;
  title: string;
  category: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  latitude?: number | null;
  longitude?: number | null;
  address: string;
  landmark?: string | null;
  resolution_notes?: string | null;
  image_url?: string | null;
  images?: ComplaintImage[];
  comments?: ComplaintComment[];
  comment_count?: number;
  status_history?: ComplaintStatusHistory[];
  feedback?: Feedback | null;
  created_at: string;
  updated_at: string;
}

export type AlertSeverity = 'Informational' | 'Warning' | 'Critical';

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  area?: string | null;
  is_active: boolean;
  created_by?: string | null;
  author_name?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: string;
  content: string;
  author_id?: string | null;
  author_name?: string | null;
  is_pinned: boolean;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicService {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  opening_hours?: string | null;
  latitude: number;
  longitude: number;
  department_id?: string | null;
  department_name?: string | null;
  created_at?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface AnalyticsData {
  kpis: {
    totalComplaints: number;
    pendingComplaints: number;
    inProgressComplaints: number;
    resolvedComplaints: number;
    activeAlerts: number;
    totalCitizens: number;
    avgResolutionHours: number;
    satisfactionRate: number;
  };
  categoryBreakdown: { category: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  priorityBreakdown: { priority: string; count: number }[];
  areaBreakdown: { area: string; count: number }[];
  timelineData: { month: string; submitted: number; resolved: number; avgHours: number }[];
  departmentPerformance: { id: string; name: string; code: string; total: number; resolved: number; rate: number }[];
}