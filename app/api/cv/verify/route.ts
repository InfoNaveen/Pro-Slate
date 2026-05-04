import { NextRequest, NextResponse } from 'next/server';
import { runMockCV } from '@/lib/cv-mock';
import { z } from 'zod';

const schema = z.object({ stage: z.number().int().min(1).max(4) });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stage } = schema.parse(body);
    const result = runMockCV(stage);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
