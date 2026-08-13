// Avoid importing React types to keep this file working when @types/react is not installed.
// Use a loose 'any' type for icon components.
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  CircleDollarSign, 
  Github, 
  Calendar as CalendarIcon,
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

const navItems: { id: ViewState; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'crm', label: 'Clientes (CRM)', icon: Users },
  { id: 'kanban', label: 'Projetos', icon: KanbanSquare },
  { id: 'finance', label: 'Finanças', icon: CircleDollarSign },
  { id: 'calendar', label: 'Agenda & Meet', icon: CalendarIcon },
  { id: 'github', label: 'GitHub', icon: Github },
];

export function Sidebar({ currentView, onNavigate, onToggleNotifications }: SidebarProps) {
  const notifications = useStore(state => state.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-300 text-gray-900 flex flex-col h-screen shrink-0 print:hidden">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 bg-black flex items-center justify-center text-white text-sm">MT</div>
          My Tools
        </h1>
      </div>
      
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors border-l-2",
              currentView === item.id 
                ? "border-black bg-gray-200/50 text-black" 
                : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-black"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          onClick={onToggleNotifications}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 shrink-0" />
            Notificações
          </div>
          {unreadCount > 0 && (
            <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-sm">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors border-l-2",
            currentView === 'settings' 
              ? "border-black bg-gray-200/50 text-black" 
              : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-black"
          )}
        >
          <SettingsIcon className="w-4 h-4 shrink-0" />
          Configurações
        </button>
      </div>
    </aside>
  );
}
