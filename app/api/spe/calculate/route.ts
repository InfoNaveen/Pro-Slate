import { NextRequest, NextResponse } from 'next/server';
import { calculateSPE } from '@/lib/spe';
import { z } from 'zod';

const schema = z.object({
  area_sqft: z.number().positive(),
  surface_type: z.enum(['tile_ceramic','tile_gvt','tile_vitrified','marble','granite','epoxy_flooring','waterproofing_membrane','stone_natural']),
  surface_condition: z.enum(['flat','uneven','debris','damaged']),
  complexity: z.enum(['simple','moderate','complex']),
  has_pillars: z.boolean().default(false),
  pillar_count: z.number().int().min(0).default(0),
  has_mitre_cuts: z.boolean().default(false),
  has_epoxy_grouting: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = schema.parse(body);
    const result = calculateSPE(input);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
