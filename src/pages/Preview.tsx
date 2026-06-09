import { useParams } from 'react-router-dom';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import {
  formatTime,
  getOrderedProjectSegments,
  buildVirtualTimeline,
  getTotalVirtualDuration,
  findActiveSegmentIndex,
} from '@/utils/timeline';
import { SPEED_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

export default function Preview() {
  const { id: projectId } = useParams<{ id: string }>();
  const segments = useProjectStore((s) => s.segments);

  const sortedSegments = useMemo(
    () => getOrderedProjectSegments(segments, projectId),
    [segments, projectId]
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [virtualTime, setVirtualTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rafRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const virtualTimeRef = useRef(0);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const timeline = useMemo(() => buildVirtualTimeline(sortedSegments), [sortedSegments]);
  const totalDuration = getTotalVirtualDuration(timeline);
  const progress = totalDuration > 0 ? Math.min(virtualTime / totalDuration, 1) : 0;

  const stopPlayback = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setIsPlaying(false);
    lastTimestampRef.current = 0;
  }, []);

  const tick = useCallback(
    (timestamp: number) => {
      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp;
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const nextTime = virtualTimeRef.current + delta * speed;

      if (nextTime >= totalDuration) {
        virtualTimeRef.current = totalDuration;
        setVirtualTime(totalDuration);
        setActiveIndex(-1);
        stopPlayback();
        return;
      }

      virtualTimeRef.current = nextTime;
      setVirtualTime(nextTime);
      setActiveIndex(findActiveSegmentIndex(timeline, nextTime));

      rafRef.current = requestAnimationFrame(tick);
    },
    [speed, timeline, totalDuration, stopPlayback]
  );

  const handlePlay = useCallback(() => {
    if (virtualTimeRef.current >= totalDuration) {
      virtualTimeRef.current = 0;
      setVirtualTime(0);
    }
    setIsPlaying(true);
    lastTimestampRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, totalDuration]);

  const handlePause = useCallback(() => {
    stopPlayback();
  }, [stopPlayback]);

  const handleReset = useCallback(() => {
    stopPlayback();
    virtualTimeRef.current = 0;
    setVirtualTime(0);
    setActiveIndex(-1);
  }, [stopPlayback]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeIndex < 0 || !scrollContainerRef.current) return;
    const el = segmentRefs.current[activeIndex];
    if (!el) return;

    const container = scrollContainerRef.current;
    const containerHeight = container.clientHeight;
    const elTop = el.offsetTop;
    const elHeight = el.offsetHeight;
    const scrollTo = elTop - containerHeight / 2 + elHeight / 2;

    container.scrollTo({ top: scrollTo, behavior: 'smooth' });
  }, [activeIndex]);

  const speedIndex = SPEED_OPTIONS.indexOf(speed as typeof SPEED_OPTIONS[number]);
  const clampedSpeedIndex = speedIndex >= 0 ? speedIndex : 2;

  if (sortedSegments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-parchment">
        <p className="text-sandalwood text-lg font-serif">暂无段落数据</p>
        <p className="text-sandalwood/60 text-sm mt-1">请先在时间轴页面添加段落</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-parchment">
      <div className="flex-shrink-0 h-1.5 bg-parchment-dark">
        <div
          className="h-full bg-vermilion transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex-shrink-0 px-6 py-3 bg-parchment-light border-b border-sandalwood/10 flex items-center justify-between">
        <span className="text-sm text-sandalwood font-serif">
          {formatTime(virtualTime)} / {formatTime(totalDuration)}
        </span>
        <span className="text-sm text-sandalwood/60 font-serif">
          评弹开篇预览
        </span>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-4"
      >
        {sortedSegments.map((seg, i) => {
          const isActive = activeIndex === i;
          return (
            <div
              key={seg.id}
              ref={(el) => { segmentRefs.current[i] = el; }}
              className={cn(
                'card-base transition-all duration-300 ease-in-out px-5 py-4',
                isActive
                  ? 'border-l-4 border-l-vermilion scale-[1.02] opacity-100 shadow-md'
                  : 'border-l-4 border-l-transparent opacity-40'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-sandalwood/70 font-medium">
                  第 {i + 1} 段
                </span>
                <span className="text-xs text-sandalwood/50 font-mono">
                  {formatTime(seg.startTime)} — {formatTime(seg.endTime)}
                </span>
              </div>

              <p className="font-serif text-ink leading-relaxed text-lg">
                {seg.dialogue || '（无台词）'}
              </p>

              <div className="flex items-center gap-3 mt-3">
                {seg.tone && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-vermilion/10 text-vermilion font-medium">
                    {seg.tone}
                  </span>
                )}
                {seg.accompaniment && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-sandalwood/10 text-sandalwood font-medium">
                    {seg.accompaniment}
                  </span>
                )}
                {seg.pauseDuration > 0 && (
                  <span className="text-xs text-sandalwood/40">
                    停顿 {seg.pauseDuration.toFixed(1)}s
                  </span>
                )}
              </div>

              {seg.note && (
                <p className="mt-2 text-xs text-sandalwood/50 italic">
                  {seg.note}
                </p>
              )}
            </div>
          );
        })}

        <div className="h-24" />
      </div>

      <div className="flex-shrink-0 bg-parchment-light border-t border-sandalwood/10 px-6 py-3 flex items-center gap-4">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="btn-primary flex items-center gap-2"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? '暂停' : '播放'}
        </button>

        <button onClick={handleReset} className="btn-ghost flex items-center gap-2">
          <RotateCcw size={16} />
          重置
        </button>

        <div className="flex items-center gap-3 ml-auto">
          <Gauge size={16} className="text-sandalwood/60" />

          <input
            type="range"
            min={0}
            max={SPEED_OPTIONS.length - 1}
            step={1}
            value={clampedSpeedIndex}
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              setSpeed(SPEED_OPTIONS[idx]);
            }}
            className="w-24 h-1.5 appearance-none bg-sandalwood/20 rounded-full
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-3.5
                       [&::-webkit-slider-thumb]:h-3.5
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-vermilion
                       [&::-webkit-slider-thumb]:cursor-pointer"
          />

          <span className="text-sm text-sandalwood font-medium w-10 text-right">
            {speed.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
}
