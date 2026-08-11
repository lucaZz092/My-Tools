export type ViewState = 'dashboard' | 'crm' | 'kanban' | 'finance' | 'github' | 'settings' | 'calendar';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'lead' | 'inactive';
  value: number;
}

export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export interface Notification {
  id: string;
  source: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface GithubConfig {
  owner: string;
  repo: string;
  token: string;
}
