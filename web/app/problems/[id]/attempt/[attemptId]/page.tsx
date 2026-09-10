import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Editor } from './Editor';

interface Problem {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  constraints: string[];
}

// Problem fetching is now done within the attempt endpoint to avoid leaking private fields

async function getAttempt(attemptId: string) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    const res = await fetch(`${SERVER_URL}/api/attempts/${attemptId}`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });
    if (res.status === 404 || res.status === 403) return null;
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function AttemptEditorPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id: problemId, attemptId } = await params;

  const data = await getAttempt(attemptId);

  if (!data || !data.attempt) notFound();
  
  // Ensure the problem ID matches (just a sanity check)
  if (data.attempt.problem.id !== problemId) notFound();

  return (
    <Editor
      attemptId={attemptId}
      problemId={problemId}
      problem={data.attempt.problem}
    />
  );
}
