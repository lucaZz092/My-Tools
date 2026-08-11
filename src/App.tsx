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
import type { ViewState } from './types';
import { useStore } from './store/useStore';
import { X, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { notifications, addNotification, markNotificationRead, clearNotifications } = useStore();

  useEffect(() => {
    // Connect to Server-Sent Events for real-time notifications (Webhooks)
    const eventSource = new EventSource('/api/notifications');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') {
          console.log(data.message);
          return;
        }
        
        // Add actual webhook notifications to the store
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
      case 'github': return <GitHubView />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onToggleNotifications={() => setShowNotifications(!showNotifications)} 
      />
      
      <main className="flex-1 overflow-y-auto p-8 relative">
        {renderView()}

        {/* Notifications Panel overlay */}
        {showNotifications && (
          <div className="absolute top-8 right-8 w-96 max-h-[80vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-50 animate-in slide-in-from-right-8 print:hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900">Notificações</h3>
              <div className="flex items-center gap-2">
                <button onClick={clearNotifications} className="text-xs text-slate-500 hover:text-slate-700 font-medium">Limpar</button>
                <button onClick={() => setShowNotifications(false)} className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {notifications.map(note => (
                <div key={note.id} className={`p-4 rounded-lg border ${note.read ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-100'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{note.source}</span>
                        <span className="text-[10px] text-slate-400">{new Date(note.timestamp).toLocaleTimeString('pt-BR')}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-tight mb-1">{note.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{note.message}</p>
                    </div>
                    {!note.read && (
                      <button onClick={() => markNotificationRead(note.id)} className="text-blue-600 hover:text-blue-800 p-1" title="Marcar como lida">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center p-8 text-slate-500 text-sm">
                  Nenhuma notificação recebida.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
