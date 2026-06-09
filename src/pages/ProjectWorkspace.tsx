import { useParams, NavLink, Outlet } from 'react-router-dom';
import { Clock, Edit3, Tag, Play, Download, ArrowLeft, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';

const navItems = [
  { to: 'timeline', label: '时间轴', icon: Clock },
  { to: 'markup', label: '标记', icon: Tag },
  { to: 'preview', label: '预览', icon: Play },
  { to: 'export', label: '导出', icon: Download },
];

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const projects = useProjectStore((s) => s.projects);
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-parchment">
        <p className="text-sandalwood font-serif">项目未找到</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-parchment">
      <aside className="w-56 flex-shrink-0 bg-ink text-parchment-light flex flex-col">
        <div className="ornament-bar" />

        <div className="p-4">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-parchment/50 hover:text-parchment transition-colors mb-4"
          >
            <ArrowLeft className="w-3 h-3" />
            返回项目列表
          </a>

          <div className="flex items-center gap-2 mb-1">
            <Music className="w-4 h-4 text-vermilion" />
            <h2 className="font-serif text-base font-semibold truncate" title={project.title}>
              {project.title}
            </h2>
          </div>

          {project.roles && (
            <p className="text-xs text-parchment/40 truncate" title={project.roles}>
              {project.roles}
            </p>
          )}
        </div>

        <nav className="flex-1 px-2 py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={`/project/${id}/${to}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors mb-0.5',
                  isActive
                    ? 'bg-vermilion text-parchment-light font-medium'
                    : 'text-parchment/60 hover:text-parchment hover:bg-ink/80'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-parchment/10">
          <Edit3 className="w-3 h-3 inline text-parchment/30 mr-1.5" />
          <span className="text-xs text-parchment/30">
            {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
