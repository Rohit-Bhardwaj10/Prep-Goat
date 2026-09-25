'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2 } from 'lucide-react';


interface ResourceItem { id: string; slug: string; title: string; }
interface LearningPathItem { id: string; order: number; resource: ResourceItem; }
interface LearningPath { id: string; title: string; description: string; items: LearningPathItem[]; }

const SERVER = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000');

export function CheatsheetPanel() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${SERVER}/api/resources`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPaths(data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="text-left mt-8 pt-6 border-t border-white/10">
        <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-mono flex items-center gap-2 mb-4">
          <BookOpen className="w-3.5 h-3.5 text-[#ff6b35]" />
          Cheatsheets
        </h3>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      </div>
    );
  }

  if (paths.length === 0) return null;

  return (
    <div className="text-left mt-8 pt-6 border-t border-white/10">
      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-mono flex items-center gap-2 mb-4">
        <BookOpen className="w-3.5 h-3.5 text-[#ff6b35]" />
        Cheatsheets
      </h3>

      <div className="space-y-4">
        {paths.map(path => (
          <div key={path.id}>
            <h4 className="text-xs font-semibold text-white/70 mb-2">{path.title}</h4>
            <ul className="space-y-2">
              {path.items.map((item: LearningPathItem) => (
                <li key={item.id}>
                  <Link 
                    href={`/resources/cheatsheets/${item.resource.slug}`}
                    target="_blank"
                    className="group flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 hover:border-[#ff6b35]/50 transition-colors"
                  >
                    <span className="text-xs text-white/80 group-hover:text-white truncate pr-2">
                      {item.resource.title}
                    </span>
                    <BookOpen className="w-3.5 h-3.5 text-white/30 group-hover:text-[#ff6b35] shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
