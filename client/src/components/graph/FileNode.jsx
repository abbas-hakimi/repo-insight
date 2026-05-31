import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const ROLE_RING = {
  match: 'ring-2 ring-amber-400 ring-offset-2',
  incoming: 'ring-2 ring-violet-400 ring-offset-1',
  outgoing: 'ring-2 ring-teal-400 ring-offset-1',
};

function FileNode({ data, selected }) {
  const colors = data.colors ?? {};
  const highlightRole = data.highlightRole;
  const roleRing = highlightRole ? ROLE_RING[highlightRole] : '';
  const selectedRing = selected && !highlightRole ? 'ring-2 ring-indigo-400 ring-offset-2' : '';

  return (
    <div
      title={data.fullPath}
      className={`rounded-xl border-2 px-4 py-3 shadow-md transition-opacity ${roleRing} ${selectedRing}`}
      style={{
        width: 200,
        minHeight: 64,
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.text,
        opacity: data.dimmed ? 0.15 : 1,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <p className="truncate text-center text-sm font-semibold leading-tight">{data.fileName}</p>
      {highlightRole && (
        <p className="mt-1 text-center text-[10px] font-medium uppercase tracking-wide opacity-80">
          {highlightRole}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
}

export default memo(FileNode);
