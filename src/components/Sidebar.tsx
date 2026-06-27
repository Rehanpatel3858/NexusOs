import React from 'react';
import { Home, CheckSquare, Hourglass, Calendar, Cpu, Compass, Users, HardDrive, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeHash: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeHash }) => {
  // Navigation lists matching requested requirements
  const menuItems = [
    { id: '#/dashboard', label: 'Home', icon: Home },
    { id: '#/tasks', label: 'Tasks', icon: CheckSquare },
    { id: '#/calendar', label: 'Calendar', icon: Calendar },
    { id: '#/ai-assistant', label: 'AI Assistant', icon: Cpu },
    { id: '#/team', label: 'Team', icon: Users },
    { id: '#/workspace', label: 'Workspace', icon: HardDrive },
    { id: '#/profile', label: 'Security', icon: Shield } // Maps to profile/security
  ];

  // Logic to determine active highlighting
  const getIsActive = (id: string) => {
    if (activeHash === '' || activeHash === '#/' || activeHash === '#/dashboard') {
      return id === '#/dashboard';
    }
    return activeHash.startsWith(id);
  };

  const handleNavClick = (id: string, label: string) => {
    // If it's general workspace components, route or trigger nice actions
    if (id === '#/tasks') {
      window.location.hash = '#/dashboard';
      setTimeout(() => {
        const element = document.getElementById(id.replace('#/', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      window.location.hash = id;
    }
  };

  return (
    <>
      {/* DESKTOP LEFT SIDEBAR: WIDTH 90PX, FIXED LEFT VERTICAL RAIL */}
      <aside className="hidden md:flex flex-col items-center fixed top-20 left-0 bottom-0 w-[90px] border-r border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md py-6 justify-between z-20">
        <div className="flex flex-col gap-4 w-full px-2" id="sidebar-menu-list">
          {menuItems.map((item) => {
            const isActive = getIsActive(item.id);
            const Icon = item.icon;

            return (
              <div key={item.id} className="relative group flex justify-center w-full">
                {/* Rounded high-density trigger styled with Professional Polish details */}
                <button
                  onClick={() => handleNavClick(item.id, item.label)}
                  className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 outline-none cursor-pointer hover:translate-x-1 ${
                    isActive
                      ? 'bg-[#F3F0FF] dark:bg-indigo-950/40 text-[#6D4AFF] dark:text-[#818CF8] font-semibold border border-indigo-200/50 dark:border-indigo-850/50'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                  id={`sidebar-item-${item.label.toLowerCase()}`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 transition-all" />

                  {/* Active highlight glow indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="absolute left-0 w-1 h-6 bg-[#6D4AFF] dark:bg-[#818CF8] rounded-r-lg"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>

                {/* PREMIUM TEXT TOOLTIP */}
                <div className="absolute left-[74px] top-1/2 -translate-y-1/2 bg-slate-900/90 dark:bg-slate-950/95 text-white text-[10px] uppercase font-mono tracking-wider px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50 border border-slate-800">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* BOT FOOTER METRIC */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono text-slate-300 dark:text-slate-700 select-none">V1.4</span>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-slate-200/50 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg z-40 px-3 items-center justify-around">
        {menuItems.slice(0, 5).map((item) => {
          const isActive = getIsActive(item.id);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id, item.label)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition outline-none cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-sans">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
