import type { SPEInput, SPEOutput, SurfaceType, SurfaceCondition, Complexity } from '@/types';

const BASE_RATES: Record<SurfaceType, number> = {
  tile_ceramic: 55,
  tile_gvt: 85,
  tile_vitrified: 120,
  marble: 180,
  granite: 160,
  epoxy_flooring: 200,
  waterproofing_membrane: 90,
  stone_natural: 220,
};

const SURFACE_CONDITION_ADDER: Record<SurfaceCondition, number> = {
  flat: 0,
  uneven: 25,
  debris: 45,
  damaged: 70,
};

const COMPLEXITY_ADDER: Record<Complexity, number> = {
  simple: 15,
  moderate: 35,
  complex: 60,
};

const PILLAR_COST = 1200;
const MITRE_COST = 1800;
const EPOXY_GROUTING_RATE = 40;

function getTimeEstimate(area: number): string {
  if (area < 300) return '2-3 days';
  if (area < 800) return '4-6 days';
  if (area < 1500) return '7-10 days';
  return '12-18 days';
}

function getRecommendedSpecializations(input: SPEInput): string[] {
  const specs: string[] = [];
  const { surface_type, area_sqft, has_mitre_cuts } = input;

  if (['marble', 'granite', 'stone_natural'].includes(surface_type)) {
    specs.push('marble_installation', 'stone_polishing');
  } else if (surface_type === 'epoxy_flooring') {
    specs.push('epoxy_grouting');
  } else if (surface_type === 'waterproofing_membrane') {
    specs.push('waterproofing', 'bathroom_waterproofing');
  } else {
    specs.push('tile_laying');
  }

  if (area_sqft > 1000) {
    specs.push('large_format_tile');
  }

  if (has_mitre_cuts) {
    specs.push('tile_cutting');
  }

  return Array.from(new Set(specs));
}

export function calculateSPE(input: SPEInput): SPEOutput {
  const { area_sqft, surface_type, surface_condition, complexity, has_pillars, pillar_count, has_mitre_cuts, has_epoxy_grouting } = input;

  const r_base = BASE_RATES[surface_type];
  const s_factor = SURFACE_CONDITION_ADDER[surface_condition];
  const c_factor = COMPLEXITY_ADDER[complexity];

  const base_cost = area_sqft * r_base;
  const surface_cost = area_sqft * s_factor;
  const complexity_cost = area_sqft * c_factor;
  const pillar_cost = has_pillars ? pillar_count * PILLAR_COST : 0;
  const mitre_cost = has_mitre_cuts ? MITRE_COST : 0;
  const epoxy_cost = has_epoxy_grouting ? area_sqft * EPOXY_GROUTING_RATE : 0;

  const total_cost = base_cost + surface_cost + complexity_cost + pillar_cost + mitre_cost + epoxy_cost;
  const time_estimate_days = getTimeEstimate(area_sqft);
  const recommended_specializations = getRecommendedSpecializations(input);

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const breakdown = [
    `Base labor (${area_sqft} sqft × ${fmt(r_base)}/sqft): ${fmt(base_cost)}`,
    s_factor > 0 ? `Surface condition (${surface_condition}): ${fmt(surface_cost)}` : null,
    `Complexity (${complexity}): ${fmt(complexity_cost)}`,
    pillar_cost > 0 ? `Pillar work (${pillar_count} pillars): ${fmt(pillar_cost)}` : null,
    mitre_cost > 0 ? `Mitre cuts: ${fmt(mitre_cost)}` : null,
    epoxy_cost > 0 ? `Epoxy grouting: ${fmt(epoxy_cost)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    base_cost,
    surface_cost,
    complexity_cost,
    pillar_cost,
    mitre_cost,
    epoxy_cost,
    total_cost,
    time_estimate_days,
    breakdown,
    recommended_specializations,
  };
}
