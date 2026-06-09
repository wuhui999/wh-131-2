import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Music2, Pause, MessageSquare } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { TONE_OPTIONS, ACCOMPANIMENT_OPTIONS } from '@/types';
import type { ToneType, AccompanimentType } from '@/types';
import { getOrderedProjectSegments } from '@/utils/timeline';
import { cn } from '@/lib/utils';

export default function Markup() {
  const { id: projectId } = useParams<{ id: string }>();
  const segments = useProjectStore((s) => s.segments);
  const updateSegment = useProjectStore((s) => s.updateSegment);

  const projectSegments = useMemo(
    () => getOrderedProjectSegments(segments, projectId),
    [segments, projectId]
  );

  return (
    <div className="min-h-screen bg-parchment p-6">
      <h1 className="text-2xl font-serif font-bold text-ink mb-6">标记编辑</h1>

      {projectSegments.length === 0 ? (
        <div className="text-center py-20 text-sandalwood/60 text-sm">
          暂无段落数据，请先在时间轴页面添加
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {projectSegments.map((segment) => {
            const segmentDuration = Math.max(segment.endTime - segment.startTime, 0);
            const maxPause = Math.min(10, segmentDuration);
            const pauseExceeds = segment.pauseDuration > maxPause && segmentDuration > 0;

            return (
            <div key={segment.id} className="card-base p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-ink text-parchment-light flex items-center justify-center text-sm font-bold">
                  {segment.order + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink mb-4 truncate" title={segment.dialogue}>
                    {segment.dialogue || '（无台词）'}
                  </p>

                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Music2 size={14} className="text-vermilion" />
                      <span className="text-xs font-medium text-ink">语气</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TONE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          className={cn(
                            'tag-base',
                            segment.tone === option ? 'tag-selected' : 'tag-unselected'
                          )}
                          onClick={() =>
                            updateSegment(segment.id, {
                              tone: segment.tone === option ? ('' as ToneType) : option,
                            })
                          }
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Pause size={14} className="text-vermilion" />
                      <span className="text-xs font-medium text-ink">停顿</span>
                      {pauseExceeds && (
                        <span className="text-[10px] text-vermilion font-medium ml-1">
                          不能超过片段时长 {maxPause.toFixed(1)}s
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={maxPause}
                        step={0.5}
                        value={Math.min(segment.pauseDuration, maxPause)}
                        onChange={(e) =>
                          updateSegment(segment.id, {
                            pauseDuration: parseFloat(e.target.value),
                          })
                        }
                        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-vermilion"
                        style={{
                          background: `linear-gradient(to right, #c0392b ${maxPause > 0 ? (Math.min(segment.pauseDuration, maxPause) / maxPause) * 100 : 0}%, #5c3d2e33 ${maxPause > 0 ? (Math.min(segment.pauseDuration, maxPause) / maxPause) * 100 : 0}%)`,
                        }}
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={maxPause}
                          step={0.5}
                          value={segment.pauseDuration}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0 && val <= maxPause) {
                              updateSegment(segment.id, { pauseDuration: val });
                            }
                          }}
                          onBlur={() => {
                            if (segment.pauseDuration > maxPause) {
                              updateSegment(segment.id, { pauseDuration: maxPause });
                            }
                          }}
                          className={cn(
                            'input-base w-14 text-center text-xs px-1 py-1',
                            pauseExceeds && 'border-vermilion/50 focus:border-vermilion focus:ring-vermilion/30'
                          )}
                        />
                        <span className="text-xs text-sandalwood">秒</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-sandalwood/40 mt-1">
                      片段时长：{segmentDuration.toFixed(1)}s
                    </p>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Music2 size={14} className="text-vermilion" />
                      <span className="text-xs font-medium text-ink">伴奏</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ACCOMPANIMENT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          className={cn(
                            'tag-base',
                            segment.accompaniment === option ? 'tag-selected' : 'tag-unselected'
                          )}
                          onClick={() =>
                            updateSegment(segment.id, {
                              accompaniment: segment.accompaniment === option ? ('' as AccompanimentType) : option,
                            })
                          }
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageSquare size={14} className="text-vermilion" />
                      <span className="text-xs font-medium text-ink">备注</span>
                    </div>
                    <input
                      type="text"
                      value={segment.note}
                      onChange={(e) => updateSegment(segment.id, { note: e.target.value })}
                      placeholder="添加备注..."
                      className="input-base w-full text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
