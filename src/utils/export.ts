import type { Project, Segment, TimelineJSON } from '@/types';

export function exportToJSON(project: Project, segments: Segment[]): void {
  const data: TimelineJSON = {
    project: {
      id: project.id,
      title: project.title,
      roles: project.roles,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    segments: segments
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        dialogue: s.dialogue,
        tone: s.tone,
        pauseDuration: s.pauseDuration,
        accompaniment: s.accompaniment,
        note: s.note,
        order: s.order,
      })),
    exportedAt: Date.now(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title}_时间轴.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToHTML(project: Project, segments: Segment[]): void {
  const sorted = [...segments].sort((a, b) => a.order - b.order);
  const dateStr = new Date().toLocaleDateString('zh-CN');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${project.title} - 排练手稿</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans SC', sans-serif; background: #f5f0e8; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-family: 'Noto Serif SC', serif; font-size: 28px; margin-bottom: 8px; color: #1a1a2e; }
  .meta { font-size: 14px; color: #5c3d2e; margin-bottom: 24px; }
  .ornament { height: 4px; background: linear-gradient(90deg, #c0392b 0%, #5c3d2e 50%, #c0392b 100%); margin-bottom: 24px; border-radius: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #1a1a2e; color: #f5f0e8; padding: 10px 12px; text-align: left; font-size: 13px; font-weight: 500; }
  th:first-child { border-radius: 6px 0 0 0; }
  th:last-child { border-radius: 0 6px 0 0; }
  td { padding: 10px 12px; border-bottom: 1px solid #d4c5b0; font-size: 13px; vertical-align: top; }
  tr:nth-child(even) td { background: #ede7d9; }
  .tone { display: inline-block; background: #c0392b; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
  .accomp { color: #5c3d2e; font-style: italic; }
  .pause { color: #c0392b; font-weight: 500; }
  .footer { text-align: center; font-size: 12px; color: #5c3d2e; margin-top: 32px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<h1>${project.title}</h1>
<div class="meta">角色：${project.roles}　|　导出日期：${dateStr}</div>
<div class="ornament"></div>
<table>
<thead>
<tr>
  <th>序号</th>
  <th>起止时间</th>
  <th>台词</th>
  <th>语气</th>
  <th>停顿</th>
  <th>伴奏</th>
  <th>备注</th>
</tr>
</thead>
<tbody>
${sorted
  .map(
    (s, i) => `<tr>
  <td>${i + 1}</td>
  <td>${formatTimePrint(s.startTime)} - ${formatTimePrint(s.endTime)}</td>
  <td>${s.dialogue.replace(/\n/g, '<br>')}</td>
  <td>${s.tone ? `<span class="tone">${s.tone}</span>` : ''}</td>
  <td>${s.pauseDuration > 0 ? `<span class="pause">${s.pauseDuration}s</span>` : ''}</td>
  <td>${s.accompaniment ? `<span class="accomp">${s.accompaniment}</span>` : ''}</td>
  <td>${s.note}</td>
</tr>`
  )
  .join('\n')}
</tbody>
</table>
<div class="footer">评弹开场白编排工具 · 排练手稿</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title}_排练手稿.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatTimePrint(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
