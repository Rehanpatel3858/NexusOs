import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Task,
  CalendarEvent,
  RecentActivity,
  AppNotification,
  Classroom,
  Workspace,
  EntrepreneurItem,
  GoalHabit,
  StudentSubmission,
  WorkspaceTask
} from './types';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';

interface AppContextType {
  user: UserProfile | null;
  tasks: Task[];
  events: CalendarEvent[];
  activities: RecentActivity[];
  notifications: AppNotification[];
  theme: 'light' | 'dark';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, username: string, role?: UserProfile['role']) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addTask: (title: string, priority?: 'low' | 'medium' | 'high', category?: string, description?: string, dueDate?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskPriority: (id: string, priority: 'low' | 'medium' | 'high') => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  addActivity: (text: string, category: RecentActivity['category']) => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
  aiResponse: string | null;
  setAiResponse: (res: string | null) => void;
  askAi: (prompt: string) => void;

  // New modules states
  classrooms: Classroom[];
  workspaces: Workspace[];
  entrepreneurItems: EntrepreneurItem[];
  goals: GoalHabit[];

  // Classroom handlers
  createClassroom: (name: string) => void;
  joinClassroom: (code: string) => boolean;
  postAssignment: (classroomId: string, title: string, description: string, dueDate: string, maxMarks: number) => void;
  submitAssignment: (classroomId: string, assignmentId: string, type: StudentSubmission['submissionType'], content: string) => void;
  gradeSubmission: (classroomId: string, assignmentId: string, submissionId: string, marks: number, feedback: string) => void;
  postAnnouncement: (classroomId: string, title: string, content: string, attachmentName?: string, attachmentType?: 'image' | 'file', attachmentUrl?: string, isTask?: boolean, taskPriority?: 'low' | 'medium' | 'high', taskDueDate?: string, type?: 'message' | 'material') => void;
  deleteAnnouncement: (classroomId: string, announcementId: string) => void;
  deleteMaterial: (classroomId: string, materialId: string) => void;
  postMaterial: (classroomId: string, title: string, url: string, type: string) => void;
  toggleAttendance: (classroomId: string, date: string, studentId: string) => void;

  // Workspace handlers
  createWorkspace: (name: string) => void;
  joinWorkspace: (workspaceId: string) => boolean;
  postWorkspaceAnnouncement: (workspaceId: string, title: string, content: string) => void;
  createWorkspaceTask: (workspaceId: string, title: string, description: string, assignedTo: string, dueDate: string) => void;
  submitWorkspaceWork: (workspaceId: string, taskId: string, text: string) => void;
  updateWorkspaceTaskStatus: (workspaceId: string, taskId: string, status: WorkspaceTask['status'], feedback?: string) => void;
  postWorkspaceMessage: (workspaceId: string, content: string, isWork?: boolean, deadline?: string, attachmentName?: string, attachmentType?: 'image' | 'file', attachmentUrl?: string) => void;
  toggleMemberMessages: (workspaceId: string, allowed: boolean) => void;
  leaveWorkspace: (workspaceId: string, newManagerUsername?: string) => void;

  // Entrepreneur handlers
  addEntrepreneurItem: (item: Omit<EntrepreneurItem, 'id' | 'priority' | 'status'>) => void;
  toggleEntrepreneurItem: (id: string) => void;
  aiPrioritizeEntrepreneurs: () => Promise<void>;

  // Goals/Habits handlers
  addGoal: (title: string, category: string, frequency: 'daily' | 'weekly', targetCount: number) => void;
  toggleGoalDate: (goalId: string, date: string) => void;
  sendSmartNotification: (title: string, message: string, type: AppNotification['type']) => void;
  toastPopup: { title: string; message: string; actionHash: string; actionLabel: string } | null;
  setToastPopup: React.Dispatch<React.SetStateAction<{ title: string; message: string; actionHash: string; actionLabel: string } | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock data
const defaultProfile: UserProfile = {
  id: 'user-01',
  name: 'Rehan Patel',
  username: 'rehanpatel',
  email: 'redblue.385@gmail.com',
  phoneNumber: '+1 (555) 385-9012',
  bio: 'Product Designer and Core Administrator crafting modern, intelligence-driven interfaces.',
  role: 'student',
  location: 'San Francisco, CA',
  website: 'https://rehanpatel.design',
  avatarUrl: '', 
  darkMode: false,
  emailNotifications: true,
  desktopNotifications: true,
  aiSuggestions: true,
  weeklyReports: false
};

const defaultTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Finish UI Design for NexusOS Dashboard',
    description: 'Ensure perfect spacing, rounded edges, and layout density matching Apple and Notion spec.',
    completed: true,
    priority: 'high',
    category: 'Design',
    dueDate: '2026-06-23',
    createdAt: '2026-06-22'
  },
  {
    id: 'task-2',
    title: 'Integrate dynamic hourly calendar grid',
    description: 'Create week-view with sticky headers and scrollable containers.',
    completed: false,
    priority: 'high',
    category: 'Engineering',
    dueDate: '2026-06-24',
    createdAt: '2026-06-23'
  }
];

const defaultEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'NexusOS Core Strategy Alignment',
    description: 'Review product vision, launch milestones, and role delegations.',
    date: '2026-06-23',
    startTime: '09:00',
    endTime: '10:30',
    priority: 'high',
    category: 'Meeting',
    reminder: '15 min before',
    recurring: 'none',
    location: 'Design Studio B - Virtual Frame 1',
    color: '#6D4AFF'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = sessionStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nexus_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [toastPopup, setToastPopup] = useState<{ title: string; message: string; actionHash: string; actionLabel: string } | null>(null);

  // New modules states
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [entrepreneurItems, setEntrepreneurItems] = useState<EntrepreneurItem[]>([]);
  const [goals, setGoals] = useState<GoalHabit[]>([]);

  // Load user-specific data whenever user changes
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setEvents([]);
      setActivities([]);
      setNotifications([]);
      setClassrooms([]);
      setWorkspaces([]);
      setEntrepreneurItems([]);
      setGoals([]);
      return;
    }

    const email = user.email.trim().toLowerCase();
    const isDefaultUser = email === 'redblue.385@gmail.com';

    // Tasks
    if ((user as any).tasks) {
      setTasks((user as any).tasks);
    } else {
      const savedTasks = localStorage.getItem(`nexus_${email}_tasks`);
      setTasks(savedTasks ? JSON.parse(savedTasks) : (isDefaultUser ? defaultTasks : []));
    }

    // Events
    if ((user as any).events) {
      setEvents((user as any).events);
    } else {
      const savedEvents = localStorage.getItem(`nexus_${email}_events`);
      setEvents(savedEvents ? JSON.parse(savedEvents) : (isDefaultUser ? defaultEvents : []));
    }

    // Activities
    if ((user as any).activities) {
      setActivities((user as any).activities);
    } else {
      const savedActivities = localStorage.getItem(`nexus_${email}_activities`);
      setActivities(savedActivities ? JSON.parse(savedActivities) : []);
    }

    // Notifications
    if ((user as any).notifications) {
      setNotifications((user as any).notifications);
    } else {
      const savedNotifications = localStorage.getItem(`nexus_${email}_notifications`);
      setNotifications(savedNotifications ? JSON.parse(savedNotifications) : []);
    }



    // Entrepreneur Items
    if ((user as any).entrepreneurItems) {
      setEntrepreneurItems((user as any).entrepreneurItems);
    } else {
      const savedEntrepreneurItems = localStorage.getItem(`nexus_${email}_entrepreneur_items`);
      setEntrepreneurItems(savedEntrepreneurItems ? JSON.parse(savedEntrepreneurItems) : []);
    }

    // Goals
    if ((user as any).goals) {
      setGoals((user as any).goals);
    } else {
      const savedGoals = localStorage.getItem(`nexus_${email}_goals`);
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      } else {
        setGoals(isDefaultUser ? [
          { id: 'g1', title: 'Study 2 hours daily', category: 'Education', frequency: 'daily', targetCount: 2, currentStreak: 3, history: { '2026-06-21': true, '2026-06-22': true, '2026-06-23': true } },
          { id: 'g2', title: 'Complete 5 tasks per week', category: 'Productivity', frequency: 'weekly', targetCount: 5, currentStreak: 1, history: { '2026-06-23': true } }
        ] : []);
      }
    }
  }, [user]);

  // Sync to database/sessionStorage
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('nexus_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('nexus_user');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`nexus_${user.email.trim().toLowerCase()}_tasks`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`nexus_${user.email.trim().toLowerCase()}_events`, JSON.stringify(events));
    }
  }, [events, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`nexus_${user.email.trim().toLowerCase()}_activities`, JSON.stringify(activities));
    }
  }, [activities, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`nexus_${user.email.trim().toLowerCase()}_notifications`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`nexus_${user.email.trim().toLowerCase()}_classrooms`, JSON.stringify(classrooms));
    }
  }, [classrooms, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`nexus_${user.email.trim().toLowerCase()}_workspaces`, JSON.stringify(workspaces));
    }
  }, [workspaces, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`nexus_${user.email.trim().toLowerCase()}_entrepreneur_items`, JSON.stringify(entrepreneurItems));
    }
  }, [entrepreneurItems, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`nexus_${user.email.trim().toLowerCase()}_goals`, JSON.stringify(goals));
    }
  }, [goals, user]);

  // Synchronize classroom-posted tasks directly into the student's task queue
  useEffect(() => {
    if (!user || user.role !== 'student') return;

    let updatedTasks = [...tasks];
    let needsUpdate = false;

    classrooms.forEach((c) => {
      if (c.students.includes(user.username)) {
        c.announcements.forEach((ann) => {
          if (ann.isTask) {
            const syncTaskId = `task-ann-${ann.id}`;
            const alreadyAdded = updatedTasks.some((t) => t.id === syncTaskId);
            if (!alreadyAdded) {
              const newTask = {
                id: syncTaskId,
                title: `CLASS: ${ann.title}`,
                description: `Classroom assignment: ${ann.content}`,
                completed: false,
                priority: ann.taskPriority || 'medium',
                category: 'Study',
                dueDate: ann.taskDueDate || ann.date,
                createdAt: ann.date
              };
              updatedTasks.push(newTask);
              needsUpdate = true;

              setToastPopup({
                title: 'New Class Task Assigned',
                message: `Instructor assigned: "${ann.title}" in ${c.name}.`,
                actionHash: '#/dashboard',
                actionLabel: 'View Task'
              });
            }
          }
        });
      }
    });

    if (needsUpdate) {
      setTasks(updatedTasks);
    }
  }, [classrooms, user, tasks]);

  // Synchronize all user states directly to Cloud Firestore (excluding shared collections)
  useEffect(() => {
    if (!user) return;
    
    const saveToDb = async () => {
      try {
        const userDocRef = doc(db, "users", user.id);
        await setDoc(userDocRef, {
          ...user,
          tasks,
          events,
          activities,
          notifications,
          entrepreneurItems,
          goals
        }, { merge: true });
      } catch (err) {
        console.error("Error saving state to Firestore:", err);
      }
    };

    const timer = setTimeout(saveToDb, 1000);
    return () => clearTimeout(timer);
  }, [user, tasks, events, activities, notifications, entrepreneurItems, goals]);

  // Real-time Classrooms synchronization from shared collection
  useEffect(() => {
    if (!user) return;

    const classroomsQuery = query(collection(db, "classrooms"));

    const unsubscribe = onSnapshot(classroomsQuery, (snapshot) => {
      const allClassrooms: Classroom[] = [];
      snapshot.forEach((doc) => {
        allClassrooms.push(doc.data() as Classroom);
      });

      // Filter classrooms where the user is either the teacher or a joined student
      const myClassrooms = allClassrooms.filter(
        (c) => c.teacherId === user.username || c.students.includes(user.username)
      );
      setClassrooms(myClassrooms);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time Workspaces synchronization from shared collection
  useEffect(() => {
    if (!user) return;

    const workspacesQuery = query(collection(db, "workspaces"));

    const unsubscribe = onSnapshot(workspacesQuery, (snapshot) => {
      const allWorkspaces: Workspace[] = [];
      snapshot.forEach((doc) => {
        allWorkspaces.push(doc.data() as Workspace);
      });

      // Filter workspaces where the user is either the manager or a member
      const myWorkspaces = allWorkspaces.filter(
        (w) => w.managerId === user.username || w.members.includes(user.username)
      );
      setWorkspaces(myWorkspaces);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    if (user) {
      setUser((prev) => prev ? { ...prev, darkMode: !prev.darkMode } : null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;
      
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      let userProfile: UserProfile;
      if (docSnap.exists()) {
        userProfile = docSnap.data() as UserProfile;
      } else {
        const isDefault = email.trim().toLowerCase() === 'redblue.385@gmail.com';
        userProfile = {
          ...defaultProfile,
          id: uid,
          name: email.split('@')[0],
          username: email.split('@')[0],
          email: email.trim().toLowerCase(),
          role: isDefault ? 'student' : 'student'
        };
        await setDoc(docRef, userProfile);
      }
      
      setUser(userProfile);
      addActivity(`Logged in as email node: ${email}`, 'system');
      return true;
    } catch (error: any) {
      console.error("Firebase login error", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, username: string, role: UserProfile['role'] = 'student') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const newUserProfile: UserProfile = {
        ...defaultProfile,
        id: userCredential.user.uid,
        name: name,
        username: username.toLowerCase().replace(/\s+/g, ''),
        email: email.trim().toLowerCase(),
        role: role,
        avatarUrl: '',
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), newUserProfile);
      setUser(newUserProfile);
      addActivity(`Registered workspace account with role "${role}": ${username}`, 'profile');
      return true;
    } catch (error: any) {
      console.error("Firebase registration error", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase logout error", err);
    }
    setUser(null);
    setSearchQuery('');
    setAiResponse(null);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      if (updated.darkMode !== undefined) {
        setTheme(updated.darkMode ? 'dark' : 'light');
      }
      return next;
    });
    addActivity('Updated account details', 'profile');
  };

  const sendSmartNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      title,
      message,
      time: 'Just now',
      read: false,
      type
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addActivity(`Notification: ${title}`, 'system');
  };

  const addTask = (title: string, priority: 'low' | 'medium' | 'high' = 'medium', category = 'Inbox', description = '', dueDate?: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      completed: false,
      priority,
      category,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks((prev) => [newTask, ...prev]);
    addActivity(`Created task "${title}"`, 'task');

    // Calendar sync
    addEvent({
      title: `Task: ${title}`,
      description: description || 'Synchronized workspace deliverable',
      date: newTask.dueDate,
      startTime: '09:00',
      endTime: '10:00',
      priority,
      category: 'Work',
      reminder: '15 min before',
      recurring: 'none',
      location: 'Task Board',
      color: priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981'
    });
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          addActivity(`${nextCompleted ? 'Completed' : 'Reopened'} task: ${t.title}`, 'task');
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target) {
        addActivity(`Deleted task: ${target.title}`, 'task');
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  const updateTaskPriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          addActivity(`Changed priority of task "${t.title}" to ${priority}`, 'task');
          return { ...t, priority };
        }
        return t;
      })
    );
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
    };
    setEvents((prev) => [...prev, newEvent]);
    addActivity(`Scheduled event: ${eventData.title}`, 'calendar');
    sendSmartNotification('Meeting Scheduled', `New meeting scheduled: ${eventData.title} at ${eventData.startTime}`, 'info');
    return newEvent;
  };

  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents((prev) => prev.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev)));
    addActivity(`Modified calendar event: ${updatedEvent.title}`, 'calendar');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => {
      const target = prev.find((ev) => ev.id === id);
      if (target) {
        addActivity(`Canceled event: ${target.title}`, 'calendar');
      }
      return prev.filter((ev) => ev.id !== id);
    });
  };

  const addActivity = (text: string, category: RecentActivity['category']) => {
    const newAct: RecentActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      text,
      timestamp: 'Just now',
      category
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Classroom handlers
  const createClassroom = async (name: string) => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClassroom: Classroom = {
      id: `class-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      name,
      code,
      teacherId: user.username,
      teacherName: user.name,
      students: [],
      assignments: [],
      announcements: [],
      materials: [],
      attendance: {}
    };
    try {
      await setDoc(doc(db, "classrooms", newClassroom.id), newClassroom);
      addActivity(`Created Classroom: ${name} (Code: ${code})`, 'workspace');
    } catch (err) {
      console.error("Error creating classroom:", err);
    }
  };

  const joinClassroom = async (code: string) => {
    if (!user) return false;
    try {
      const q = query(collection(db, "classrooms"), where("code", "==", code.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return false;

      const targetDoc = querySnapshot.docs[0];
      const classroomData = targetDoc.data() as Classroom;
      if (classroomData.students.includes(user.username)) {
        return true; 
      }

      await updateDoc(doc(db, "classrooms", classroomData.id), {
        students: arrayUnion(user.username)
      });
      addActivity(`Joined Classroom: ${classroomData.name}`, 'workspace');
      return true;
    } catch (err) {
      console.error("Error joining classroom:", err);
      return false;
    }
  };

  const postAssignment = async (classroomId: string, title: string, description: string, dueDate: string, maxMarks: number) => {
    try {
      const classRef = doc(db, "classrooms", classroomId);
      const snap = await getDoc(classRef);
      if (!snap.exists()) return;
      const c = snap.data() as Classroom;

      const newAssignment = {
        id: `assign-${Date.now()}`,
        title,
        description,
        dueDate,
        maxMarks,
        submissions: []
      };

      addEvent({
        title: `DBMS/Class: ${title}`,
        description,
        date: dueDate,
        startTime: '09:00',
        endTime: '10:00',
        priority: 'high',
        category: 'Study',
        location: c.name,
        color: '#EF4444'
      });

      sendSmartNotification('New Assignment Posted', `New assignment "${title}" posted in ${c.name}. Due on ${dueDate}`, 'info');

      await updateDoc(classRef, {
        assignments: [...c.assignments, newAssignment]
      });
    } catch (err) {
      console.error(err);
    }
  };

  const submitAssignment = async (classroomId: string, assignmentId: string, type: StudentSubmission['submissionType'], content: string) => {
    if (!user) return;
    try {
      const classRef = doc(db, "classrooms", classroomId);
      const snap = await getDoc(classRef);
      if (!snap.exists()) return;
      const c = snap.data() as Classroom;

      const updatedAssignments = c.assignments.map((a) => {
        if (a.id === assignmentId) {
          const submission: StudentSubmission = {
            id: `sub-${Date.now()}`,
            studentId: user.username,
            studentName: user.name,
            submittedAt: new Date().toISOString().split('T')[0],
            submissionType: type,
            content
          };
          return { ...a, submissions: [...a.submissions.filter(s => s.studentId !== user.username), submission] };
        }
        return a;
      });

      await updateDoc(classRef, { assignments: updatedAssignments });
      addActivity(`Submitted assignment in ${c.name}`, 'task');
    } catch (err) {
      console.error(err);
    }
  };

  const gradeSubmission = async (classroomId: string, assignmentId: string, submissionId: string, marks: number, feedback: string) => {
    try {
      const classRef = doc(db, "classrooms", classroomId);
      const snap = await getDoc(classRef);
      if (!snap.exists()) return;
      const c = snap.data() as Classroom;

      const updatedAssignments = c.assignments.map((a) => {
        if (a.id === assignmentId) {
          const updatedSubmissions = a.submissions.map((s) => {
            if (s.id === submissionId) {
              return { ...s, marks, feedback };
            }
            return s;
          });
          return { ...a, submissions: updatedSubmissions };
        }
        return a;
      });

      await updateDoc(classRef, { assignments: updatedAssignments });
    } catch (err) {
      console.error(err);
    }
  };

  const postAnnouncement = async (
    classroomId: string,
    title: string,
    content: string,
    attachmentName?: string,
    attachmentType?: 'image' | 'file',
    attachmentUrl?: string,
    isTask?: boolean,
    taskPriority?: 'low' | 'medium' | 'high',
    taskDueDate?: string,
    type?: 'message' | 'material'
  ) => {
    try {
      const classRef = doc(db, "classrooms", classroomId);
      const snap = await getDoc(classRef);
      if (!snap.exists()) return;
      const c = snap.data() as Classroom;

      const newAnnounce: any = {
        id: `ann-${Date.now()}`,
        title,
        content,
        date: new Date().toISOString().split('T')[0]
      };
      if (attachmentName !== undefined) newAnnounce.attachmentName = attachmentName;
      if (attachmentType !== undefined) newAnnounce.attachmentType = attachmentType;
      if (attachmentUrl !== undefined) newAnnounce.attachmentUrl = attachmentUrl;
      if (isTask !== undefined) newAnnounce.isTask = isTask;
      if (taskPriority !== undefined) newAnnounce.taskPriority = taskPriority;
      if (taskDueDate !== undefined) newAnnounce.taskDueDate = taskDueDate;
      if (type !== undefined) newAnnounce.type = type;

      await updateDoc(classRef, {
        announcements: [newAnnounce, ...c.announcements]
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAnnouncement = async (classroomId: string, announcementId: string) => {
    try {
      const classRef = doc(db, "classrooms", classroomId);
      const snap = await getDoc(classRef);
      if (!snap.exists()) return;
      const c = snap.data() as Classroom;

      await updateDoc(classRef, {
        announcements: c.announcements.filter((a) => a.id !== announcementId)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMaterial = async (classroomId: string, materialId: string) => {
    try {
      const classRef = doc(db, "classrooms", classroomId);
      const snap = await getDoc(classRef);
      if (!snap.exists()) return;
      const c = snap.data() as Classroom;

      await updateDoc(classRef, {
        materials: c.materials.filter((m) => m.id !== materialId)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const postMaterial = async (classroomId: string, title: string, url: string, type: string) => {
    try {
      const classRef = doc(db, "classrooms", classroomId);
      const snap = await getDoc(classRef);
      if (!snap.exists()) return;
      const c = snap.data() as Classroom;

      const newMaterial = {
        id: `mat-${Date.now()}`,
        title,
        url,
        type,
        date: new Date().toISOString().split('T')[0]
      };

      await updateDoc(classRef, {
        materials: [...c.materials, newMaterial]
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAttendance = async (classroomId: string, date: string, studentId: string) => {
    try {
      const classRef = doc(db, "classrooms", classroomId);
      const snap = await getDoc(classRef);
      if (!snap.exists()) return;
      const c = snap.data() as Classroom;

      const currentAttendance = c.attendance[date] || [];
      const updatedAttendance = currentAttendance.includes(studentId)
        ? currentAttendance.filter((id) => id !== studentId)
        : [...currentAttendance, studentId];

      await updateDoc(classRef, {
        attendance: { ...c.attendance, [date]: updatedAttendance }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Workspace handlers
  const createWorkspace = async (name: string) => {
    if (!user) return;
    const newWorkspace: Workspace = {
      id: `work-${Date.now()}`,
      name,
      managerId: user.username,
      managerName: user.name,
      members: [],
      tasks: [],
      announcements: [],
      messages: [],
      allowMemberMessages: true
    };
    try {
      await setDoc(doc(db, "workspaces", newWorkspace.id), newWorkspace);
      addActivity(`Created Workspace: ${name}`, 'workspace');
    } catch (err) {
      console.error(err);
    }
  };

  const joinWorkspace = async (workspaceId: string) => {
    if (!user) return false;
    try {
      const workRef = doc(db, "workspaces", workspaceId);
      const snap = await getDoc(workRef);
      if (!snap.exists()) return false;
      const w = snap.data() as Workspace;
      if (w.members.includes(user.username)) return true;

      await updateDoc(workRef, {
        members: arrayUnion(user.username)
      });
      addActivity(`Joined Workspace: ${w.name}`, 'workspace');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const postWorkspaceAnnouncement = async (workspaceId: string, title: string, content: string) => {
    try {
      const workRef = doc(db, "workspaces", workspaceId);
      const snap = await getDoc(workRef);
      if (!snap.exists()) return;
      const w = snap.data() as Workspace;

      const newAnnounce = {
        id: `ann-${Date.now()}`,
        title,
        content,
        date: new Date().toISOString().split('T')[0]
      };

      await updateDoc(workRef, {
        announcements: [newAnnounce, ...w.announcements]
      });
    } catch (err) {
      console.error(err);
    }
  };

  const createWorkspaceTask = async (workspaceId: string, title: string, description: string, assignedTo: string, dueDate: string) => {
    try {
      const workRef = doc(db, "workspaces", workspaceId);
      const snap = await getDoc(workRef);
      if (!snap.exists()) return;
      const w = snap.data() as Workspace;

      const newTask: WorkspaceTask = {
        id: `wtask-${Date.now()}`,
        title,
        description,
        assignedTo,
        assignedToName: assignedTo,
        dueDate,
        status: 'pending'
      };

      addEvent({
        title: `Work/Task: ${title}`,
        description,
        date: dueDate,
        startTime: '10:00',
        endTime: '11:00',
        priority: 'medium',
        category: 'Work',
        location: w.name,
        color: '#F59E0B'
      });

      sendSmartNotification('Workspace Task Assigned', `Task "${title}" assigned to ${assignedTo}. Due on ${dueDate}`, 'info');

      await updateDoc(workRef, {
        tasks: [...w.tasks, newTask]
      });
    } catch (err) {
      console.error(err);
    }
  };

  const submitWorkspaceWork = async (workspaceId: string, taskId: string, text: string) => {
    if (!user) return;
    try {
      const workRef = doc(db, "workspaces", workspaceId);
      const snap = await getDoc(workRef);
      if (!snap.exists()) return;
      const w = snap.data() as Workspace;

      const updatedTasks = w.tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, status: 'submitted' as const, submissionText: text };
        }
        return t;
      });

      await updateDoc(workRef, { tasks: updatedTasks });
      addActivity(`Submitted work for workspace task`, 'task');
    } catch (err) {
      console.error(err);
    }
  };

  const updateWorkspaceTaskStatus = async (workspaceId: string, taskId: string, status: WorkspaceTask['status'], feedback?: string) => {
    try {
      const workRef = doc(db, "workspaces", workspaceId);
      const snap = await getDoc(workRef);
      if (!snap.exists()) return;
      const w = snap.data() as Workspace;

      const updatedTasks = w.tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, status, feedback };
        }
        return t;
      });

      await updateDoc(workRef, { tasks: updatedTasks });
    } catch (err) {
      console.error(err);
    }
  };

  const postWorkspaceMessage = async (
    workspaceId: string,
    content: string,
    isWork?: boolean,
    deadline?: string,
    attachmentName?: string,
    attachmentType?: 'image' | 'file',
    attachmentUrl?: string
  ) => {
    if (!user) return;
    try {
      const workRef = doc(db, "workspaces", workspaceId);
      const snap = await getDoc(workRef);
      if (!snap.exists()) return;
      const w = snap.data() as Workspace;

      const newMsg: any = {
        id: `msg-${Date.now()}`,
        senderId: user.username,
        senderName: user.name,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      if (isWork !== undefined) newMsg.isWork = isWork;
      if (deadline !== undefined) newMsg.deadline = deadline;
      if (attachmentName !== undefined) newMsg.attachmentName = attachmentName;
      if (attachmentType !== undefined) newMsg.attachmentType = attachmentType;
      if (attachmentUrl !== undefined) newMsg.attachmentUrl = attachmentUrl;

      const messages = w.messages ? [...w.messages, newMsg] : [newMsg];
      let updatedTasks = w.tasks;

      if (isWork && deadline) {
        const newTask: WorkspaceTask = {
          id: `wtask-${Date.now()}`,
          title: content,
          description: `Task added via group chat by Admin ${user.name}`,
          assignedTo: 'all',
          assignedToName: 'All Members',
          dueDate: deadline,
          status: 'pending'
        };
        updatedTasks = [...w.tasks, newTask];

        addEvent({
          title: `Work/Task: ${content}`,
          description: `Task assigned by ${user.name}`,
          date: deadline,
          startTime: '10:00',
          endTime: '11:00',
          priority: 'high',
          category: 'Work',
          location: w.name,
          color: '#F59E0B'
        });

        sendSmartNotification('Workspace Task Assigned', `Task "${content}" assigned to all members. Due: ${deadline}`, 'info');
      }

      await updateDoc(workRef, { messages, tasks: updatedTasks });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMemberMessages = async (workspaceId: string, allowed: boolean) => {
    try {
      const workRef = doc(db, "workspaces", workspaceId);
      await updateDoc(workRef, {
        allowMemberMessages: allowed
      });
    } catch (err) {
      console.error(err);
    }
  };

  const leaveWorkspace = async (workspaceId: string, newManagerUsername?: string) => {
    if (!user) return;
    try {
      const workRef = doc(db, "workspaces", workspaceId);
      const snap = await getDoc(workRef);
      if (!snap.exists()) return;
      const w = snap.data() as Workspace;

      const isManager = w.managerId === user.username;
      if (isManager && newManagerUsername) {
        await updateDoc(workRef, {
          managerId: newManagerUsername,
          members: w.members.filter(m => m !== newManagerUsername)
        });
      } else {
        await updateDoc(workRef, {
          members: w.members.filter(m => m !== user.username)
        });
      }
      addActivity(`Left workspace: ${w.name}`, 'workspace');
    } catch (err) {
      console.error(err);
    }
  };

  // Entrepreneur handlers
  const addEntrepreneurItem = (itemData: Omit<EntrepreneurItem, 'id' | 'priority' | 'status'>) => {
    const newItem: EntrepreneurItem = {
      ...itemData,
      id: `ent-${Date.now()}`,
      status: 'pending',
      priority: 'medium'
    };

    // Auto add to calendar
    addEvent({
      title: `${itemData.type.toUpperCase()}: ${itemData.title}`,
      description: `Entrepreneur tracking: ${itemData.title}`,
      date: itemData.dueDate,
      startTime: itemData.time || '12:00',
      endTime: itemData.time ? `${parseInt(itemData.time.split(':')[0]) + 1}:00` : '13:00',
      priority: 'medium',
      category: itemData.type === 'meeting' ? 'Meeting' : 'Important',
      reminder: '15 min before',
      recurring: 'none',
      location: 'Business Hub',
      color: itemData.type === 'bill' ? '#EF4444' : '#6D4AFF'
    });

    setEntrepreneurItems((prev) => [...prev, newItem]);
    
    // Auto add to urgent tasks list
    addTask(
      `${itemData.type.toUpperCase()}: ${itemData.title}`,
      'high',
      'Entrepreneur',
      `Entrepreneur Track item: ${itemData.title}. Date: ${itemData.dueDate}`,
      itemData.dueDate
    );

    addActivity(`Added entrepreneur item: ${newItem.title}`, 'task');
  };

  const toggleEntrepreneurItem = (id: string) => {
    setEntrepreneurItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: item.status === 'pending' ? 'completed' : 'pending' } : item))
    );
  };

  const aiPrioritizeEntrepreneurs = async () => {
    const pendingList = entrepreneurItems.filter(e => e.status === 'pending');
    if (pendingList.length === 0) {
      setAiResponse('No pending entrepreneur tracking vectors to analyze.');
      return;
    }

    const prompt = `You are a high-level productivity AI assistant. Analyze these entrepreneur items (meetings, bills, interviews, team tasks, client deadlines, business goals) based on remaining days, amount due, complexity, and importance. Return a valid JSON array of objects, each containing:
    "id": the id of the item,
    "priority": "high" | "medium" | "low",
    "aiExplanation": a concise 1-sentence context-aware explanation for this prioritization.
    
    Format the response as pure JSON without backticks or tags, like:
    [
      {"id": "ent-123", "priority": "high", "aiExplanation": "DBMS deadline is tomorrow and requires 3 hours."}
    ]

    Here is the list to prioritize:
    ${JSON.stringify(pendingList)}`;
    
    try {
      setAiResponse('prioritizing');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      const contentText = data?.choices?.[0]?.message?.content || '';
      
      const jsonStart = contentText.indexOf('[');
      const jsonEnd = contentText.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const prioritized = JSON.parse(contentText.slice(jsonStart, jsonEnd + 1));
        setEntrepreneurItems((prev) =>
          prev.map((item) => {
            const found = prioritized.find((p: any) => p.id === item.id);
            if (found) {
              return { ...item, priority: found.priority, aiExplanation: found.aiExplanation };
            }
            return item;
          })
        );
        setAiResponse('✨ AI prioritisation completed successfully! Indicators updated.');
      } else {
        throw new Error('Invalid JSON structure returned from OpenRouter');
      }
    } catch (error) {
      console.error(error);
      // Fallback local prioritizer
      setEntrepreneurItems((prev) =>
        prev.map((item) => {
          const daysLeft = (new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
          let priority: 'low' | 'medium' | 'high' = 'medium';
          let explanation = 'Prioritized by local proximity heuristic.';
          if (daysLeft <= 2) {
            priority = 'high';
            explanation = '🔴 Urgent: Deadline is in less than 2 days! Complete immediately.';
          } else if (daysLeft <= 4) {
            priority = 'medium';
            explanation = '🟠 Action required: Due within 4 days.';
          } else {
            priority = 'low';
            explanation = '🟢 Low risk: More than 4 days remaining.';
          }
          return { ...item, priority, aiExplanation: explanation };
        })
      );
      setAiResponse('Offline heuristic prioritisation applied.');
    }
  };

  // Goals/Habits handlers
  const addGoal = (title: string, category: string, frequency: 'daily' | 'weekly', targetCount: number) => {
    const newGoal: GoalHabit = {
      id: `goal-${Date.now()}`,
      title,
      category,
      frequency,
      targetCount,
      currentStreak: 0,
      history: {}
    };
    setGoals((prev) => [...prev, newGoal]);
    addActivity(`Added tracker goal: ${title}`, 'task');
  };

  const toggleGoalDate = (goalId: string, date: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const history = { ...g.history };
          history[date] = !history[date];
          
          let streak = 0;
          let checkDate = new Date();
          while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (history[dateStr]) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
          return { ...g, history, currentStreak: streak };
        }
        return g;
      })
    );
  };

  // Natural Language Engine
  const askAi = async (prompt: string) => {
    const cleanPrompt = prompt.toLowerCase().trim();
    if (!cleanPrompt) return;

    setAiResponse('processing');

    // Check voice command keywords (multiple parser)
    if (cleanPrompt.startsWith('add') || cleanPrompt.startsWith('create') || cleanPrompt.startsWith('insert')) {
      if (cleanPrompt.includes('task') || cleanPrompt.includes('wok') || cleanPrompt.includes('work')) {
        const cleaned = prompt.replace(/^(?:add|create|insert|make)\s*(?:\d+)?\s*(?:tasks?|woks?|works?|jobs?)/i, '').trim();
        const items = cleaned.split(/(?:\b\d+\.|\b\d+\s*-\s*|\r?\n)/);
        const parsedTitles: string[] = [];

        items.forEach((item) => {
          const title = item.trim().replace(/^,\s*|\s*,$/g, '').trim();
          if (title.length > 2) {
            parsedTitles.push(title);
          }
        });

        if (parsedTitles.length <= 1 && cleaned.includes(',')) {
          const commaItems = cleaned.split(',');
          parsedTitles.length = 0;
          commaItems.forEach((item) => {
            const title = item.trim();
            if (title.length > 2) {
              parsedTitles.push(title);
            }
          });
        }

        if (parsedTitles.length > 0) {
          const addedList: string[] = [];
          parsedTitles.forEach((title) => {
            const isUrgent = title.toLowerCase().includes('urgent') || title.toLowerCase().includes('high');
            const cleanTitle = title.replace(/(?:urgent|high|priority)/gi, '').trim().replace(/^,\s*|\s*,$/g, '').trim();
            addTask(cleanTitle || title, isUrgent ? 'high' : 'medium', 'AI Workspace');
            addedList.push(`"${cleanTitle || title}" (${isUrgent ? 'High' : 'Medium'})`);
          });
          setAiResponse(`✨ Successfully added ${parsedTitles.length} task(s):\n` + addedList.map((t, idx) => `${idx + 1}. ${t}`).join('\n'));
          return;
        }
      }
    }

    // Complete/finish task command
    if (cleanPrompt.startsWith('complete') || cleanPrompt.startsWith('finish') || cleanPrompt.startsWith('done') || cleanPrompt.includes('mark completed') || cleanPrompt.includes('mark as completed')) {
      const titleQuery = prompt.replace(/^(?:complete|finish|done|mark as completed|mark completed)\s*(?:task|work|wok)?/i, '').trim();
      if (titleQuery) {
        const matched = tasks.find(t => t.title.toLowerCase().includes(titleQuery.toLowerCase()) || titleQuery.toLowerCase().includes(t.title.toLowerCase()));
        if (matched) {
          if (!matched.completed) {
            toggleTask(matched.id);
          }
          setAiResponse(`✅ Task "${matched.title}" marked as completed successfully!`);
          return;
        }
      }
    }

    // Delete/remove task command
    if (cleanPrompt.startsWith('delete') || cleanPrompt.startsWith('remove') || cleanPrompt.startsWith('cancel')) {
      const titleQuery = prompt.replace(/^(?:delete|remove|cancel)\s*(?:task|work|wok)?/i, '').trim();
      if (titleQuery) {
        const matched = tasks.find(t => t.title.toLowerCase().includes(titleQuery.toLowerCase()) || titleQuery.toLowerCase().includes(t.title.toLowerCase()));
        if (matched) {
          deleteTask(matched.id);
          setAiResponse(`🗑️ Task "${matched.title}" has been deleted from your workspace.`);
          return;
        }
      }
    }

    // Shift priority command
    if (cleanPrompt.includes('shift') || cleanPrompt.includes('change') || cleanPrompt.includes('set') || cleanPrompt.includes('priority') || cleanPrompt.includes('move')) {
      const isUrgent = cleanPrompt.includes('urgent') || cleanPrompt.includes('high');
      const isMedium = cleanPrompt.includes('medium') || cleanPrompt.includes('midiun') || cleanPrompt.includes('mid');
      const isLow = cleanPrompt.includes('low');

      if (isUrgent || isMedium || isLow) {
        const targetPriority = isUrgent ? 'high' : isMedium ? 'medium' : 'low';
        const matched = tasks.find(t => cleanPrompt.includes(t.title.toLowerCase()));
        if (matched) {
          updateTaskPriority(matched.id, targetPriority);
          setAiResponse(`⚡ Priority for task "${matched.title}" shifted to ${targetPriority.toUpperCase()}.`);
          return;
        }
      }
    }

    if (cleanPrompt.includes('schedule') || cleanPrompt.includes('meet') || cleanPrompt.includes('event')) {
      const text = prompt.replace(/(schedule|meet|event|at)/gi, '').trim();
      const timeMatch = prompt.match(/\b([0-1]?[0-9]|2[0-3]):[0-5][0-9]\b/);
      const time = timeMatch ? timeMatch[0] : '10:00';
      
      addEvent({
        title: text || 'Synchronized AI Session',
        description: 'Scheduled dynamically via voice/chat assistant.',
        date: new Date().toISOString().split('T')[0],
        startTime: time,
        endTime: `${parseInt(time.split(':')[0]) + 1}:${time.split(':')[1] || '00'}`,
        priority: 'medium',
        category: 'Meeting',
        reminder: '15 min before',
        recurring: 'none',
        location: 'Virtual Sync Room A',
        color: '#6D4AFF'
      });

      setAiResponse(`📅 Calendar adjusted! Booked event: "${text || 'Synchronized AI Session'}" for today at ${time}.`);
      return;
    }

    // Call OpenRouter with key for general questions, summaries, or personalized productivity suggestions
    try {
      const aiPrompt = `You are the NexusOS Core Intelligence companion. Respond concisely to this user request.
      Active user: ${user?.name} (${user?.role}).
      Pending tasks: ${JSON.stringify(tasks.filter(t => !t.completed))}
      Calendar: ${JSON.stringify(events)}
      Goals: ${JSON.stringify(goals)}
      
      User message: "${prompt}"`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: aiPrompt }]
        })
      });
      if (!response.ok) {
        throw new Error(`OpenRouter API response error status: ${response.status}`);
      }
      const data = await response.json();
      setAiResponse(data?.choices?.[0]?.message?.content || 'Intelligence matrix returned an empty response vector.');
    } catch (e) {
      console.error(e);
      const query = cleanPrompt;
      let replyText = '';
      if (query.includes('pending') || query.includes('how many task') || query.includes('work pending') || query.includes('tasks pending')) {
        const count = tasks.filter(t => !t.completed).length;
        replyText = `You have ${count} pending tasks.`;
      } else if (query.includes('time') || query.includes('complete') || query.includes('productivity') || query.includes('manage')) {
        replyText = "I suggest using Pomodoro sprints, time blocking, and prioritizing high-priority tasks.";
      } else if (query.startsWith('hello') || query.startsWith('hi') || query.includes('hey')) {
        replyText = `Hello! How can I help you today?`;
      } else {
        replyText = `Nexus AI: Analyzed "${prompt}". Let's focus on completing your ${tasks.filter(t => !t.completed).length} pending tasks!`;
      }
      setAiResponse(replyText);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        tasks,
        events,
        activities,
        notifications,
        theme,
        searchQuery,
        setSearchQuery,
        toggleTheme,
        login,
        register,
        logout,
        updateProfile,
        addTask,
        toggleTask,
        deleteTask,
        updateTaskPriority,
        addEvent,
        updateEvent,
        deleteEvent,
        addActivity,
        clearNotifications,
        markNotificationRead,
        aiResponse,
        setAiResponse,
        askAi,

        // States
        classrooms,
        workspaces,
        entrepreneurItems,
        goals,

        // Classroom functions
        createClassroom,
        joinClassroom,
        postAssignment,
        submitAssignment,
        gradeSubmission,
        postAnnouncement,
        deleteAnnouncement,
        deleteMaterial,
        postMaterial,
        toggleAttendance,

        // Workspace functions
        createWorkspace,
        joinWorkspace,
        postWorkspaceAnnouncement,
        createWorkspaceTask,
        submitWorkspaceWork,
        updateWorkspaceTaskStatus,
        postWorkspaceMessage,
        toggleMemberMessages,
        leaveWorkspace,

        // Entrepreneur functions
        addEntrepreneurItem,
        toggleEntrepreneurItem,
        aiPrioritizeEntrepreneurs,

        addGoal,
        toggleGoalDate,
        sendSmartNotification,
        toastPopup,
        setToastPopup
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside the AppProvider');
  return context;
};
