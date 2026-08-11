import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Save, ShieldAlert, Key } from 'lucide-react';

export function Settings() {
  const { githubConfig, setGithubConfig } = useStore();
  const [formData, setFormData] = useState(githubConfig);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGithubConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Configurações</h2>
        <p className="text-gray-600">Gerencie integrações e preferências do sistema.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100  text-gray-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Integração GitHub</h3>
              <p className="text-sm text-gray-600">Configure o repositório principal para visualizar issues e commits.</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Owner / Organization</label>
              <input 
                type="text" 
                placeholder="ex: facebook"
                value={formData.owner} 
                onChange={e => setFormData({...formData, owner: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Repository Name</label>
              <input 
                type="text" 
                placeholder="ex: react"
                value={formData.repo} 
                onChange={e => setFormData({...formData, repo: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Personal Access Token (Opcional)</label>
            <input 
              type="password" 
              placeholder="ghp_xxxxxxxxxxxx"
              value={formData.token} 
              onChange={e => setFormData({...formData, token: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <p className="text-xs text-gray-600 mt-2 flex items-start gap-1">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Necessário apenas para repositórios privados ou para evitar limites de taxa (rate limit) da API. O token fica salvo localmente no seu navegador.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            {saved ? (
              <span className="text-emerald-600 text-sm font-medium">Configurações salvas!</span>
            ) : (
              <span></span>
            )}
            <button 
              type="submit" 
              className="flex items-center gap-2 px-4 py-2 bg-black text-white  hover:bg-slate-800 transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Webhooks (Eventos em Tempo Real)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Para enviar eventos para o seu painel de notificações, configure as integrações externas (Stripe, GitHub Webhooks, etc.) para apontar para a seguinte URL:
        </p>
        <code className="block w-full p-3 bg-black text-green-400  font-mono text-sm overflow-x-auto">
          POST {window.location.origin}/api/webhooks/&lt;nome-da-fonte&gt;
        </code>
        <p className="text-xs text-gray-600 mt-3">
          Payload suportado: <code>{`{ "title": "...", "message": "..." }`}</code> ou qualquer JSON genérico que será exibido nas notificações.
        </p>
      </div>
    </div>
  );
}
