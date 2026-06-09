export type ToneType = '激昂' | '舒缓' | '哀婉' | '欢快' | '沉稳' | '俏皮' | '';

export type AccompanimentType = '三弦' | '琵琶' | '过门' | '静场' | '';

export interface Project {
  id: string;
  title: string;
  roles: string;
  createdAt: number;
  updatedAt: number;
}

export interface Segment {
  id: string;
  projectId: string;
  startTime: number;
  endTime: number;
  dialogue: string;
  tone: ToneType;
  pauseDuration: number;
  accompaniment: AccompanimentType;
  note: string;
  order: number;
}

export interface TimelineJSON {
  project: {
    id: string;
    title: string;
    roles: string;
    createdAt: number;
    updatedAt: number;
  };
  segments: Array<{
    id: string;
    startTime: number;
    endTime: number;
    dialogue: string;
    tone: ToneType;
    pauseDuration: number;
    accompaniment: AccompanimentType;
    note: string;
    order: number;
  }>;
  exportedAt: number;
}

export const TONE_OPTIONS: ToneType[] = ['激昂', '舒缓', '哀婉', '欢快', '沉稳', '俏皮'];

export const ACCOMPANIMENT_OPTIONS: AccompanimentType[] = ['三弦', '琵琶', '过门', '静场'];

export const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5] as const;
