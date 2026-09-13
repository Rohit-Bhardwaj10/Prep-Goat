import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export function ResourceForm() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
  });

  useEffect(() => {
    if (isNew) return;
    
    api.get(`/resources/${id}`).then(res => {
      const r = res.data.resource;
      setFormData({
        title: r.title || '',
        slug: r.slug || '',
        content: r.content || '',
      });
      setLoading(false);
    }).catch(() => {
      alert('Failed to load resource');
      navigate('/resources');
    });
  }, [id, isNew, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isNew) {
        await api.post('/resources', formData);
      } else {
        await api.put(`/resources/${id}`, formData);
      }
      navigate('/resources');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{isNew ? 'Create Resource' : 'Edit Resource'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Title</label>
            <input 
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Slug</label>
            <input 
              required
              pattern="^[a-z0-9-]+$"
              title="Only lowercase letters, numbers, and hyphens"
              placeholder="e.g. cap-theorem"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500"
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-zinc-400">Content (Markdown)</label>
            <textarea 
              required
              rows={20}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Resource'}
          </button>
        </div>
      </form>
    </div>
  );
}
