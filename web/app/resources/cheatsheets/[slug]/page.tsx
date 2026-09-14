import { notFound } from 'next/navigation';
import CheatsheetViewClient from './CheatsheetViewClient';

export interface ResourceDetail {
  id: string;
  slug: string;
  title: string;
  content: string; // Markdown content
  createdAt: string;
}

async function getResource(slug: string): Promise<ResourceDetail | null> {
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    const res = await fetch(`${SERVER_URL}/api/resources/${slug}`, {
      cache: 'no-store',
    });
    
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch resource');
    
    return await res.json();
  } catch {
    return null;
  }
}

export default async function CheatsheetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getResource(slug);
  
  if (!resource) {
    notFound();
  }

  return <CheatsheetViewClient resource={resource} />;
}
