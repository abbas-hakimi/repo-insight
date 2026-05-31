import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const COLLAPSED_WIDTH = 240;
const COLLAPSED_HEIGHT = 52;

function FolderClusterNode({ data, selected }) {
  const collapsed = Boolean(data.collapsed);
  const width = collapsed ? COLLAPSED_WIDTH : (data.expandedWidth ?? 280);
  const height = collapsed ? COLLAPSED_HEIGHT : (data.expandedHeight ?? 200);

  return (
    <div
      className={`rounded-2xl border-2 border-dashed transition-colors ${
        selected ? 'border-indigo-400 bg-indigo-50/40' : 'border-slate-300 bg-slate-50/60'
      }`}
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          data.onToggle?.();
        }}
        className="flex w-full items-center gap-2 rounded-t-2xl border-b border-slate-200/80 bg-white/90 px-3 py-2 text-left hover:bg-slate-50"
        title={data.fullPath}
      >
        <span className="text-slate-500" aria-hidden>
          {collapsed ? '▶' : '▼'}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
          {data.label}
        </span>
        <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
          {data.fileCount}
        </span>
      </button>
      {!collapsed && (
        <p className="truncate px-3 py-1 text-[10px] text-slate-500" title={data.fullPath}>
          {data.fullPath}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
}

export default memo(FolderClusterNode);
