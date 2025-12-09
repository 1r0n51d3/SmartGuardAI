import React from 'react';
import { LayoutDashboard, Camera, FileText, HardHat, Settings, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItemClass = (view: ViewState) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
      currentView === view 
        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
        : 'text-gray-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-amber-500 p-2 rounded-lg">
          <HardHat className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">SiteGuard AI</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <div 
          className={navItemClass(ViewState.DASHBOARD)}
          onClick={() => onNavigate(ViewState.DASHBOARD)}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </div>
        <div 
          className={navItemClass(ViewState.ANALYZE)}
          onClick={() => onNavigate(ViewState.ANALYZE)}
        >
          <Camera size={20} />
          <span className="font-medium">Site Scanner</span>
        </div>
        <div 
          className={navItemClass(ViewState.REPORTS)}
          onClick={() => onNavigate(ViewState.REPORTS)}
        >
          <FileText size={20} />
          <span className="font-medium">Reports</span>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white cursor-pointer">
          <Settings size={20} />
          <span>Settings</span>
        </div>
        <div className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 cursor-pointer">
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;