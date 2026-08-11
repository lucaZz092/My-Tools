/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CRM } from './components/CRM';
import { Kanban } from './components/Kanban';
import { Finance } from './components/Finance';
import { GitHubView } from './components/GitHubView';
import { Settings } from './components/Settings';
import { CalendarView } from './components/CalendarView';
import type { ViewState } from './types';
import { useStore } from './store/useStore';
import { X, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { notifications, addNotification, markNotificationRead, clearNotifications } = useStore();

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') {
          console.log(data.message);
          return;
        }
        
        if (data.id && data.source) {
          addNotification({
            id: data.id,
            source: data.source,
            title: data.title,
            message: data.message,
            timestamp: data.timestamp
          });
        }
      } catch (err) {
        console.error('Error parsing notification', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [addNotification]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'crm': return <CRM />;
      case 'kanban': return <Kanban />;
      case 'finance': return <Finance />;
      case 'calendar': return <CalendarView />;
      case 'github': return <GitHubView />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans selection:bg-black selection:text-white">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onToggleNotifications={() => setShowNotifications(!showNotifications)} 
      />
      
      <main className="flex-1 overflow-y-auto p-8 relative">
        {renderView()}

        {showNotifications && (
          <div className="absolute top-8 right-8 w-96 max-h-[80vh] bg-white border border-black flex flex-col z-50 shadow-2xl print:hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900 uppercase tracking-tight text-sm">Notificações</h3>
              <div className="flex items-center gap-2">
                <button onClick={clearNotifications} className="text-xs text-gray-500 hover:text-black font-medium uppercase tracking-wider">Limpar</button>
                <button onClick={() => setShowNotifications(false)} className="p-1 text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              {notifications.map(note => (
                <div key={note.id} className={`p-4 border-b border-gray-100 last:border-0 ${note.read ? 'bg-white' : 'bg-gray-100/50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black border border-black px-1 py-0.5">{note.source}</span>
                        <span className="text-[10px] text-gray-500">{new Date(note.timestamp).toLocaleTimeString('pt-BR')}</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 mt-2">{note.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{note.message}</p>
                    </div>
                    {!note.read && (
                      <button onClick={() => markNotificationRead(note.id)} className="text-gray-400 hover:text-black p-1" title="Marcar como lida">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center p-8 text-gray-500 text-sm">
                  Nenhuma notificação.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
