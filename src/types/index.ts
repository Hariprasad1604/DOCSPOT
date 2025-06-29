export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  specialization?: string;
  experience?: number;
  education?: string;
  isApproved?: boolean;
  profileImage?: string;
  createdAt: Date;
}

export interface Doctor extends User {
  specialization: string;
  experience: number;
  education: string;
  consultationFee: number;
  availability: TimeSlot[];
  rating: number;
  reviewCount: number;
  bio: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  reason: string;
  patientAge?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}