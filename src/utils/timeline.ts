import type { Segment } from '@/types';

export function findOverlappingSegments(segments: Segment[]): string[] {
  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);
  const overlappingIds = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[i].endTime > sorted[j].startTime) {
        overlappingIds.add(sorted[i].id);
        overlappingIds.add(sorted[j].id);
      } else {
        break;
      }
    }
  }

  return Array.from(overlappingIds);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

export function parseTimeInput(value: string): number {
  const parts = value.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return mins * 60 + secs;
  }
  return parseFloat(value) || 0;
}

export function getTotalDuration(segments: Segment[]): number {
  if (segments.length === 0) return 0;
  const sorted = [...segments].sort((a, b) => a.endTime - b.endTime);
  return sorted[sorted.length - 1].endTime;
}
