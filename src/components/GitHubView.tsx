import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Github, CircleDot, GitCommit, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Issue {
  id: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  user: { login: string };
}

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  html_url: string;
}

export function GitHubView() {
  const { githubConfig } = useStore();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!githubConfig.owner || !githubConfig.repo) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const headers: any = {};
        if (githubConfig.token) {
          headers.Authorization = `token ${githubConfig.token}`;
        }
        
        const [issuesRes, commitsRes] = await Promise.all([
          axios.get(`/api/github/repos/${githubConfig.owner}/${githubConfig.repo}/issues?per_page=10`, { headers }),
          axios.get(`/api/github/repos/${githubConfig.owner}/${githubConfig.repo}/commits?per_page=10`, { headers })
        ]);

        setIssues(issuesRes.data);
        setCommits(commitsRes.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Erro ao carregar dados do GitHub. Verifique as configurações.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [githubConfig]);

  if (!githubConfig.owner || !githubConfig.repo) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center text-gray-600">
        <Github className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-medium text-gray-700">GitHub Não Configurado</h2>
        <p className="mt-2 text-center max-w-md">Vá até as Configurações e adicione o Owner e o nome do Repositório para visualizar os commits e issues.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center gap-3 shrink-0">
        <div className="p-3 bg-black text-white rounded-xl">
          <Github className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{githubConfig.owner} / {githubConfig.repo}</h2>
          <p className="text-gray-600">Últimas atualizações do repositório.</p>
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-600 p-4  flex items-start gap-3 border border-red-100 shrink-0">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="bg-white rounded-xl border border-gray-300 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-300 bg-gray-50 shrink-0 flex items-center gap-2">
              <CircleDot className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-gray-900">Issues Recentes</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {issues.map(issue => (
                <a 
                  key={issue.id} 
                  href={issue.html_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block p-4  border border-gray-200 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <h4 className="font-medium text-gray-900 mb-1">{issue.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <CircleDot className="w-3 h-3 text-emerald-500" />
                      {issue.state}
                    </span>
                    <span>por {issue.user.login}</span>
                    <span>{new Date(issue.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </a>
              ))}
              {issues.length === 0 && <p className="text-gray-600 text-center py-4">Nenhuma issue encontrada.</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-300 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-300 bg-gray-50 shrink-0 flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Commits Recentes</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {commits.map(commit => (
                <a 
                  key={commit.sha} 
                  href={commit.html_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block p-4  border border-gray-200 hover:border-slate-300 hover:shadow-sm transition-all group"
                >
                  <p className="font-medium text-gray-900 mb-2 line-clamp-2">{commit.commit.message}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {commit.sha.substring(0, 7)}
                    </span>
                    <span>por {commit.commit.author.name}</span>
                    <span>{new Date(commit.commit.author.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </a>
              ))}
              {commits.length === 0 && <p className="text-gray-600 text-center py-4">Nenhum commit encontrado.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
