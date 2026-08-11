import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Client, Task, TaskStatus, Transaction, Notification, GithubConfig } from '../types';

interface AppState {
  clients: Client[];
  tasks: Task[];
  transactions: Transaction[];
  notifications: Notification[];
  githubConfig: GithubConfig;
  
  // CRM Actions
  addClient: (client: Omit<Client, 'id'>) => void;
  removeClient: (id: string) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  
  // Kanban Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  removeTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  
  // Finance Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Settings Actions
  setGithubConfig: (config: Partial<GithubConfig>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      clients: [
        { id: '1', name: 'Empresa Alpha', email: 'contato@alpha.com', phone: '11999999999', status: 'active', value: 5000 },
        { id: '2', name: 'Beta Serviços', email: 'vendas@beta.com', phone: '11988888888', status: 'lead', value: 3000 },
      ],
      tasks: [
        { id: '1', title: 'Reunião de Alinhamento', description: 'Definir escopo do projeto', status: 'todo', createdAt: new Date().toISOString() },
        { id: '2', title: 'Mockup Inicial', description: 'Design no figma', status: 'doing', createdAt: new Date().toISOString() },
      ],
      transactions: [
        { id: '1', description: 'Pagamento Projeto A', amount: 5000, type: 'income', date: new Date().toISOString() },
        { id: '2', description: 'Licença Software', amount: 150, type: 'expense', date: new Date().toISOString() },
      ],
      notifications: [],
      githubConfig: {
        owner: '',
        repo: '',
        token: '',
      },
      
      addClient: (client) => set((state) => ({ clients: [...state.clients, { ...client, id: Date.now().toString() }] })),
      removeClient: (id) => set((state) => ({ clients: state.clients.filter((c) => c.id !== id) })),
      updateClient: (id, data) => set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
      })),
      
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: Date.now().toString(), createdAt: new Date().toISOString() }],
      })),
      removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      moveTask: (id, status) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
      })),
      
      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, { ...transaction, id: Date.now().toString() }],
      })),
      removeTransaction: (id) => set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),
      
      addNotification: (notification) => set((state) => ({
        notifications: [{ ...notification, read: false }, ...state.notifications],
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      })),
      clearNotifications: () => set({ notifications: [] }),
      
      setGithubConfig: (config) => set((state) => ({
        githubConfig: { ...state.githubConfig, ...config },
      })),
    }),
    {
      name: 'nexus-hub-storage',
    }
  )
);
