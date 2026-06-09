import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileJson, Printer } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { exportToJSON, exportToHTML } from '@/utils/export';

export default function Export() {
  const { id: projectId } = useParams<{ id: string }>();
  const projects = useProjectStore((s) => s.projects);
  const segments = useProjectStore((s) => s.segments);

  const project = projects.find((p) => p.id === projectId);
  const projectSegments = useMemo(
    () =>
      segments
        .filter((s) => s.projectId === projectId)
        .sort((a, b) => a.order - b.order),
    [segments, projectId]
  );

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-sandalwood py-20">
        项目未找到
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-serif text-2xl font-bold text-ink mb-2">导出</h1>
      <p className="text-sandalwood text-sm mb-8">
        选择导出格式，将「{project.title}」的编排数据保存到本地
      </p>

      <div className="grid grid-cols-2 gap-6">
        <div className="card-base card-hover flex flex-col items-center p-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ink/5">
            <FileJson className="h-8 w-8 text-ink" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-ink mb-2">
            JSON 导出
          </h2>
          <p className="text-sm text-sandalwood mb-6 leading-relaxed">
            导出包含全部标记字段的时间轴 JSON 文件
          </p>
          <button
            className="btn-secondary inline-flex items-center gap-2"
            onClick={() => exportToJSON(project, projectSegments)}
          >
            <Download className="h-4 w-4" />
            导出 JSON
          </button>
        </div>

        <div className="card-base card-hover flex flex-col items-center p-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-vermilion/5">
            <Printer className="h-8 w-8 text-vermilion" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-ink mb-2">
            HTML 手稿
          </h2>
          <p className="text-sm text-sandalwood mb-6 leading-relaxed">
            导出可打印的排练手稿 HTML 文件
          </p>
          <button
            className="btn-primary inline-flex items-center gap-2"
            onClick={() => exportToHTML(project, projectSegments)}
          >
            <Printer className="h-4 w-4" />
            导出 HTML 手稿
          </button>
        </div>
      </div>
    </div>
  );
}
