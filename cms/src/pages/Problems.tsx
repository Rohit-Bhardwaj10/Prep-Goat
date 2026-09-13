import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit } from 'lucide-react';
import api from '../api';

interface Problem {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  createdAt: string;
}

export function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProblems = async () => {
    try {
      const res = await api.get('/problems');
      setProblems(res.data.problems);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;
    try {
      await api.delete(`/problems/${id}`);
      setProblems(problems.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete problem');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Problems</h1>
          <p className="text-zinc-400 mt-1">Manage system design problems.</p>
        </div>
        <Link 
          to="/problems/new" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Problem
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-800/50 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Difficulty</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {problems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  No problems found. Create one to get started.
                </td>
              </tr>
            ) : (
              problems.map(problem => (
                <tr key={problem.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-200">{problem.title}</td>
                  <td className="px-6 py-4 text-zinc-400">
                    <span className="px-2 py-1 bg-zinc-800 rounded text-xs border border-zinc-700">
                      {problem.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{problem.difficulty}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/problems/${problem.id}`}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(problem.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
