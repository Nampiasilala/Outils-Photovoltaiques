export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  department: string | null;
  lastLogin: string | null;
  joinDate: string;
  avatar?: string;
}

export interface UserFormData {
  username: string;
  email: string;
  role: string;
  department: string;
  status: string;
}