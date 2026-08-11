import React from 'react';
import { useStore } from '../store/useStore';
import { Users, CheckCircle, TrendingUp, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { clients, tasks, transactions } = useStore();

  const activeClients = clients.filter(c => c.status === 'active').length;
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const chartData = [
    { name: 'Entradas', valor: income, fill: '#000000' },
    { name: 'Saídas', valor: expense, fill: '#6b7280' },
  ];

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-300 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Visão Geral</h2>
          <p className="text-sm text-gray-600">Acompanhe suas métricas principais.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors print:hidden"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 border border-gray-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clientes Ativos</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">{activeClients}</h3>
            </div>
            <Users className="w-6 h-6 text-black" />
          </div>
        </div>
        
        <div className="bg-white p-6 border border-gray-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tarefas Pendentes</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">{pendingTasks}</h3>
            </div>
            <CheckCircle className="w-6 h-6 text-black" />
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Atual</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <TrendingUp className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-gray-300">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight mb-6">Balanço Financeiro</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151' }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val}`} tick={{ fontSize: 12, fill: '#374151' }} />
                <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(val) => `R$ ${val}`} contentStyle={{ borderRadius: 0, border: '1px solid #d1d5db', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="valor" maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-300">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight mb-4">Últimas Transações</h3>
          <div className="space-y-0 divide-y divide-gray-200 border-t border-gray-200">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-gray-900">
                    {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-500 font-mono">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-gray-900">
                  {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-gray-500 text-center py-4 text-sm font-medium">Nenhuma transação recente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
