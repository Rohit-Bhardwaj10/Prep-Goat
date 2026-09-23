import ProblemsClient from './ProblemsClient';

interface Problem {
  id: string;
  title: string;
  description: string;
  type?: string;
  difficulty?: string;
  tags?: string[];
  requirements?: string[];
  constraints?: string[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function getProblems(searchParams: { [key: string]: string | string[] | undefined }): Promise<{ problems: Problem[], pagination: Pagination }> {
  try {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    
    // Construct query string
    const query = new URLSearchParams();
    if (searchParams.page) query.set('page', searchParams.page as string);
    if (searchParams.limit) query.set('limit', searchParams.limit as string);
    if (searchParams.search) query.set('search', searchParams.search as string);
    if (searchParams.difficulty) query.set('difficulty', searchParams.difficulty as string);
    if (searchParams.type) query.set('type', searchParams.type as string);

    const qs = query.toString();
    const url = `${SERVER_URL}/api/problems${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    return { problems: data.problems, pagination: data.pagination };
  } catch {
    return { problems: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  }
}

export default async function ProblemsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const { problems, pagination } = await getProblems(searchParams);
  return <ProblemsClient problems={problems} initialPagination={pagination} />;
}
