import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import type { TaskStatus } from '../types';

export function Kanban() {
  const { tasks, addTask, moveTask, removeTask } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'A Fazer', color: 'bg-slate-200' },
    { id: 'doing', title: 'Em Andamento', color: 'bg-blue-100' },
    { id: 'done', title: 'Concluído', color: 'bg-emerald-100' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      title: formData.title,
      description: formData.description,
      status: 'todo'
    });
    setIsModalOpen(false);
    setFormData({ title: '', description: '' });
  };

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, status: TaskStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTask(taskId, status);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-300 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Kanban de Projetos</h2>
          <p className="text-gray-600">Gerencie suas tarefas com facilidade.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-4">
        {columns.map((col) => {
          const columnTasks = tasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id}
              className="bg-gray-50 border border-gray-300 p-4 flex flex-col h-full"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${col.color}`}></span>
                  {col.title}
                </h3>
                <span className="text-xs font-medium bg-slate-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {columnTasks.map((task) => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    className="bg-white p-4 border border-gray-300 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors group relative"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <button 
                        onClick={() => removeTask(task.id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <GripVertical className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-300  flex items-center justify-center text-slate-400 text-sm">
                    Arraste tarefas para cá
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 uppercase">Nova Tarefa</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descrição</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100  transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-black text-white  hover:bg-gray-800 transition-colors">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
