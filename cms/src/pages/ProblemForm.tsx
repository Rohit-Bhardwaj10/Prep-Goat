import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export function ProblemForm() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'LLD',
    difficulty: 'MEDIUM',
    sampleSolution: '',
  });

  // Array fields (stored as strings in form, parsed on save)
  const [arrayData, setArrayData] = useState({
    requirements: '',
    constraints: '',
    tags: '',
    testCases: '',
    extensibilityHooks: '',
    hints: '',
  });

  useEffect(() => {
    if (isNew) return;
    
    api.get(`/problems/${id}`).then(res => {
      const p = res.data.problem;
      setFormData({
        title: p.title || '',
        description: p.description || '',
        type: p.type || 'LLD',
        difficulty: p.difficulty || 'MEDIUM',
        sampleSolution: p.sampleSolution || '',
      });
      setArrayData({
        requirements: (p.requirements || []).join('\n'),
        constraints: (p.constraints || []).join('\n'),
        tags: (p.tags || []).join('\n'),
        testCases: (p.testCases || []).join('\n'),
        extensibilityHooks: (p.extensibilityHooks || []).join('\n'),
        hints: (p.hints || []).join('\n'),
      });
      setLoading(false);
    }).catch(() => {
      alert('Failed to load problem');
      navigate('/problems');
    });
  }, [id, isNew, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      requirements: arrayData.requirements.split('\n').filter(s => s.trim()),
      constraints: arrayData.constraints.split('\n').filter(s => s.trim()),
      tags: arrayData.tags.split('\n').filter(s => s.trim()),
      testCases: arrayData.testCases.split('\n').filter(s => s.trim()),
      extensibilityHooks: arrayData.extensibilityHooks.split('\n').filter(s => s.trim()),
      hints: arrayData.hints.split('\n').filter(s => s.trim()),
    };

    try {
      if (isNew) {
        await api.post('/problems', payload);
      } else {
        await api.put(`/problems/${id}`, payload);
      }
      navigate('/problems');
    } catch (err) {
      alert('Failed to save problem');
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (field: keyof typeof arrayData, value: string) => {
    setArrayData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{isNew ? 'Create Problem' : 'Edit Problem'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-zinc-400">Title</label>
            <input 
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Type</label>
            <select 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="LLD">LLD</option>
              <option value="HLD">HLD</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Difficulty</label>
            <select 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
              value={formData.difficulty}
              onChange={e => setFormData({...formData, difficulty: e.target.value})}
            >
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-zinc-400">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6">
          <h2 className="text-lg font-medium mb-4">Arrays (One item per line)</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Requirements</label>
              <textarea 
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
                value={arrayData.requirements}
                onChange={e => handleArrayChange('requirements', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Constraints</label>
              <textarea 
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
                value={arrayData.constraints}
                onChange={e => handleArrayChange('constraints', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Test Cases</label>
              <textarea 
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
                value={arrayData.testCases}
                onChange={e => handleArrayChange('testCases', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Extensibility Hooks</label>
              <textarea 
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
                value={arrayData.extensibilityHooks}
                onChange={e => handleArrayChange('extensibilityHooks', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Hints</label>
              <textarea 
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
                value={arrayData.hints}
                onChange={e => handleArrayChange('hints', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Tags</label>
              <textarea 
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
                value={arrayData.tags}
                onChange={e => handleArrayChange('tags', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Sample Solution</label>
            <textarea 
              rows={8}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              value={formData.sampleSolution}
              onChange={e => setFormData({...formData, sampleSolution: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Problem'}
          </button>
        </div>
      </form>
    </div>
  );
}
