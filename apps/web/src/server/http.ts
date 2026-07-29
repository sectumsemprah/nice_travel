import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function handleJson<T>(fn: () => Promise<T> | T) {
  try {
    const data = await fn();
    return NextResponse.json(data);
  } catch (error) {
    const status = typeof (error as { status?: unknown }).status === 'number' ? (error as { status: number }).status : 500;
    const message =
      error instanceof ZodError
        ? error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
        : error instanceof Error
          ? error.message
          : '未知错误';
    return NextResponse.json({ error: message }, { status });
  }
}

