import ResourcesClient from './ResourcesClient';

export interface ResourceItem {
  id: string;
  slug: string;
  title: string;
}

export interface LearningPathItem {
  id: string;
  order: number;
  resource: ResourceItem;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  items: LearningPathItem[];
}

async function getLearningPaths(): Promise<LearningPath[]> {
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    const res = await fetch(`${SERVER_URL}/api/resources`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch resources');
    const data = await res.json();
    return data;
  } catch {
    return [];
  }
}

export default async function ResourcesPage() {
  const paths = await getLearningPaths();
  return <ResourcesClient paths={paths} />;
}
