import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FolderOpen, Music, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';

export default function ProjectList() {
  const navigate = useNavigate();
  const { projects, createProject, deleteProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [roles, setRoles] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleCreate = () => {
    if (!title.trim()) return;
    const id = createProject(title.trim(), roles.trim());
    setShowCreateModal(false);
    setTitle('');
    setRoles('');
    navigate(`/project/${id}/timeline`);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setDeleteTarget(null);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseRoles = (rolesStr: string) => {
    if (!rolesStr.trim()) return [];
    return rolesStr.split(/[,，、\s]+/).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-parchment">
      <div className="ornament-bar" />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-ink tracking-wide">
            评弹开场白编排
          </h1>
          <p className="mt-2 text-sm text-sandalwood">
            管理您的评弹开场白创作项目
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-sandalwood/60">
            <FolderOpen className="mb-4 h-16 w-16" strokeWidth={1} />
            <p className="text-lg font-serif">暂无项目</p>
            <p className="mt-1 text-sm">点击右下角按钮创建您的第一个开场白项目</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const roleList = parseRoles(project.roles);
              const isConfirming = deleteTarget === project.id;

              return (
                <div
                  key={project.id}
                  className="card-base card-hover relative flex flex-col p-5 animate-fade-in"
                >
                  <div
                    className="mb-3 flex items-start justify-between cursor-pointer"
                    onClick={() => navigate(`/project/${project.id}/timeline`)}
                  >
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-vermilion flex-shrink-0" />
                      <h3 className="font-serif text-lg font-semibold text-ink truncate">
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  {roleList.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {roleList.map((role) => (
                        <span key={role} className="tag-base tag-selected text-xs">
                          {role}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-sandalwood/10">
                    <div className="flex items-center gap-1.5 text-xs text-sandalwood/60">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(project.createdAt)}</span>
                    </div>

                    {isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id);
                          }}
                          className="rounded px-2 py-1 text-xs text-vermilion hover:bg-vermilion/10 transition-colors"
                        >
                          确认
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(null);
                          }}
                          className="rounded px-2 py-1 text-xs text-sandalwood hover:bg-parchment-dark transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(project.id);
                        }}
                        className="rounded p-1 text-sandalwood/40 hover:text-vermilion hover:bg-vermilion/5 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className={cn(
          'fixed bottom-8 right-8 flex items-center gap-2',
          'btn-primary px-5 py-3 rounded-full shadow-lg',
          'hover:shadow-xl hover:scale-105 active:scale-95',
          'transition-all duration-200'
        )}
      >
        <Plus className="h-5 w-5" />
        <span>新建项目</span>
      </button>

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card-base w-full max-w-md p-6 mx-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif mb-5 text-xl font-semibold text-ink">
              新建项目
            </h2>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-sandalwood">
                项目标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="如：珍珠塔·开场"
                className="input-base w-full"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-sandalwood">
                角色（逗号分隔）
              </label>
              <input
                type="text"
                value={roles}
                onChange={(e) => setRoles(e.target.value)}
                placeholder="如：蒋月泉，张鉴庭"
                className="input-base w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setTitle('');
                  setRoles('');
                }}
                className="btn-ghost"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className={cn('btn-primary', !title.trim() && 'opacity-50 cursor-not-allowed')}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
