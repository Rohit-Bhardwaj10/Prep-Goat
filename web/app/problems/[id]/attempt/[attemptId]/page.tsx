import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Editor } from './Editor';
import { HLDEditor } from './HLDEditor';

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

  // Sanity: ensure the attempt belongs to the problem in the URL
  if (data.attempt.problem.id !== problemId) notFound();

  const problem = data.attempt.problem;

  // Route to HLD editor for HLD problems, LLD editor for everything else
  if (problem.type === 'HLD') {
    return (
      <HLDEditor
        attemptId={attemptId}
        problemId={problemId}
        problem={problem}
      />
    );
  }

  return (
    <Editor
      attemptId={attemptId}
      problemId={problemId}
      problem={problem}
    />
  );
}
