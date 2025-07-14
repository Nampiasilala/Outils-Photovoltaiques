export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  department: string;
  joinDate: string;
  lastLogin: string | null;
}

export interface UserFormData {
  username: string;
  email: string;
  role: string;
  department: string;
  status: string;
}
