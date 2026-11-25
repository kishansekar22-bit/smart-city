export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at?: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  password_hash?: string;
  role_id: string;
  role?: string;
  department_id?: string | null;
  department_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Complaint {
  id: string;
  ticket_id: string;
  citizen_id: string;
  citizen_name?: string;
  citizen_email?: string;
  citizen_phone?: string;
  department_id?: string | null;
  department_name?: string | null;
  title: string;
  category: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Submitted' | 'Acknowledged' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  latitude?: number | null;
  longitude?: number | null;
  address: string;
  landmark?: string | null;
  resolution_notes?: string | null;
  images?: ComplaintImage[];
  comments?: ComplaintComment[];
  status_history?: ComplaintStatusHistory[];
  created_at: string;
  updated_at: string;
}

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
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  changed_by: string;
  changed_by_name?: string;
  status: string;
  note?: string | null;
  created_at: string;
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

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'Informational' | 'Warning' | 'Critical';
  area?: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_by_name?: string | null;
  resolved_at?: string | null;
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
  created_at?: string;
}

export interface Feedback {
  id: string;
  complaint_id?: string | null;
  user_id: string;
  user_name?: string;
  rating: number;
  comments?: string | null;
  created_at: string;
}

export interface AuthTokenPayload {
  userId: string;
  role: string;
  email: string;
  fullName: string;
  departmentId?: string | null;
}