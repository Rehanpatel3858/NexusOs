export type Priority = 'low' | 'medium' | 'high';

export type EventCategory = 'Work' | 'Study' | 'Meeting' | 'Personal' | 'Health' | 'Important';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  bio: string;
  role: 'student' | 'faculty' | 'professional' | 'entrepreneur' | 'ADMIN';
  location: string;
  website: string;
  avatarUrl?: string;
  // Account preferences
  darkMode: boolean;
  emailNotifications: boolean;
  desktopNotifications: boolean;
  aiSuggestions: boolean;
  weeklyReports: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  priority: Priority;
  category: EventCategory;
  reminder?: string; // '5min' | '15min' | '30min' | '1hr' | '1day' | 'none'
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  location: string;
  color: string; // Hex color or Tailwind class prefix
}

export interface RecentActivity {
  id: string;
  text: string;
  timestamp: string;
  category: 'task' | 'profile' | 'workspace' | 'calendar' | 'system';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  submissionType: 'file' | 'camera' | 'image' | 'text';
  content: string; // Text content, simulated filename, or capture
  marks?: number;
  feedback?: string;
}

export interface ClassroomAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  submissions: StudentSubmission[];
}

export interface ClassroomAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'file';
  attachmentUrl?: string;
  isTask?: boolean;
  taskPriority?: 'low' | 'medium' | 'high';
  taskDueDate?: string;
  type?: 'message' | 'material';
}

export interface ClassroomMaterial {
  id: string;
  title: string;
  url: string;
  type: string;
  date: string;
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  students: string[]; // Student user IDs
  assignments: ClassroomAssignment[];
  announcements: ClassroomAnnouncement[];
  materials: ClassroomMaterial[];
  attendance: { [date: string]: string[] }; // date -> list of studentIds present
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // Student/Employee ID
  assignedToName: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed';
  submissionText?: string;
  feedback?: string;
}

export interface WorkspaceAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface WorkspaceMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isWork?: boolean;
  deadline?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'file';
  attachmentUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  managerId: string;
  managerName: string;
  members: string[]; // Member IDs
  tasks: WorkspaceTask[];
  announcements: WorkspaceAnnouncement[];
  messages?: WorkspaceMessage[];
  allowMemberMessages?: boolean;
}

export interface EntrepreneurItem {
  id: string;
  type: 'meeting' | 'bill' | 'interview' | 'task' | 'deadline' | 'goal' | 'other';
  title: string;
  date: string;
  time?: string;
  dueDate: string;
  amount?: number;
  description?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'file';
  attachmentUrl?: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  aiExplanation?: string;
}

export interface GoalHabit {
  id: string;
  title: string;
  category: string;
  frequency: 'daily' | 'weekly';
  targetCount: number;
  currentStreak: number;
  history: { [date: string]: boolean };
}
