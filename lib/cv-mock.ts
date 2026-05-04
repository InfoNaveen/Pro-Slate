import type { CVMetadata } from '@/types';

interface CVResult {
  cv_score: number;
  cv_verdict: 'PASS' | 'REVIEW';
  cv_metadata: CVMetadata;
}

const STAGE_CONFIG: Record<number, {
  min: number;
  max: number;
  threshold: number;
  objects: string[];
}> = {
  1: {
    min: 65, max: 95, threshold: 65,
    objects: ['material_bags', 'worker_present', 'site_cleared', 'measuring_tape'],
  },
  2: {
    min: 68, max: 96, threshold: 70,
    objects: ['leveled_surface', 'waterproof_membrane', 'adhesive_layer', 'spirit_level'],
  },
  3: {
    min: 70, max: 97, threshold: 75,
    objects: ['tile_grid_detected', 'grout_lines_uniform', 'alignment_score_high', 'pattern_consistent'],
  },
  4: {
    min: 72, max: 98, threshold: 68,
    objects: ['clean_site', 'polished_surface', 'no_debris', 'edge_finishing_complete'],
  },
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function runMockCV(stage: number): CVResult {
  const config = STAGE_CONFIG[stage] ?? STAGE_CONFIG[1];
  const cv_score = randomBetween(config.min, config.max);
  const cv_verdict = cv_score >= config.threshold ? 'PASS' : 'REVIEW';

  const metadata: CVMetadata = {
    detected_objects: config.objects,
    threshold: config.threshold,
    stage,
  };

  if (stage === 3) {
    metadata.alignment_score = randomBetween(80, 99);
  }

  return { cv_score, cv_verdict, cv_metadata: metadata };
}
