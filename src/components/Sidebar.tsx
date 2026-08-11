import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  CircleDollarSign, 
  Github, 
  Settings as SettingsIcon,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { ViewState } from '../types';
import { useStore } from '../store/useStore';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onToggleNotifications: () => void;
}

const navItems: { id: ViewState; label: string; icon: React.FC<any> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'crm', label: 'Clientes (CRM)', icon: Users },
  { id: 'kanban', label: 'Projetos', icon: KanbanSquare },
  { id: 'finance', label: 'Finanças', icon: CircleDollarSign },
  { id: 'github', label: 'GitHub', icon: Github },
];

export function Sidebar({ currentView, onNavigate, onToggleNotifications }: SidebarProps) {
  const notifications = useStore(state => state.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 print:hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">N</div>
          Nexus Hub
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              currentView === item.id 
                ? "bg-blue-600/10 text-blue-400" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={onToggleNotifications}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            Notificações
          </div>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            currentView === 'settings' 
              ? "bg-blue-600/10 text-blue-400" 
              : "hover:bg-slate-800 hover:text-white"
          )}
        >
          <SettingsIcon className="w-5 h-5" />
          Configurações
        </button>
      </div>
    </aside>
  );
}
