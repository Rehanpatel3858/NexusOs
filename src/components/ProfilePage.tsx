import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { UserProfile } from '../types';
import { StatsCards } from './StatsCards';
import { RecentActivity } from './RecentActivity';
import { User, Mail, Phone, MapPin, Globe, AtSign, Briefcase, FileText, Upload, Trash2, Check, X, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useApp();

  // Local states for inputs editable variables
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [role, setRole] = useState(user?.role || 'ADMIN');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');

  // Synchronize local editing states with context updates
  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
      setEmail(user.email);
      setPhone(user.phoneNumber || '');
      setBio(user.bio || '');
      setRole(user.role);
      setWebsite(user.website || '');
      setAvatar(user.avatarUrl || '');
    }
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      username,
      email,
      phoneNumber: phone,
      bio,
      role,
      website,
      avatarUrl: avatar
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
      setEmail(user.email);
      setPhone(user.phoneNumber);
      setBio(user.bio);
      setRole(user.role);
      setWebsite(user.website);
      setAvatar(user.avatarUrl || '');
    }
    setIsEditing(false);
  };

  // Convert uploaded photo to Base64 for instant preview & LocalStorage persistence
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Invalid format. Please select deep image assets: jpg, jpeg, png, or webp.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        // If not editing, auto-save avatar directly
        if (!isEditing) {
          updateProfile({ avatarUrl: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    if (!isEditing) {
      updateProfile({ avatarUrl: '' });
    }
  };

  const toggleToggleField = (fieldName: keyof UserProfile) => {
    if (user) {
      updateProfile({ [fieldName]: !user[fieldName] });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-8" id="profile-view">
      
      {/* 1. GORGEOUS PROFILE HEADER CARD GLASS */}
      <div className="rounded-[32px] glass p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 shadow-md flex flex-col md:flex-row items-center gap-8 relative overflow-hidden text-left">
        {/* Soft background ambient flare */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* IMAGE UPLOAD CONTAINER FRAME */}
        <div className="relative group shrink-0">
          <div className="w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-4xl font-display font-semibold select-none group-hover:brightness-95 transition-all">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{name ? name.split(' ').map(n => n[0]).join('') : 'RP'}</span>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
          />
        </div>

        {/* IMAGE CONTROLLERS AND DETAILS */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="font-display font-bold text-xl md:text-2xl text-slate-900 dark:text-white" id="profile-name-header">
                {user?.name || 'Rehan Patel'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full border border-indigo-500/25 bg-indigo-50/50 dark:bg-indigo-950/20 font-mono text-[10px] tracking-wide text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                {user?.role || 'ADMIN'}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {user?.username ? `@${user.username}` : '@rehanpatel'} • {user?.email || 'redblue.385@gmail.com'}
            </p>
          </div>

          {/* UPLOAD CONTROLLERS */}
          <div className="flex gap-2 flex-wrap justify-center md:justify-start">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-620 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md active:scale-95 transition-all"
              id="upload-photo-btn"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>

            {avatar && (
              <button
                onClick={handleRemovePhoto}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-950/40 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                id="remove-photo-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN INFO FORUM MODULE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* EDITABLE FIELDSET FORM CONTAINER (Span 2) */}
        <div className="lg:col-span-2 rounded-[28px] glass p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 shadow-md flex flex-col text-left">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <h2 className="font-display font-bold text-sm tracking-wide text-slate-850 dark:text-white uppercase">Profile Coordinates</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition cursor-pointer"
                id="edit-profile-trigger"
              >
                Edit Coordinates
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50/50 dark:bg-slate-950/25 disabled:opacity-75 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5" /> Username
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50/50 dark:bg-slate-950/25 disabled:opacity-75 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Node
                </label>
                <input
                  type="email"
                  required
                  disabled={!isEditing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50/50 dark:bg-slate-950/25 disabled:opacity-75 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50/50 dark:bg-slate-950/25 disabled:opacity-75 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Role Title
                </label>
                <select
                  disabled={!isEditing}
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50/50 dark:bg-slate-950/25 disabled:opacity-75 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
                >
                  <option value="student" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Student</option>
                  <option value="faculty" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Faculty</option>
                  <option value="professional" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Professional</option>
                  <option value="entrepreneur" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Entrepreneur</option>
                  <option value="ADMIN" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">ADMIN</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Personal Website
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50/50 dark:bg-slate-950/25 disabled:opacity-75 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Biography Details
              </label>
              <textarea
                disabled={!isEditing}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 dark:bg-slate-950/25 disabled:opacity-75 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white h-24 resize-none"
              />
            </div>

            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800"
              >
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-450 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95 transition cursor-pointer"
                  id="profile-save-btn"
                >
                  Save Changes
                </button>
              </motion.div>
            )}
          </form>
        </div>

        {/* ACCOUNT SETTINGS PREFERENCES PANEL */}
        <div className="rounded-[28px] glass p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 shadow-md flex flex-col text-left">
          <h2 className="font-display font-bold text-sm tracking-wide text-slate-850 dark:text-white uppercase border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            Account Preferences
          </h2>

          <div className="space-y-5 flex-1" id="account-preference-switches">
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Dark Canvas Mode</span>
                <span className="text-[10.5px] text-slate-400 mt-1 block">Full dark environment support.</span>
              </div>
              <button
                onClick={() => toggleToggleField('darkMode')}
                className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer duration-300 ${user?.darkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-200 dark:bg-slate-800 justify-start'} flex items-center`}
              >
                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow" />
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Email Alerts</span>
                <span className="text-[10.5px] text-slate-400 mt-1 block">Sync warnings to inbox.</span>
              </div>
              <button
                onClick={() => toggleToggleField('emailNotifications')}
                className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer duration-300 ${user?.emailNotifications ? 'bg-indigo-600 justify-end' : 'bg-slate-200 dark:bg-slate-800 justify-start'} flex items-center`}
              >
                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow" />
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Desktop Notification Banner</span>
                <span className="text-[10.5px] text-slate-400 mt-1 block">Floating task remind blocks.</span>
              </div>
              <button
                onClick={() => toggleToggleField('desktopNotifications')}
                className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer duration-300 ${user?.desktopNotifications ? 'bg-indigo-600 justify-end' : 'bg-slate-200 dark:bg-slate-800 justify-start'} flex items-center`}
              >
                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow" />
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Cognitive AI Advice</span>
                <span className="text-[10.5px] text-slate-400 mt-1 block">Synthesize intelligent daily insights.</span>
              </div>
              <button
                onClick={() => toggleToggleField('aiSuggestions')}
                className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer duration-300 ${user?.aiSuggestions ? 'bg-indigo-600 justify-end' : 'bg-slate-200 dark:bg-slate-800 justify-start'} flex items-center`}
              >
                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow" />
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Weekly Summary Analytics</span>
                <span className="text-[10.5px] text-slate-400 mt-1 block">Generate baseline comparisons.</span>
              </div>
              <button
                onClick={() => toggleToggleField('weeklyReports')}
                className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer duration-300 ${user?.weeklyReports ? 'bg-indigo-600 justify-end' : 'bg-slate-200 dark:bg-slate-800 justify-start'} flex items-center`}
              >
                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EXTRA PROGRESS METRICS SECTIONS */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 text-left">
          Personal Statistics Matrix
        </h3>
        {/* Dynamic progression stats cards */}
        <StatsCards layoutType="profile" />
      </div>
    </div>
  );
};
