import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import {
  BookOpen, Plus, Send, FileUp, Camera, Image, FileText, Check, Award, AlertTriangle, Play,
  PlusCircle, Users, ClipboardList, Briefcase, Calendar, Receipt, UserCheck, Flame, Cpu, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentSubmission, ClassroomAssignment, WorkspaceTask } from '../types';

export const RoleModules: React.FC = () => {
  const {
    user,
    classrooms,
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

    workspaces,
    createWorkspace,
    joinWorkspace,
    postWorkspaceAnnouncement,
    createWorkspaceTask,
    submitWorkspaceWork,
    updateWorkspaceTaskStatus,
    postWorkspaceMessage,
    toggleMemberMessages,
    leaveWorkspace,

    entrepreneurItems,
    addEntrepreneurItem,
    toggleEntrepreneurItem,
    aiPrioritizeEntrepreneurs,
    aiResponse
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [adminActiveRole, setAdminActiveRole] = useState<'student' | 'faculty' | 'professional' | 'entrepreneur'>('student');
  const activeRole = user?.role === 'ADMIN' ? adminActiveRole : user?.role;

  // Local state controls
  const [chatMessage, setChatMessage] = useState('');
  const [chatAttachment, setChatAttachment] = useState<{ name: string; type: 'image' | 'file'; url: string } | null>(null);
  const [isTaskMessage, setIsTaskMessage] = useState(false);
  const [taskMessageDeadline, setTaskMessageDeadline] = useState('');
  const [aiAlertMessage, setAiAlertMessage] = useState<{ title: string; deadline: string; adminName: string } | null>(null);
  const [transferAdminOpen, setTransferAdminOpen] = useState(false);
  const [selectedTransferUser, setSelectedTransferUser] = useState('');

  // Auto-dismiss AI Task Alert popup after 8 seconds
  useEffect(() => {
    if (aiAlertMessage) {
      const timer = setTimeout(() => {
        setAiAlertMessage(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [aiAlertMessage]);

  const [classCode, setClassCode] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  const [newWorkName, setNewWorkName] = useState('');
  const [workIdInput, setWorkIdInput] = useState('');
  const [selectedWorkId, setSelectedWorkId] = useState('');

  // Form controls
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDue, setAssignDue] = useState('');
  const [assignMarks, setAssignMarks] = useState(100);

  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [facultyAttachment, setFacultyAttachment] = useState<{ name: string; type: 'image' | 'file'; url: string } | null>(null);
  const [msgType, setMsgType] = useState<'message' | 'material'>('message');
  const [isClassTask, setIsClassTask] = useState(false);
  const [classTaskPriority, setClassTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [classTaskDueDate, setClassTaskDueDate] = useState('');

  const [matTitle, setMatTitle] = useState('');
  const [matUrl, setMatUrl] = useState('');
  const [matType, setMatType] = useState('PDF');

  const [workTaskTitle, setWorkTaskTitle] = useState('');
  const [workTaskDesc, setWorkTaskDesc] = useState('');
  const [workTaskAssignee, setWorkTaskAssignee] = useState('');
  const [workTaskDue, setWorkTaskDue] = useState('');

  const [workAnnTitle, setWorkAnnTitle] = useState('');
  const [workAnnContent, setWorkAnnContent] = useState('');

  // Submission controls
  const [subType, setSubType] = useState<'text' | 'file' | 'camera' | 'image'>('text');
  const [subTextContent, setSubTextContent] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraCaptured, setCameraCaptured] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Entrepreneur form
  const [entType, setEntType] = useState<'meeting' | 'bill' | 'interview' | 'task' | 'deadline' | 'goal' | 'other'>('task');
  const [entTitle, setEntTitle] = useState('');
  const [entDue, setEntDue] = useState('');
  const [entTime, setEntTime] = useState('12:00');
  const [entAmount, setEntAmount] = useState('');
  const [entDescription, setEntDescription] = useState('');
  const [entAttachment, setEntAttachment] = useState<{ name: string; type: 'image' | 'file'; url: string } | null>(null);

  // Grading states
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  // ----------------------------------------------------
  // SUBMISSION SIMULATORS
  // ----------------------------------------------------
  const handleStartCamera = async () => {
    setCameraActive(true);
    setCameraCaptured(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera hardware not available, rendering high-fidelity camera mock.");
    }
  };

  const handleCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        const dataUrl = canvas.toDataURL('image/png');
        setCameraCaptured(dataUrl);
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
    } else {
      // Mock photo
      setCameraCaptured("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'><rect width='100%' height='100%' fill='%236D4AFF'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='sans-serif' font-size='16'>Captured Note Snap.png</text></svg>");
      setCameraActive(false);
    }
  };

  // Calculate days left for smart deadline visualization
  const getDeadlineStyle = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDateStr);
    due.setHours(0,0,0,0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 2) {
      return {
        color: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-950/20 border-red-500',
        badge: 'bg-red-500 text-white animate-pulse',
        indicator: '🔴 Blink: Immediate Priority!',
        blinking: true
      };
    } else if (diffDays <= 3) {
      return {
        color: 'text-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-500',
        badge: 'bg-orange-500 text-white',
        indicator: '🟠 Warning: Due soon',
        blinking: false
      };
    } else {
      return {
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500',
        badge: 'bg-emerald-500 text-white',
        indicator: '🟢 On Track',
        blinking: false
      };
    }
  };

  const handleSendChatMessage = (currentWork: any) => {
    if (!chatMessage.trim() && !chatAttachment) return;

    const attachmentName = chatAttachment?.name;
    const attachmentType = chatAttachment?.type;
    const attachmentUrl = chatAttachment?.url;

    if (isTaskMessage && currentWork.managerId === user.username) {
      if (!taskMessageDeadline) {
        alert("Please specify a deadline for this task work message.");
        return;
      }
      postWorkspaceMessage(currentWork.id, chatMessage.trim() || `Task Attachment: ${attachmentName}`, true, taskMessageDeadline, attachmentName, attachmentType, attachmentUrl);
      
      setAiAlertMessage({
        title: chatMessage.trim() || `Task Attachment: ${attachmentName}`,
        deadline: taskMessageDeadline,
        adminName: user.name
      });

      setIsTaskMessage(false);
      setTaskMessageDeadline('');
    } else {
      postWorkspaceMessage(currentWork.id, chatMessage.trim(), false, undefined, attachmentName, attachmentType, attachmentUrl);
    }
    setChatMessage('');
    setChatAttachment(null);
  };

  if (!user) return null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-left shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6 mb-6">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">
            CORE OPERATION MODULES {user.role === 'ADMIN' && '(ADMIN/TESTER)'}
          </span>
          <h2 className="text-xl md:text-2xl font-display font-bold text-slate-900 dark:text-white capitalize">
            {activeRole} Matrix Dashboard
          </h2>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-150 dark:border-slate-850">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/40 dark:border-slate-800'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'management'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/40 dark:border-slate-800'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
            }`}
          >
            Module Workspace
          </button>
        </div>
      </div>

      {user.role === 'ADMIN' && (
        <div className="flex flex-wrap gap-2 items-center mb-6 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-850">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider px-2">Tester Module Simulation View:</span>
          {(['student', 'faculty', 'professional', 'entrepreneur'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setAdminActiveRole(r)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition active:scale-95 ${
                adminActiveRole === r
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-650'
                  : 'bg-white dark:bg-slate-900 text-slate-550 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* ----------------------------------------------------
                STUDENT OVERVIEW
            ---------------------------------------------------- */}
            {activeRole === 'student' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Classroom Joined Grid */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5">
                    <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" /> Active Classrooms Joined
                    </h3>
                    {classrooms.filter(c => c.students.includes(user.username)).length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400">
                        You have not joined any classroom nodes yet. Enter an invitation code below.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {classrooms.filter(c => c.students.includes(user.username)).map((classroom) => (
                          <div
                            key={classroom.id}
                            onClick={() => setSelectedClassId(classroom.id)}
                            className={`p-4 rounded-xl border transition cursor-pointer hover:border-indigo-500/40 hover:bg-slate-100/30 dark:hover:bg-slate-850/10 ${
                              selectedClassId === classroom.id
                                ? 'bg-indigo-50/25 dark:bg-indigo-950/10 border-indigo-500/50'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 font-bold block mb-1">
                              CODE: {classroom.code}
                            </span>
                            <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 block truncate">
                              {classroom.name}
                            </span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-2">
                              Instructor: {classroom.teacherName}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Join Classroom input */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        placeholder="Enter Classroom Invitation Code (e.g. AB12CD)"
                        className="flex-1 px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                      />
                      <button
                        onClick={() => {
                          const res = joinClassroom(classCode);
                          if (res) {
                            setClassCode('');
                          } else {
                            alert("Invalid Classroom Code or Already Joined.");
                          }
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Join Classroom
                      </button>
                    </div>
                  </div>

                  {/* Selected Classroom View for Students */}
                  {selectedClassId && (
                    (() => {
                      const currentClass = classrooms.find(c => c.id === selectedClassId);
                      if (!currentClass) return null;
                      return (
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                              {currentClass.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 font-mono text-[9px] text-slate-450 uppercase">
                              Classroom Node
                            </span>
                          </div>

                          {/* Announcements */}
                          <div>
                            <h5 className="font-display font-semibold text-xs text-slate-500 dark:text-slate-400 mb-3">
                              Announcements
                            </h5>
                            {currentClass.announcements.length === 0 ? (
                              <p className="text-[11px] text-slate-400">No announcements posted.</p>
                            ) : (
                              <div className="space-y-2">
                                {currentClass.announcements.map((ann) => (
                                  <div key={ann.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl text-left">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-display font-bold text-xs text-slate-800 dark:text-white">{ann.title}</span>
                                      <span className="text-[9px] font-mono text-slate-400">{ann.date}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{ann.content}</p>
                                    {ann.attachmentName && ann.attachmentType === 'image' && (
                                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-36">
                                        <img src={ann.attachmentUrl} alt={ann.attachmentName} className="object-cover w-full h-full max-h-36" />
                                      </div>
                                    )}
                                    {ann.attachmentName && ann.attachmentType === 'file' && (
                                      <div className="mt-2 flex items-center gap-1.5 p-2 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-[10px] font-mono">
                                        <span>📎</span>
                                        <span className="truncate flex-1 text-slate-600 dark:text-slate-400">{ann.attachmentName}</span>
                                        <a href={ann.attachmentUrl} download={ann.attachmentName} className="text-indigo-500 hover:underline">Download</a>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Study Materials */}
                          <div>
                            <h5 className="font-display font-semibold text-xs text-slate-500 dark:text-slate-400 mb-3">
                              Study Materials
                            </h5>
                            {currentClass.materials.length === 0 ? (
                              <p className="text-[11px] text-slate-400">No study materials uploaded yet.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {currentClass.materials.map((mat) => (
                                  <a
                                    key={mat.id}
                                    href={mat.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl flex items-center justify-between hover:border-indigo-500/30 transition group"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <FileUp className="w-4 h-4 text-indigo-500" />
                                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate group-hover:text-indigo-500 transition">
                                        {mat.title}
                                      </span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-950 font-mono text-[8px] text-slate-400 uppercase font-bold">
                                      {mat.type}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Right Column: Student Assignments & Attendance */}
                <div className="space-y-6">
                  {selectedClassId ? (
                    (() => {
                      const currentClass = classrooms.find(c => c.id === selectedClassId);
                      if (!currentClass) return null;
                      return (
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-4">
                          <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-250 uppercase tracking-wider">
                            Assignments Queue
                          </h4>
                          {currentClass.assignments.length === 0 ? (
                            <p className="text-[11px] text-slate-400 py-3 text-center">No assignments assigned.</p>
                          ) : (
                            <div className="space-y-3">
                              {currentClass.assignments.map((as) => {
                                const dlStyle = getDeadlineStyle(as.dueDate);
                                const mySub = as.submissions.find(s => s.studentId === user.username);
                                return (
                                  <div key={as.id} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-col gap-2">
                                    <div className="flex justify-between items-start gap-2">
                                      <span className="font-display font-bold text-xs text-slate-800 dark:text-white">{as.title}</span>
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${dlStyle.badge}`}>
                                        {dlStyle.indicator}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-450 dark:text-slate-500 line-clamp-2">{as.description}</p>
                                    
                                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-2 mt-1">
                                      <span>Due: {as.dueDate}</span>
                                      {mySub ? (
                                        <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                                          <Check className="w-3 h-3" /> Submitted {mySub.marks !== undefined && `(${mySub.marks}/${as.maxMarks} pts)`}
                                        </span>
                                      ) : (
                                        <span className="text-red-500 font-bold">Unsubmitted</span>
                                      )}
                                    </div>

                                    {/* Submit tool if unsubmitted */}
                                    {!mySub && (
                                      <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/40">
                                        <button
                                          onClick={() => {
                                            // Open active sub modal or pane
                                            alert(`Please navigate to "Module Workspace" tab to submit assignment "${as.title}"`);
                                            setActiveTab('management');
                                          }}
                                          className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg transition"
                                        >
                                          Go to Submission Workspace
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 text-center text-xs text-slate-405">
                      Select an active classroom to view assignment reports.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                FACULTY OVERVIEW
            ---------------------------------------------------- */}
            {activeRole === 'faculty' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Classroom Creators */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5">
                    <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" /> Created Classrooms
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {classrooms.filter(c => c.teacherId === user.username).map((classroom) => (
                        <div
                          key={classroom.id}
                          onClick={() => setSelectedClassId(classroom.id)}
                          className={`p-4 rounded-xl border transition cursor-pointer hover:border-indigo-500/40 hover:bg-slate-100/30 dark:hover:bg-slate-850/10 ${
                            selectedClassId === classroom.id
                              ? 'bg-indigo-50/25 dark:bg-indigo-950/10 border-indigo-500/50'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 font-bold block mb-1">
                            CODE: {classroom.code}
                          </span>
                          <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 block truncate">
                            {classroom.name}
                          </span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-2">
                            Students Enrolled: {classroom.students.length}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Create classroom */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="New Classroom Name (e.g. DBMS Class B)"
                        className="flex-1 px-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                      />
                      <button
                        onClick={() => {
                          if (newClassName.trim()) {
                            createClassroom(newClassName);
                            setNewClassName('');
                          }
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create
                      </button>
                    </div>
                  </div>

                  {/* Selected classroom analytics / attendance controls */}
                  {selectedClassId && (
                    (() => {
                      const currentClass = classrooms.find(c => c.id === selectedClassId);
                      if (!currentClass) return null;
                      const todayStr = new Date().toISOString().split('T')[0];
                      const presentStudents = currentClass.attendance[todayStr] || [];

                      return (
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-6">
                          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white flex justify-between">
                            <span>Manage Enrolled Students: {currentClass.name}</span>
                            <span className="text-xs font-mono font-normal text-slate-450">Active Code: {currentClass.code}</span>
                          </h4>

                          {/* Quick Message/Announcement Box */}
                           <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl space-y-3">
                             <h5 className="font-display font-semibold text-xs text-indigo-650 dark:text-indigo-400 uppercase tracking-wide text-left">
                               📢 Send Message / Announcement to Class
                             </h5>
                             <div className="space-y-2 text-left">
                               <div className="flex gap-4 items-center mb-1 text-xs">
                                 <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                                   <input
                                     type="radio"
                                     name="msgType"
                                     checked={msgType === 'message'}
                                     onChange={() => setMsgType('message')}
                                     className="text-indigo-600 focus:ring-indigo-500"
                                   />
                                   Class Message
                                 </label>
                                 <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-330">
                                   <input
                                     type="radio"
                                     name="msgType"
                                     checked={msgType === 'material'}
                                     onChange={() => setMsgType('material')}
                                     className="text-indigo-600 focus:ring-indigo-500"
                                   />
                                   Study Material
                                 </label>
                               </div>

                               <input
                                 type="text"
                                 value={announceTitle}
                                 onChange={(e) => setAnnounceTitle(e.target.value)}
                                 placeholder={msgType === 'material' ? "Study Material Title (e.g. Lecture 4 Slides)" : "Message/Announcement Title"}
                                 className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-white font-medium"
                               />
                               <textarea
                                 value={announceContent}
                                 onChange={(e) => setAnnounceContent(e.target.value)}
                                 placeholder={msgType === 'material' ? "Add details or descriptions of the study material..." : "Type your class message or updates here..."}
                                 className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-white"
                                 rows={2}
                               />

                               {/* Task Checkbox & Subfields */}
                               <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-850 space-y-3">
                                 <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-slate-750 dark:text-slate-350">
                                   <input
                                     type="checkbox"
                                     checked={isClassTask}
                                     onChange={(e) => setIsClassTask(e.target.checked)}
                                     className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                   />
                                   Post as Student Deliverable Task
                                 </label>

                                 {isClassTask && (
                                   <div className="grid grid-cols-2 gap-3 pt-1">
                                     <div>
                                       <label className="block text-[9px] text-slate-405 uppercase mb-1">Priority</label>
                                       <select
                                         value={classTaskPriority}
                                         onChange={(e) => setClassTaskPriority(e.target.value as any)}
                                         className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl outline-none"
                                       >
                                         <option value="low">Low Priority</option>
                                         <option value="medium">Medium Priority</option>
                                         <option value="high">Urgent / High</option>
                                       </select>
                                     </div>
                                     <div>
                                       <label className="block text-[9px] text-slate-405 uppercase mb-1">Due Date</label>
                                       <input
                                         type="date"
                                         value={classTaskDueDate}
                                         onChange={(e) => setClassTaskDueDate(e.target.value)}
                                         className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-white"
                                       />
                                     </div>
                                   </div>
                                 )}
                               </div>
                             </div>

                             <div className="flex items-center justify-between">
                               <label className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-[10px] font-semibold text-slate-550 transition">
                                 📎 {facultyAttachment ? 'Change File' : 'Attach Photo/File'}
                                 <input
                                   type="file"
                                   className="hidden"
                                   onChange={(e) => {
                                     const file = e.target.files?.[0];
                                     if (file) {
                                       const fakeUrl = URL.createObjectURL(file);
                                       setFacultyAttachment({
                                         name: file.name,
                                         type: file.type.startsWith('image/') ? 'image' : 'file',
                                         url: fakeUrl
                                       });
                                     }
                                   }}
                                 />
                               </label>
                               <div className="flex items-center gap-2">
                                 {facultyAttachment && (
                                   <span className="text-[10px] text-indigo-500 font-medium truncate max-w-[120px]">
                                     {facultyAttachment.name}
                                   </span>
                                 )}
                                 <button
                                   onClick={() => {
                                     if (announceTitle && announceContent) {
                                       postAnnouncement(
                                         currentClass.id,
                                         announceTitle,
                                         announceContent,
                                         facultyAttachment?.name,
                                         facultyAttachment?.type,
                                         facultyAttachment?.url,
                                         isClassTask,
                                         classTaskPriority,
                                         classTaskDueDate || undefined,
                                         msgType
                                       );
                                       setAnnounceTitle('');
                                       setAnnounceContent('');
                                       setFacultyAttachment(null);
                                       setIsClassTask(false);
                                       setClassTaskDueDate('');
                                       alert('Classroom deliverable message posted successfully!');
                                     }
                                   }}
                                   className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                                 >
                                   Send Message
                                 </button>
                               </div>
                             </div>
                           </div>

                          {/* Attendance Grid */}
                          <div>
                            <h5 className="font-display font-semibold text-xs text-slate-550 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                              <UserCheck className="w-4 h-4 text-indigo-500" /> Attendance Board (Today: {todayStr})
                            </h5>
                            {currentClass.students.length === 0 ? (
                              <p className="text-[11px] text-slate-400">No students joined yet. Share classroom code.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {currentClass.students.map((studentId) => {
                                  const isPresent = presentStudents.includes(studentId);
                                  return (
                                    <button
                                      key={studentId}
                                      onClick={() => toggleAttendance(currentClass.id, todayStr, studentId)}
                                      className={`p-3 rounded-xl border text-xs font-medium transition text-left flex items-center justify-between cursor-pointer ${
                                        isPresent
                                          ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
                                      }`}
                                    >
                                      <span>{studentId}</span>
                                      <span className={`w-2.5 h-2.5 rounded-full ${isPresent ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                           {/* Announcements List with Deletion */}
                           <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4">
                             <h5 className="font-display font-semibold text-xs text-slate-550 dark:text-slate-400 mb-3 flex items-center justify-between">
                               <span>Class Announcements</span>
                             </h5>
                             {currentClass.announcements.length === 0 ? (
                               <p className="text-[11px] text-slate-405">No announcements posted.</p>
                             ) : (
                               <div className="space-y-2">
                                 {currentClass.announcements.map((ann) => (
                                   <div key={ann.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-xl flex justify-between items-start gap-4">
                                     <div className="flex-1 text-left">
                                       <div className="flex justify-between items-center mb-1">
                                         <span className="font-display font-bold text-xs text-slate-800 dark:text-white">{ann.title}</span>
                                         <span className="text-[9px] font-mono text-slate-400">{ann.date}</span>
                                       </div>
                                       <p className="text-[11px] text-slate-550 dark:text-slate-450">{ann.content}</p>
                                       {ann.attachmentName && ann.attachmentType === 'image' && (
                                         <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-850 max-h-24 max-w-[200px]">
                                           <img src={ann.attachmentUrl} alt={ann.attachmentName} className="object-cover w-full h-full" />
                                         </div>
                                       )}
                                       {ann.attachmentName && ann.attachmentType === 'file' && (
                                         <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                           <span>📎 {ann.attachmentName}</span>
                                         </div>
                                       )}
                                     </div>
                                     <button
                                       onClick={() => {
                                         if (confirm("Are you sure you want to delete this announcement?")) {
                                           deleteAnnouncement(currentClass.id, ann.id);
                                         }
                                       }}
                                       className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase shrink-0 transition cursor-pointer"
                                     >
                                       Delete
                                     </button>
                                   </div>
                                 ))}
                                </div>
                             )}
                           </div>

                           {/* Study Materials List with Deletion */}
                           <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4">
                             <h5 className="font-display font-semibold text-xs text-slate-550 dark:text-slate-400 mb-3">
                               Uploaded Study Materials
                             </h5>
                             {currentClass.materials.length === 0 ? (
                               <p className="text-[11px] text-slate-405">No study materials uploaded.</p>
                             ) : (
                               <div className="space-y-2">
                                 {currentClass.materials.map((mat) => (
                                   <div key={mat.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl flex justify-between items-center gap-4">
                                     <div className="flex items-center gap-2 truncate">
                                       <span className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-950 font-mono text-[8px] text-slate-400 uppercase font-bold shrink-0">{mat.type}</span>
                                       <span className="text-xs text-slate-700 dark:text-slate-350 truncate">{mat.title}</span>
                                     </div>
                                     <button
                                       onClick={() => {
                                         if (confirm("Are you sure you want to delete this study material?")) {
                                           deleteMaterial(currentClass.id, mat.id);
                                         }
                                       }}
                                       className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase shrink-0 transition cursor-pointer"
                                     >
                                       Delete
                                     </button>
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>
                         </div>
                      );
                    })()
                  )}
                </div>

                {/* Right column: Faculty sub reviews */}
                <div className="space-y-6">
                  {selectedClassId ? (
                    (() => {
                      const currentClass = classrooms.find(c => c.id === selectedClassId);
                      if (!currentClass) return null;
                      return (
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-4">
                          <h4 className="font-display font-bold text-xs text-slate-805 dark:text-slate-200 uppercase tracking-wider">
                            Student Submissions Hub
                          </h4>
                          {currentClass.assignments.length === 0 ? (
                            <p className="text-[11px] text-slate-405 py-2 text-center">No assignments posted yet.</p>
                          ) : (
                            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                              {currentClass.assignments.map((as) => (
                                <div key={as.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-display font-bold text-xs text-slate-800 dark:text-white truncate">{as.title}</span>
                                    <span className="text-[8px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-500 px-1.5 py-0.5 rounded">
                                      {as.submissions.length} Subs
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {as.submissions.map((sub) => (
                                      <div
                                        key={sub.id}
                                        onClick={() => {
                                          // Navigate or alert to review submission
                                          alert(`Reviewing submission by ${sub.studentName}. Action available in "Module Workspace" tab.`);
                                          setActiveTab('management');
                                        }}
                                        className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg flex items-center justify-between text-[10px] hover:bg-indigo-50/20 cursor-pointer transition border border-transparent hover:border-indigo-500/10"
                                      >
                                        <span className="font-medium text-slate-650 dark:text-slate-350">{sub.studentName}</span>
                                        <span className={sub.marks !== undefined ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold animate-pulse'}>
                                          {sub.marks !== undefined ? `${sub.marks}/${as.maxMarks}` : 'Ungraded'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 text-center text-xs text-slate-405">
                      Select a classroom to review submissions.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                WORKING PROFESSIONAL OVERVIEW
            ---------------------------------------------------- */}
            {activeRole === 'professional' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Workspace Hub */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5">
                    <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-500" /> Professional Workspaces
                    </h3>

                    {/* Workspace items list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {workspaces.filter(w => w.managerId === user.username || w.members.includes(user.username)).map((workspace) => {
                        const isManager = workspace.managerId === user.username;
                        return (
                          <div
                            key={workspace.id}
                            onClick={() => setSelectedWorkId(workspace.id)}
                            className={`p-4 rounded-xl border transition cursor-pointer hover:border-indigo-500/40 hover:bg-slate-100/30 dark:hover:bg-slate-850/10 ${
                              selectedWorkId === workspace.id
                                ? 'bg-indigo-50/25 dark:bg-indigo-950/10 border-indigo-500/50'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 font-bold block mb-1">
                              {isManager ? '👑 Admin/Manager' : '👥 Joined Member'}
                            </span>
                            <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 block truncate">
                              {workspace.name}
                            </span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-2">
                              Members: {workspace.members.length + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Create / Join Workspace */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                      {/* Create */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          Create New Workspace
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newWorkName}
                            onChange={(e) => setNewWorkName(e.target.value)}
                            placeholder="Workspace Name (e.g. Design Team)"
                            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              if (newWorkName.trim()) {
                                createWorkspace(newWorkName);
                                setNewWorkName('');
                              }
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold rounded-xl transition"
                          >
                            Create
                          </button>
                        </div>
                      </div>

                      {/* Join */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          Join Workspace ID
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={workIdInput}
                            onChange={(e) => setWorkIdInput(e.target.value)}
                            placeholder="Enter Workspace ID"
                            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              const joined = joinWorkspace(workIdInput);
                              if (joined) {
                                setWorkIdInput('');
                              } else {
                                alert("Workspace ID not found or already joined.");
                              }
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold rounded-xl transition"
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Workspace View */}
                  {selectedWorkId && (
                    (() => {
                      const currentWork = workspaces.find(w => w.id === selectedWorkId);
                      if (!currentWork) return null;
                      const isManager = currentWork.managerId === user.username;
                      return (
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-5 relative">
                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                                {currentWork.name}
                              </h4>
                              <span className="text-[10px] font-mono text-slate-450 dark:text-slate-500">ID: {currentWork.id}</span>
                            </div>
                            <button
                              onClick={() => {
                                if (isManager) {
                                  if (currentWork.members.length === 0) {
                                    if (confirm("You are the only member in this workspace. Leaving will delete it. Proceed?")) {
                                      leaveWorkspace(currentWork.id);
                                      setSelectedWorkId('');
                                    }
                                  } else {
                                    setTransferAdminOpen(true);
                                  }
                                } else {
                                  if (confirm("Are you sure you want to leave this workspace?")) {
                                    leaveWorkspace(currentWork.id);
                                    setSelectedWorkId('');
                                  }
                                }
                              }}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-[10px] font-bold rounded-lg transition"
                            >
                              Leave Workspace
                            </button>
                          </div>

                          {/* Admin Transfer Section */}
                          {transferAdminOpen && isManager && (
                            <div className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-200/50 rounded-xl space-y-2 text-xs text-left">
                              <p className="font-bold text-red-600 dark:text-red-400">Transfer Admin Rights before leaving:</p>
                              <select
                                value={selectedTransferUser}
                                onChange={(e) => setSelectedTransferUser(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs"
                              >
                                <option value="">-- Choose New Admin --</option>
                                {currentWork.members.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (selectedTransferUser) {
                                      leaveWorkspace(currentWork.id, selectedTransferUser);
                                      setTransferAdminOpen(false);
                                      setSelectedWorkId('');
                                      alert(`Successfully transferred admin role to ${selectedTransferUser} and left.`);
                                    } else {
                                      alert("Please select a member to transfer ownership.");
                                    }
                                  }}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-550 text-white rounded text-[10px] font-bold"
                                >
                                  Transfer & Leave
                                </button>
                                <button
                                  onClick={() => setTransferAdminOpen(false)}
                                  className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded text-[10px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Announcements */}
                          <div className="space-y-2">
                            <h5 className="font-display font-bold text-xs text-slate-500">Announcements</h5>
                            {currentWork.announcements.length === 0 ? (
                              <p className="text-[11px] text-slate-400">No announcements posted.</p>
                            ) : (
                              <div className="space-y-2">
                                {currentWork.announcements.map((ann) => (
                                  <div key={ann.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-display font-bold text-xs text-slate-850 dark:text-slate-100">{ann.title}</span>
                                      <span className="text-[9px] font-mono text-slate-400">{ann.date}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{ann.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Messages / Group Chat */}
                          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex justify-between items-center">
                              <h5 className="font-display font-bold text-xs text-slate-500 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-indigo-500" /> Group Discussion Chat
                              </h5>
                              {/* Admin toggle */}
                              {isManager && (
                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400 font-medium">
                                  <input
                                    type="checkbox"
                                    checked={currentWork.allowMemberMessages !== false}
                                    onChange={(e) => toggleMemberMessages(currentWork.id, e.target.checked)}
                                    className="rounded text-indigo-650"
                                  />
                                  <span>Allow member messages</span>
                                </label>
                              )}
                            </div>

                            {/* Scrollable message box */}
                            <div className="space-y-2 max-h-[180px] overflow-y-auto bg-slate-100/50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-200/60 dark:border-slate-850 flex flex-col gap-2">
                              {(!currentWork.messages || currentWork.messages.length === 0) ? (
                                <p className="text-[10px] text-slate-400 text-center py-4">No chat messages yet. Start discussion!</p>
                              ) : (
                                currentWork.messages.map((msg) => {
                                  const isMe = msg.senderId === user.username;
                                  return (
                                    <div key={msg.id} className={`flex flex-col text-left ${isMe ? 'items-end' : 'items-start'}`}>
                                      <div className={`max-w-[85%] rounded-2xl p-2.5 text-xs shadow-sm ${
                                        msg.isWork
                                          ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-300/40 text-slate-800 dark:text-slate-200'
                                          : isMe
                                          ? 'bg-indigo-600 text-white rounded-tr-none'
                                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-800'
                                      }`}>
                                        <div className="flex items-center justify-between gap-4 mb-1">
                                          <span className="font-bold text-[9px] text-slate-450 dark:text-slate-450">
                                            {msg.senderName} {msg.senderId === currentWork.managerId && '👑'}
                                          </span>
                                          <span className="text-[8px] text-slate-400">{msg.timestamp}</span>
                                        </div>
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        {msg.attachmentName && msg.attachmentType === 'image' && (
                                          <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-36">
                                            <img src={msg.attachmentUrl} alt={msg.attachmentName} className="object-cover w-full h-full max-h-36" />
                                          </div>
                                        )}
                                        {msg.attachmentName && msg.attachmentType === 'file' && (
                                          <div className="mt-2 flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-800 text-[10px] font-mono">
                                            <span>📎</span>
                                            <span className="truncate flex-1 text-slate-700 dark:text-slate-300 font-bold">{msg.attachmentName}</span>
                                            <a href={msg.attachmentUrl} download={msg.attachmentName} className="text-indigo-500 hover:underline">Download</a>
                                          </div>
                                        )}
                                        {msg.isWork && (
                                          <div className="mt-1.5 pt-1 border-t border-amber-300/20 text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                            <span>⚠️ WORK TASK</span>
                                            <span>• Deadline: {msg.deadline}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Message input */}
                            {(() => {
                              const canMsg = isManager || currentWork.allowMemberMessages !== false;
                              if (!canMsg) {
                                return (
                                  <p className="text-[10px] text-red-500 font-semibold bg-red-50/50 dark:bg-red-950/10 p-2.5 rounded-xl border border-red-100/50 text-center">
                                    🚫 Admin has disabled messaging for members in this workspace.
                                  </p>
                                );
                              }

                              return (
                                <div className="space-y-2">
                                  {/* Manager work task fields */}
                                  {isManager && (
                                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-855 rounded-xl space-y-2 text-[10px] text-left">
                                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-600 dark:text-slate-400">
                                        <input
                                          type="checkbox"
                                          checked={isTaskMessage}
                                          onChange={(e) => setIsTaskMessage(e.target.checked)}
                                          className="rounded text-indigo-650"
                                        />
                                        <span>Is this message a task/work assignment?</span>
                                      </label>
                                      {isTaskMessage && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-400 font-medium">Task Deadline:</span>
                                          <input
                                            type="date"
                                            value={taskMessageDeadline}
                                            onChange={(e) => setTaskMessageDeadline(e.target.value)}
                                            className="px-2 py-1 bg-white dark:bg-slate-900 border rounded-lg text-xs"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Attachment preview for admin */}
                                  {chatAttachment && (
                                    <div className="flex items-center justify-between p-2 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-200/30 rounded-xl text-xs text-left">
                                      <span className="font-mono text-[10px] truncate text-indigo-650 dark:text-indigo-400">
                                        📎 Attached {chatAttachment.type === 'image' ? 'photo' : 'file'}: {chatAttachment.name}
                                      </span>
                                      <button onClick={() => setChatAttachment(null)} className="text-red-500 hover:text-red-700 font-bold ml-2">Remove</button>
                                    </div>
                                  )}

                                  <div className="flex gap-2">
                                    {isManager && (
                                      <>
                                        <input
                                          type="file"
                                          id="workspace-chat-file"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const isImage = file.type.startsWith('image/');
                                              setChatAttachment({
                                                name: file.name,
                                                type: isImage ? 'image' : 'file',
                                                url: URL.createObjectURL(file)
                                              });
                                            }
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => document.getElementById('workspace-chat-file')?.click()}
                                          className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center"
                                          title="Attach File/Photo"
                                        >
                                          📎
                                        </button>
                                      </>
                                    )}
                                    <input
                                      type="text"
                                      value={chatMessage}
                                      onChange={(e) => setChatMessage(e.target.value)}
                                      placeholder="Type group message..."
                                      className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSendChatMessage(currentWork);
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => handleSendChatMessage(currentWork)}
                                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition"
                                    >
                                      Send
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Right Column: Assigned tasks inside Workspace */}
                <div className="space-y-6">
                  {selectedWorkId ? (
                    (() => {
                      const currentWork = workspaces.find(w => w.id === selectedWorkId);
                      if (!currentWork) return null;
                      const myTasks = currentWork.tasks.filter(t => t.assignedTo === user.username || currentWork.managerId === user.username);
                      return (
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-4">
                          <h4 className="font-display font-bold text-xs text-slate-805 dark:text-slate-200 uppercase tracking-wider">
                            Workspace Task Board
                          </h4>
                          {myTasks.length === 0 ? (
                            <p className="text-[11px] text-slate-405 text-center py-3">No tasks found in this workspace.</p>
                          ) : (
                            <div className="space-y-3">
                              {myTasks.map((t) => {
                                const dlStyle = getDeadlineStyle(t.dueDate);
                                return (
                                  <div key={t.id} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                      <span className="font-display font-bold text-xs text-slate-800 dark:text-white">{t.title}</span>
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${dlStyle.badge}`}>
                                        {dlStyle.indicator}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-450 dark:text-slate-500">{t.description}</p>
                                    
                                    <div className="flex justify-between items-center text-[9px] font-mono border-t border-slate-50 dark:border-slate-800/40 pt-2">
                                      <span className="text-slate-400">For: {t.assignedTo}</span>
                                      <span className={`capitalize font-bold ${
                                        t.status === 'completed'
                                          ? 'text-emerald-500'
                                          : t.status === 'submitted'
                                          ? 'text-indigo-500'
                                          : 'text-amber-500'
                                      }`}>
                                        {t.status.replace('_', ' ')}
                                      </span>
                                    </div>

                                    {/* Action button to update status */}
                                    {t.assignedTo === user.username && t.status !== 'completed' && (
                                      <button
                                        onClick={() => {
                                          alert("Action available in 'Module Workspace' tab.");
                                          setActiveTab('management');
                                        }}
                                        className="w-full mt-2 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-850 text-[9px] font-bold text-indigo-550 dark:text-indigo-400 rounded-lg transition"
                                      >
                                        Update Submission / Status
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 text-center text-xs text-slate-405">
                      Select workspace to see assigned deliverables.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                ENTREPRENEUR OVERVIEW
            ---------------------------------------------------- */}
            {activeRole === 'entrepreneur' && (
              <div className="space-y-6">
                {/* Priority alert banner */}
                <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                          Intelligent AI Activity Prioritizer
                        </h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-500 max-w-xl">
                          Automatically analyze client deadlines, invoices, payment reminders, meetings, and team tasks using Nexus AI.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={aiPrioritizeEntrepreneurs}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                    >
                      <Flame className="w-3.5 h-3.5" /> AI Auto Prioritize
                    </button>
                  </div>

                  {aiResponse && (
                    <div className="mt-4 p-3 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-200/30 rounded-xl text-left">
                      <span className="text-[9px] font-mono text-indigo-500 dark:text-indigo-400 uppercase font-bold block mb-1">
                        AI Prioritization Output
                      </span>
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                        {aiResponse === 'prioritizing' ? 'Running OpenRouter priority analytics...' : aiResponse}
                      </p>
                    </div>
                  )}
                </div>

                {/* Entrepreneur Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Creation Form */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-4">
                    <h3 className="font-display font-bold text-xs text-slate-805 dark:text-slate-205 uppercase tracking-wider flex items-center gap-1">
                      <PlusCircle className="w-4 h-4 text-indigo-500" /> Log Activity Track
                    </h3>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Type</label>
                        <select
                          value={entType}
                          onChange={(e) => setEntType(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                        >
                          <option value="meeting">Meeting</option>
                          <option value="bill">Bill Payment</option>
                          <option value="interview">Interview</option>
                          <option value="task">Team Task</option>
                          <option value="deadline">Client Deadline</option>
                          <option value="goal">Business Goal</option>
                          <option value="other">Others / Custom Track</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Title</label>
                        <input
                          type="text"
                          value={entTitle}
                          onChange={(e) => setEntTitle(e.target.value)}
                          placeholder="e.g. DBMS Client Invoice"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Description / Message</label>
                        <textarea
                          value={entDescription}
                          onChange={(e) => setEntDescription(e.target.value)}
                          placeholder="Add details or custom message..."
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase mb-1">Due Date</label>
                          <input
                            type="date"
                            value={entDue}
                            onChange={(e) => setEntDue(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase mb-1">Time</label>
                          <input
                            type="time"
                            value={entTime}
                            onChange={(e) => setEntTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      {entType === 'bill' && (
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase mb-1">Amount ($)</label>
                          <input
                            type="number"
                            value={entAmount}
                            onChange={(e) => setEntAmount(e.target.value)}
                            placeholder="150"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-1">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-[10px] font-semibold text-slate-500 transition">
                          📎 {entAttachment ? 'Change File' : 'Attach Photo/File'}
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const fakeUrl = URL.createObjectURL(file);
                                setEntAttachment({
                                  name: file.name,
                                  type: file.type.startsWith('image/') ? 'image' : 'file',
                                  url: fakeUrl
                                });
                              }
                            }}
                          />
                        </label>
                        {entAttachment && (
                          <span className="text-[10px] text-indigo-500 font-medium truncate max-w-[150px]">
                            {entAttachment.name}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (entTitle && entDue) {
                            addEntrepreneurItem({
                              type: entType,
                              title: entTitle,
                              dueDate: entDue,
                              time: entTime,
                              amount: entAmount ? parseFloat(entAmount) : undefined,
                              description: entDescription || undefined,
                              attachmentName: entAttachment?.name,
                              attachmentType: entAttachment?.type,
                              attachmentUrl: entAttachment?.url
                            });
                            setEntTitle('');
                            setEntDue('');
                            setEntAmount('');
                            setEntDescription('');
                            setEntAttachment(null);
                          }
                        }}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-xl transition shadow-md cursor-pointer"
                      >
                        Log Activity Node
                      </button>
                    </div>
                  </div>

                  {/* List items pending */}
                  <div className="md:col-span-2 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-4">
                    <h3 className="font-display font-bold text-xs text-slate-805 dark:text-slate-205 uppercase tracking-wider flex items-center gap-1.5">
                      <ClipboardList className="w-4.5 h-4.5 text-indigo-500" /> Pending Entrepreneur Tracks
                    </h3>

                    {entrepreneurItems.length === 0 ? (
                      <div className="text-center py-12 text-xs text-slate-400">
                        No active activities logged. Enter bills, meetings, or deadlines on the left.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                        {entrepreneurItems.map((item) => {
                          const dlStyle = getDeadlineStyle(item.dueDate);
                          return (
                            <div
                              key={item.id}
                              className={`p-4 bg-white dark:bg-slate-900 border rounded-xl flex flex-col gap-3 transition hover:shadow-sm ${
                                item.status === 'completed'
                                  ? 'opacity-60 border-slate-100 dark:border-slate-850'
                                  : `border-slate-200 dark:border-slate-800 ${dlStyle.blinking ? 'animate-[pulse_2s_infinite]' : ''}`
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    item.priority === 'high'
                                      ? 'bg-red-500'
                                      : item.priority === 'medium'
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`} />
                                  <span className="font-display font-bold text-xs text-slate-850 dark:text-white capitalize">
                                    {item.title} ({item.type})
                                  </span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${dlStyle.badge}`}>
                                  {dlStyle.indicator}
                                </span>
                              </div>

                              {item.description && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-normal text-left">
                                  {item.description}
                                </p>
                              )}

                              {item.attachmentName && item.attachmentType === 'image' && (
                                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-36 max-w-sm">
                                  <img src={item.attachmentUrl} alt={item.attachmentName} className="object-cover w-full h-full max-h-36" />
                                </div>
                              )}
                              {item.attachmentName && item.attachmentType === 'file' && (
                                <div className="flex items-center gap-1.5 p-2 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-[10px] font-mono">
                                  <span>📎</span>
                                  <span className="truncate flex-1 text-slate-600 dark:text-slate-400 text-left">{item.attachmentName}</span>
                                  <a href={item.attachmentUrl} download={item.attachmentName} className="text-indigo-500 hover:underline shrink-0">Download</a>
                                </div>
                              )}

                              {item.aiExplanation && (
                                <p className="text-[10.5px] text-indigo-600 dark:text-indigo-400 font-sans italic bg-indigo-50/15 dark:bg-indigo-950/10 p-2 rounded-lg leading-normal text-left">
                                  🤖 AI: {item.aiExplanation}
                                </p>
                              )}

                              <div className="flex justify-between items-center text-[9.5px] font-mono text-slate-400 border-t border-slate-50 dark:border-slate-800/40 pt-2">
                                <span>Due: {item.dueDate} {item.time && `@ ${item.time}`}</span>
                                {item.amount && <span>Amount: ${item.amount}</span>}
                                <button
                                  onClick={() => toggleEntrepreneurItem(item.id)}
                                  className={`px-2.5 py-1 rounded-lg font-bold transition text-[8.5px] uppercase ${
                                    item.status === 'completed'
                                      ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20'
                                      : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-500 dark:bg-slate-800 text-slate-400 cursor-pointer'
                                  }`}
                                >
                                  {item.status === 'completed' ? 'Done' : 'Mark Completed'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ----------------------------------------------------
            MANAGEMENT WORKSPACE ACTIONS TAB
        ---------------------------------------------------- */}
        {activeTab === 'management' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* ----------------------------------------------------
                STUDENT MODULE: SUBMISSIONS ENGINE
            ---------------------------------------------------- */}
            {activeRole === 'student' && (
              <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-6">
                <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-500" /> Assignment Submission Panel
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Select Class & Assignment */}
                  <div className="md:col-span-1 space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Select Classroom</label>
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                      >
                        <option value="">-- Choose Classroom --</option>
                        {classrooms.filter(c => c.students.includes(user.username)).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedClassId && (
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Select Assignment</label>
                        <select
                          className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                          id="select-assign-id"
                        >
                          <option value="">-- Choose Assignment --</option>
                          {classrooms.find(c => c.id === selectedClassId)?.assignments.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Submission Vector Mode</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {(['text', 'file', 'camera', 'image'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setSubType(mode)}
                            className={`p-2.5 border rounded-xl text-center capitalize flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                              subType === mode
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/20'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}
                          >
                            {mode === 'text' && <FileText className="w-4 h-4" />}
                            {mode === 'file' && <FileUp className="w-4 h-4" />}
                            {mode === 'camera' && <Camera className="w-4 h-4" />}
                            {mode === 'image' && <Image className="w-4 h-4" />}
                            <span>{mode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submission detail/inputs */}
                  <div className="md:col-span-2 space-y-4">
                    {subType === 'text' && (
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-400 uppercase">Text Submission Content</label>
                        <textarea
                          rows={6}
                          value={subTextContent}
                          onChange={(e) => setSubTextContent(e.target.value)}
                          placeholder="Type or paste assignment response here..."
                          className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                        />
                      </div>
                    )}

                    {subType === 'file' && (
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-white dark:bg-slate-900 hover:border-indigo-500 transition cursor-pointer flex flex-col items-center justify-center">
                        <FileUp className="w-10 h-10 text-indigo-550 mb-3" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Drag & Drop assignment documents</span>
                        <span className="text-[9.5px] text-slate-400 mt-1">Supports PDF, DOCX, ZIP, PPTX (Max 25MB)</span>
                        <input
                          type="file"
                          className="hidden"
                          id="file-upload-sub"
                          onChange={(e) => setSubTextContent(e.target.files?.[0]?.name || 'assignment_submission.pdf')}
                        />
                        <button
                          onClick={() => document.getElementById('file-upload-sub')?.click()}
                          className="mt-4 px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg transition"
                        >
                          Browse Files
                        </button>
                        {subTextContent && (
                          <span className="mt-3 text-xs text-emerald-500 font-mono font-bold">Selected: {subTextContent}</span>
                        )}
                      </div>
                    )}

                    {subType === 'camera' && (
                      <div className="border border-slate-200 dark:border-slate-800 bg-slate-950 rounded-2xl overflow-hidden relative min-h-[220px] flex flex-col items-center justify-center text-white">
                        {cameraActive ? (
                          <div className="w-full flex flex-col items-center p-4">
                            <video ref={videoRef} autoPlay playsInline className="w-64 h-48 bg-slate-900 rounded-xl scale-x-[-1]" />
                            <button
                              onClick={handleCapture}
                              className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold"
                            >
                              Snap Image
                            </button>
                          </div>
                        ) : cameraCaptured ? (
                          <div className="w-full flex flex-col items-center p-4">
                            <img src={cameraCaptured} className="w-64 h-48 object-cover rounded-xl" alt="captured scan" />
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={handleStartCamera}
                                className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-xs font-bold rounded-lg"
                              >
                                Retake
                              </button>
                              <span className="text-[10px] text-emerald-500 font-bold self-center">✓ Snapped ready</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center flex flex-col items-center">
                            <Camera className="w-10 h-10 text-indigo-400 mb-3" />
                            <span className="text-xs font-semibold">Camera Capture Note scanner</span>
                            <button
                              onClick={handleStartCamera}
                              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold"
                            >
                              Start Webcam Scan
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {subType === 'image' && (
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-white dark:bg-slate-900 hover:border-indigo-500 transition cursor-pointer flex flex-col items-center justify-center">
                        <Image className="w-10 h-10 text-indigo-550 mb-3" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload Image File</span>
                        <span className="text-[9.5px] text-slate-400 mt-1">Supports PNG, JPG, JPEG (Max 10MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="image-upload-sub"
                          onChange={(e) => setSubTextContent(e.target.files?.[0]?.name || 'captured_notes_board.png')}
                        />
                        <button
                          onClick={() => document.getElementById('image-upload-sub')?.click()}
                          className="mt-4 px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg transition"
                        >
                          Select Image
                        </button>
                        {subTextContent && (
                          <span className="mt-3 text-xs text-emerald-500 font-mono font-bold">Selected: {subTextContent}</span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const assignId = (document.getElementById('select-assign-id') as HTMLSelectElement)?.value;
                        const finalContent = subType === 'camera' ? (cameraCaptured || 'mock_capture.png') : subTextContent;
                        if (selectedClassId && assignId && finalContent) {
                          submitAssignment(selectedClassId, assignId, subType, finalContent);
                          setSubTextContent('');
                          setCameraCaptured(null);
                          alert('Assignment response submitted successfully!');
                          setActiveTab('overview');
                        } else {
                          alert('Please select classroom, assignment and write/select content.');
                        }
                      }}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-4 h-4" /> Submit Assignment Response
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                FACULTY MODULE: ACTIONS MANAGER
            ---------------------------------------------------- */}
            {activeRole === 'faculty' && (
              <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-6">
                <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">
                  Faculty Action Control Panel
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Select classroom & control type */}
                  <div className="md:col-span-1 space-y-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Select Classroom</label>
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs"
                      >
                        <option value="">-- Choose Classroom --</option>
                        {classrooms.filter(c => c.teacherId === user.username).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedClassId && (
                      (() => {
                        const currentClass = classrooms.find(c => c.id === selectedClassId);
                        if (!currentClass) return null;
                        const pendingReviews: { assignment: ClassroomAssignment, sub: StudentSubmission }[] = [];
                        currentClass.assignments.forEach(a => {
                          a.submissions.forEach(s => {
                            if (s.marks === undefined) {
                              pendingReviews.push({ assignment: a, sub: s });
                            }
                          });
                        });

                        return (
                          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                            <span className="text-[10px] font-mono text-slate-400 uppercase block">Pending Grading Queue</span>
                            {pendingReviews.length === 0 ? (
                              <p className="text-[10px] text-slate-400">All submissions graded!</p>
                            ) : (
                              <div className="space-y-2">
                                {pendingReviews.map((item, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      // Grade sub action
                                      setGradeMarks(item.assignment.maxMarks);
                                      // Trigger grade flow in mock
                                      const marksStr = prompt(`Grade ${item.sub.studentName} for "${item.assignment.title}" (Max ${item.assignment.maxMarks}):`, String(item.assignment.maxMarks));
                                      const feedStr = prompt(`Write feedback for ${item.sub.studentName}:`, 'Excellent work!');
                                      if (marksStr !== null) {
                                        gradeSubmission(currentClass.id, item.assignment.id, item.sub.id, parseInt(marksStr), feedStr || '');
                                        alert("Grade applied successfully!");
                                      }
                                    }}
                                    className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-[9.5px] border hover:border-indigo-500 transition cursor-pointer"
                                  >
                                    <div className="font-bold text-slate-800 dark:text-white">{item.sub.studentName}</div>
                                    <div className="text-slate-400 mt-0.5">{item.assignment.title}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()
                    )}
                  </div>

                  {/* Create Forms */}
                  <div className="md:col-span-2 space-y-6">
                    {selectedClassId ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Assign form */}
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
                          <h4 className="font-display font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                            Post New Assignment
                          </h4>
                          <div>
                            <label className="block text-[9px] text-slate-450 uppercase mb-1">Title</label>
                            <input
                              type="text"
                              value={assignTitle}
                              onChange={(e) => setAssignTitle(e.target.value)}
                              placeholder="e.g. DBMS Normalization"
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-450 uppercase mb-1">Description</label>
                            <textarea
                              value={assignDesc}
                              onChange={(e) => setAssignDesc(e.target.value)}
                              placeholder="Brief instructions..."
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] text-slate-450 uppercase mb-1">Due Date</label>
                              <input
                                type="date"
                                value={assignDue}
                                onChange={(e) => setAssignDue(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-450 uppercase mb-1">Max Marks</label>
                              <input
                                type="number"
                                value={assignMarks}
                                onChange={(e) => setAssignMarks(parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (assignTitle && assignDue) {
                                postAssignment(selectedClassId, assignTitle, assignDesc, assignDue, assignMarks);
                                setAssignTitle('');
                                setAssignDesc('');
                                setAssignDue('');
                                alert('Assignment posted to classroom queue!');
                              }
                            }}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-xl transition"
                          >
                            Post Assignment
                          </button>
                        </div>

                        {/* Announcements & Study Materials */}
                        <div className="space-y-6">
                          {/* Announcement form */}
                          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
                            <h4 className="font-display font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                              Send Classroom Announcement
                            </h4>
                            <div>
                              <input
                                type="text"
                                value={announceTitle}
                                onChange={(e) => setAnnounceTitle(e.target.value)}
                                placeholder="Announcement Title"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                              />
                            </div>
                            <div>
                              <textarea
                                value={announceContent}
                                onChange={(e) => setAnnounceContent(e.target.value)}
                                placeholder="Write announcement details..."
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <label className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-[10px] font-semibold text-slate-500 transition">
                                📎 {facultyAttachment ? 'Change File' : 'Attach Photo/File'}
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const fakeUrl = URL.createObjectURL(file);
                                      setFacultyAttachment({
                                        name: file.name,
                                        type: file.type.startsWith('image/') ? 'image' : 'file',
                                        url: fakeUrl
                                      });
                                    }
                                  }}
                                />
                              </label>
                              {facultyAttachment && (
                                <span className="text-[10px] text-indigo-500 font-medium truncate max-w-[150px]">
                                  {facultyAttachment.name}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                if (announceTitle && announceContent) {
                                  postAnnouncement(
                                    selectedClassId,
                                    announceTitle,
                                    announceContent,
                                    facultyAttachment?.name,
                                    facultyAttachment?.type,
                                    facultyAttachment?.url
                                  );
                                  setAnnounceTitle('');
                                  setAnnounceContent('');
                                  setFacultyAttachment(null);
                                  alert('Announcement pushed to all classroom students!');
                                }
                              }}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-xl transition cursor-pointer"
                            >
                              Publish Announcement
                            </button>
                          </div>

                          {/* Material form */}
                          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
                            <h4 className="font-display font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                              Upload Study Material
                            </h4>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={matTitle}
                                onChange={(e) => setMatTitle(e.target.value)}
                                placeholder="Material Title"
                                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                              />
                              <select
                                value={matType}
                                onChange={(e) => setMatType(e.target.value)}
                                className="px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                              >
                                <option value="PDF">PDF</option>
                                <option value="DOCX">DOC</option>
                                <option value="Slides">PPT</option>
                                <option value="Link">URL</option>
                              </select>
                            </div>
                            <input
                              type="text"
                              value={matUrl}
                              onChange={(e) => setMatUrl(e.target.value)}
                              placeholder="Resource URL / path"
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                            />
                            <button
                              onClick={() => {
                                if (matTitle && matUrl) {
                                  postMaterial(selectedClassId, matTitle, matUrl, matType);
                                  setMatTitle('');
                                  setMatUrl('');
                                  alert('Study resource uploaded successfully!');
                                }
                              }}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-xl transition"
                            >
                              Upload Material
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        Select a classroom to unleash post controls.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                WORKING PROFESSIONAL: ACTIONS MODULE
            ---------------------------------------------------- */}
            {activeRole === 'professional' && (
              <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-855/50 p-5 space-y-6">
                <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">
                  Workspace Actions Manager
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Select workspace & list options */}
                  <div className="md:col-span-1 space-y-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Select Workspace</label>
                      <select
                        value={selectedWorkId}
                        onChange={(e) => setSelectedWorkId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs"
                      >
                        <option value="">-- Choose Workspace --</option>
                        {workspaces.filter(w => w.managerId === user.username || w.members.includes(user.username)).map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Employee submit task area */}
                    {selectedWorkId && (
                      (() => {
                        const currentWork = workspaces.find(w => w.id === selectedWorkId);
                        if (!currentWork) return null;
                        const isManager = currentWork.managerId === user.username;
                        const myAssignedTasks = currentWork.tasks.filter(t => t.assignedTo === user.username && t.status !== 'completed');

                        if (!isManager && myAssignedTasks.length > 0) {
                          return (
                            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
                              <span className="font-display font-semibold text-xs text-indigo-550 block">Submit Task Deliverables</span>
                              {myAssignedTasks.map((t) => (
                                <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-850">
                                  <span className="font-bold text-slate-800 dark:text-white block">{t.title}</span>
                                  <textarea
                                    rows={3}
                                    placeholder="Write work description or link..."
                                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-[11px]"
                                    id={`work-text-${t.id}`}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        const text = (document.getElementById(`work-text-${t.id}`) as HTMLTextAreaElement)?.value;
                                        if (text) {
                                          submitWorkspaceWork(currentWork.id, t.id, text);
                                          alert("Work submitted to manager review queue!");
                                        }
                                      }}
                                      className="flex-1 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold"
                                    >
                                      Submit Completed
                                    </button>
                                    <button
                                      onClick={() => {
                                        updateWorkspaceTaskStatus(currentWork.id, t.id, 'in_progress');
                                        alert("Task status updated to In Progress.");
                                      }}
                                      className="px-2 py-1 bg-slate-200 dark:bg-slate-850 rounded text-[10px]"
                                    >
                                      Mark In Progress
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        // Manager review submitted tasks
                        if (isManager) {
                          const submittedTasks = currentWork.tasks.filter(t => t.status === 'submitted');
                          return (
                            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
                              <span className="font-display font-semibold text-xs text-indigo-550 block">Review Deliverables</span>
                              {submittedTasks.length === 0 ? (
                                <p className="text-[10px] text-slate-400">No submissions pending review.</p>
                              ) : (
                                <div className="space-y-2">
                                  {submittedTasks.map((t) => (
                                    <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2 text-left">
                                      <span className="font-bold block text-slate-800 dark:text-white">{t.title}</span>
                                      <span className="text-[10px] text-slate-400 block">By: {t.assignedTo}</span>
                                      <p className="text-[10px] text-slate-500 italic bg-white dark:bg-slate-900 p-2 rounded border border-slate-200/50">
                                        "{t.submissionText}"
                                      </p>
                                      <div className="flex gap-2 pt-1">
                                        <button
                                          onClick={() => {
                                            const feed = prompt("Write feedback:", "Approved and merged.");
                                            updateWorkspaceTaskStatus(currentWork.id, t.id, 'completed', feed || '');
                                          }}
                                          className="flex-1 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-[10px]"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => {
                                            const feed = prompt("Write feedback:", "Needs revision.");
                                            updateWorkspaceTaskStatus(currentWork.id, t.id, 'in_progress', feed || '');
                                          }}
                                          className="px-2 py-1 bg-red-500 text-white rounded text-[10px]"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()
                    )}
                  </div>

                  {/* Manager Creator Controls */}
                  <div className="md:col-span-2">
                    {selectedWorkId ? (
                      (() => {
                        const currentWork = workspaces.find(w => w.id === selectedWorkId);
                        if (!currentWork) return null;
                        const isManager = currentWork.managerId === user.username;
                        
                        if (!isManager) {
                          return (
                            <div className="p-6 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                              You are joined as an Employee member. Manager controls are locked.
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Create workspace task */}
                            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
                              <h4 className="font-display font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                Assign Task Deliverable
                              </h4>
                              <div>
                                <label className="block text-[9px] text-slate-450 uppercase mb-1">Task Title</label>
                                <input
                                  type="text"
                                  value={workTaskTitle}
                                  onChange={(e) => setWorkTaskTitle(e.target.value)}
                                  placeholder="e.g. Audit API Schema"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-450 uppercase mb-1">Description</label>
                                <textarea
                                  value={workTaskDesc}
                                  onChange={(e) => setWorkTaskDesc(e.target.value)}
                                  placeholder="Describe deliverables..."
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9px] text-slate-450 uppercase mb-1">Assignee username</label>
                                  <input
                                    type="text"
                                    value={workTaskAssignee}
                                    onChange={(e) => setWorkTaskAssignee(e.target.value)}
                                    placeholder="Username"
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] text-slate-450 uppercase mb-1">Due Date</label>
                                  <input
                                    type="date"
                                    value={workTaskDue}
                                    onChange={(e) => setWorkTaskDue(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-800 dark:text-white"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (workTaskTitle && workTaskAssignee && workTaskDue) {
                                    createWorkspaceTask(currentWork.id, workTaskTitle, workTaskDesc, workTaskAssignee, workTaskDue);
                                    setWorkTaskTitle('');
                                    setWorkTaskDesc('');
                                    setWorkTaskAssignee('');
                                    setWorkTaskDue('');
                                    alert('Task successfully assigned to Employee!');
                                  }
                                }}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-xl transition"
                              >
                                Assign Task
                              </button>
                            </div>

                            {/* Post workspace announcement */}
                            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
                              <h4 className="font-display font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                Send Workspace Announcement
                              </h4>
                              <div>
                                <input
                                  type="text"
                                  value={workAnnTitle}
                                  onChange={(e) => setWorkAnnTitle(e.target.value)}
                                  placeholder="Announcement Title"
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                                />
                              </div>
                              <div>
                                <textarea
                                  value={workAnnContent}
                                  onChange={(e) => setWorkAnnContent(e.target.value)}
                                  placeholder="Write announcement details..."
                                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  if (workAnnTitle && workAnnContent) {
                                    postWorkspaceAnnouncement(currentWork.id, workAnnTitle, workAnnContent);
                                    setWorkAnnTitle('');
                                    setWorkAnnContent('');
                                    alert('Workspace announcement published!');
                                  }
                                }}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-xl transition"
                              >
                                Publish Announcement
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        Select a workspace to unleash Manager controls.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                ENTREPRENEUR WORKSPACE: PRIORITIZER CONTROLS
            ---------------------------------------------------- */}
            {activeRole === 'entrepreneur' && (
              <div className="p-6 text-center text-slate-405 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                For Entrepreneurs, tracking is unified under the "Overview" tab. Please use the AI prioritizer, task creations, and indicators inside Overview.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Alert Modal Popup */}
      <AnimatePresence>
        {aiAlertMessage && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl relative text-left"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
                  <Cpu className="w-5 h-5 animate-pulse text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display uppercase tracking-wider">
                  Nexus AI Smart Alert
                </h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mb-6 font-medium">
                🤖 <strong className="text-indigo-600 dark:text-indigo-400">Attention:</strong> New work deliverable added by admin <strong className="text-slate-800 dark:text-white">{aiAlertMessage.adminName}</strong>:
                <br /><br />
                <span className="italic block bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-205 dark:border-slate-805">
                  "{aiAlertMessage.title}"
                </span>
                <br />
                📅 <strong>Deadline:</strong> {aiAlertMessage.deadline}
              </p>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => setAiAlertMessage(null)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition"
                >
                  Acknowledge Deliverable
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
