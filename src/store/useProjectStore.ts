import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Segment, ToneType, AccompanimentType } from '@/types';

interface ProjectState {
  projects: Project[];
  segments: Segment[];

  createProject: (title: string, roles: string) => string;
  deleteProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Pick<Project, 'title' | 'roles'>>) => void;

  addSegment: (projectId: string) => string;
  deleteSegment: (id: string) => void;
  updateSegment: (id: string, updates: Partial<Omit<Segment, 'id' | 'projectId'>>) => void;
  reorderSegments: (projectId: string, segmentIds: string[]) => void;
  getProjectSegments: (projectId: string) => Segment[];
}

const generateId = () => crypto.randomUUID();

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      segments: [],

      createProject: (title, roles) => {
        const id = generateId();
        const now = Date.now();
        set((state) => ({
          projects: [
            ...state.projects,
            { id, title, roles, createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          segments: state.segments.filter((s) => s.projectId !== id),
        }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        }));
      },

      addSegment: (projectId) => {
        const id = generateId();
        const projectSegments = get()
          .segments.filter((s) => s.projectId === projectId)
          .sort((a, b) => a.order - b.order);
        const lastSegment = projectSegments[projectSegments.length - 1];
        const startTime = lastSegment ? lastSegment.endTime : 0;
        const endTime = startTime + 5;
        const order = projectSegments.length;

        set((state) => ({
          segments: [
            ...state.segments,
            {
              id,
              projectId,
              startTime,
              endTime,
              dialogue: '',
              tone: '' as ToneType,
              pauseDuration: 0,
              accompaniment: '' as AccompanimentType,
              note: '',
              order,
            },
          ],
        }));

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, updatedAt: Date.now() } : p
          ),
        }));

        return id;
      },

      deleteSegment: (id) => {
        const segment = get().segments.find((s) => s.id === id);
        if (!segment) return;

        set((state) => {
          const remaining = state.segments
            .filter((s) => s.projectId === segment.projectId && s.id !== id)
            .sort((a, b) => a.order - b.order)
            .map((s, i) => ({ ...s, order: i }));

          return {
            segments: [
              ...state.segments.filter((s) => s.projectId !== segment.projectId),
              ...remaining,
            ],
            projects: state.projects.map((p) =>
              p.id === segment.projectId ? { ...p, updatedAt: Date.now() } : p
            ),
          };
        });
      },

      updateSegment: (id, updates) => {
        set((state) => ({
          segments: state.segments.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));

        const segment = get().segments.find((s) => s.id === id);
        if (segment) {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === segment.projectId ? { ...p, updatedAt: Date.now() } : p
            ),
          }));
        }
      },

      reorderSegments: (projectId, segmentIds) => {
        set((state) => ({
          segments: state.segments.map((s) => {
            if (s.projectId !== projectId) return s;
            const newOrder = segmentIds.indexOf(s.id);
            return newOrder >= 0 ? { ...s, order: newOrder } : s;
          }),
        }));
      },

      getProjectSegments: (projectId) => {
        return get()
          .segments.filter((s) => s.projectId === projectId)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'pingtan-projects',
    }
  )
);
