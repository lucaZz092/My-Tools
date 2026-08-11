import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Plus, ExternalLink, Video, Loader2, AlertCircle } from 'lucide-react';
import { format, addHours, startOfDay, endOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { initAuth, googleSignIn, getAccessToken } from '../lib/auth';
import { User } from 'firebase/auth';

interface CalendarEvent {
  id: string;
  summary: string;
  htmlLink: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  hangoutLink?: string;
}

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), 'HH:mm'),
    endTime: format(addHours(new Date(), 1), 'HH:mm')
  });

  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getAccessToken();
      if (!token) {
        setNeedsAuth(true);
        throw new Error('Autenticação necessária. Por favor, conecte sua conta Google.');
      }

      const timeMin = startOfDay(new Date()).toISOString();
      const timeMax = endOfDay(addDays(new Date(), 30)).toISOString();
      
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401 || res.status === 403) {
        setNeedsAuth(true);
        throw new Error('Sessão expirada ou sem permissão. Reconecte-se.');
      }
      
      if (!res.ok) throw new Error('Erro ao buscar eventos do Google Calendar.');
      const data = await res.json();
      setEvents(data.items || []);
      setNeedsAuth(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      () => {
        setNeedsAuth(false);
        fetchEvents();
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      await googleSignIn();
      setNeedsAuth(false);
      fetchEvents();
    } catch (err: any) {
      setError('Falha ao autenticar: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Não autenticado.');

      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();

      const payload = {
        summary: formData.title,
        start: { dateTime: startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      };

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao criar evento.');
      
      setIsModalOpen(false);
      setFormData({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: format(new Date(), 'HH:mm'),
        endTime: format(addHours(new Date(), 1), 'HH:mm')
      });
      
      fetchEvents();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto py-24 text-center">
        <CalendarIcon className="w-16 h-16 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Conecte sua Agenda</h2>
        <p className="text-gray-600 mb-8 text-sm">
          Para exibir e criar eventos diretamente pelo aplicativo, é necessário conectar sua conta do Google e autorizar o acesso ao Calendar.
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 text-sm mb-6 w-full text-left border border-red-200">
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin} 
          disabled={isLoggingIn}
          className="bg-black text-white px-6 py-3 font-bold text-sm uppercase tracking-wider flex items-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 bg-white rounded-full p-0.5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          )}
          {isLoggingIn ? 'Conectando...' : 'Conectar com Google'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-300 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Agenda & Reuniões</h2>
          <p className="text-sm text-gray-600">Sincronizado com o Google Calendar</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agendar Reunião (Meet)
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading && events.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-gray-300">
          <div className="grid grid-cols-1 divide-y divide-gray-200">
            {events.map((event) => {
              const startDate = event.start.dateTime ? new Date(event.start.dateTime) : (event.start.date ? new Date(event.start.date) : new Date());
              return (
                <div key={event.id} className="flex flex-col sm:flex-row p-4 gap-4 hover:bg-gray-50 transition-colors">
                  <div className="sm:w-32 shrink-0">
                    <p className="text-sm font-bold text-gray-900">{format(startDate, 'dd MMM', { locale: ptBR })}</p>
                    <p className="text-xs text-gray-500">{event.start.dateTime ? format(startDate, 'HH:mm') : 'Dia Inteiro'}</p>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{event.summary || '(Sem Título)'}</h4>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <a 
                        href={event.htmlLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-black border border-gray-300 px-2.5 py-1"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Ver no Calendar
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                      {event.hangoutLink && (
                        <a 
                          href={event.hangoutLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Entrar no Meet
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">
                Nenhum evento futuro encontrado nos próximos 30 dias.
              </div>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 uppercase">Nova Reunião</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black" placeholder="Ex: Alinhamento de Projeto" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Data</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Início</label>
                  <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fim</label>
                  <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black border border-transparent hover:border-gray-300 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white text-sm font-medium flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
