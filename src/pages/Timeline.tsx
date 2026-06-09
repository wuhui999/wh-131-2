import { useMemo, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, AlertTriangle, Clock, GripVertical } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { findOverlappingSegments, formatTime, getTotalDuration, getOrderedProjectSegments } from '@/utils/timeline';
import { cn } from '@/lib/utils';

export default function Timeline() {
  const { id: projectId } = useParams<{ id: string }>();

  const segments = useProjectStore((s) => s.segments);
  const addSegment = useProjectStore((s) => s.addSegment);
  const deleteSegment = useProjectStore((s) => s.deleteSegment);
  const updateSegment = useProjectStore((s) => s.updateSegment);
  const reorderSegments = useProjectStore((s) => s.reorderSegments);

  const projectSegments = useMemo(
    () => getOrderedProjectSegments(segments, projectId),
    [segments, projectId]
  );

  const overlappingIds = useMemo(
    () => findOverlappingSegments(projectSegments),
    [projectSegments]
  );
  const totalDuration = getTotalDuration(projectSegments);
  const hasOverlap = overlappingIds.length > 0;

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragNodeRef.current = e.currentTarget;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    requestAnimationFrame(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = '0.4';
      }
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = '1';
    }
    dragNodeRef.current = null;

    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex && projectId) {
      const reordered = [...projectSegments];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(overIndex, 0, moved);
      reorderSegments(projectId, reordered.map((s) => s.id));
    }

    setDragIndex(null);
    setOverIndex(null);
  }, [dragIndex, overIndex, projectId, projectSegments, reorderSegments]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) {
      setOverIndex(index);
    }
  }, [overIndex]);

  const handleDragLeave = useCallback(() => {
    setOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className="min-h-screen bg-parchment pb-12">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif font-bold text-ink">时间线编辑</h1>
          <div className="flex items-center gap-2 text-sandalwood">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">总时长 {formatTime(totalDuration)}</span>
          </div>
        </div>

        {hasOverlap && (
          <div className="mb-6 flex items-center gap-3 bg-vermilion/10 border border-vermilion/30 rounded-lg px-4 py-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-vermilion shrink-0" />
            <p className="text-sm text-vermilion font-medium">
              存在时间重叠的片段，请调整开始/结束时间以消除冲突
            </p>
          </div>
        )}

        {projectSegments.length === 0 ? (
          <div className="text-center py-16 text-sandalwood/60">
            <p className="text-lg mb-2">暂无片段</p>
            <p className="text-sm">点击下方按钮添加第一个片段</p>
          </div>
        ) : (
          <div className="relative pl-12">
            <div className="timeline-line" />

            {projectSegments.map((segment, index) => {
              const isOverlapping = overlappingIds.includes(segment.id);
              const isLast = index === projectSegments.length - 1;
              const isDragging = dragIndex === index;
              const isDragOver = overIndex === index && dragIndex !== index;

              return (
                <div key={segment.id} className="relative mb-6">
                  <div className={cn('timeline-dot', isLast && 'bg-sandalwood')} style={{ top: '24px' }} />

                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      'card-base p-4 cursor-grab active:cursor-grabbing transition-all duration-150',
                      isOverlapping && 'animate-pulse-border border-vermilion',
                      isDragging && 'opacity-40 scale-[0.98]',
                      isDragOver && 'border-t-2 border-t-vermilion shadow-md -translate-y-1'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-sandalwood/30" />
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ink text-parchment-light text-xs font-bold">
                          {segment.order + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteSegment(segment.id)}
                        className="btn-ghost p-1.5 text-sandalwood/60 hover:text-vermilion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <label className="block text-xs text-sandalwood/70 mb-1">开始时间 (秒)</label>
                        <input
                          type="number"
                          step={0.5}
                          min={0}
                          value={segment.startTime}
                          onChange={(e) =>
                            updateSegment(segment.id, { startTime: parseFloat(e.target.value) || 0 })
                          }
                          className={cn(
                            'input-base w-full',
                            isOverlapping && 'border-vermilion/50 focus:border-vermilion focus:ring-vermilion/30'
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-sandalwood/70 mb-1">结束时间 (秒)</label>
                        <input
                          type="number"
                          step={0.5}
                          min={0}
                          value={segment.endTime}
                          onChange={(e) =>
                            updateSegment(segment.id, { endTime: parseFloat(e.target.value) || 0 })
                          }
                          className={cn(
                            'input-base w-full',
                            isOverlapping && 'border-vermilion/50 focus:border-vermilion focus:ring-vermilion/30'
                          )}
                        />
                      </div>
                      <div className="text-xs text-sandalwood/50 pt-5 whitespace-nowrap">
                        {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                      </div>
                    </div>

                    <textarea
                      value={segment.dialogue}
                      onChange={(e) => updateSegment(segment.id, { dialogue: e.target.value })}
                      placeholder="输入台词内容..."
                      rows={3}
                      className="input-base w-full resize-y"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {projectId && (
          <div className="pl-12">
            <button
              onClick={() => addSegment(projectId)}
              className="w-full border-2 border-dashed border-sandalwood/30 rounded-lg py-4
                         flex items-center justify-center gap-2 text-sandalwood/60
                         hover:border-vermilion/50 hover:text-vermilion
                         transition-colors duration-150"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">添加片段</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
