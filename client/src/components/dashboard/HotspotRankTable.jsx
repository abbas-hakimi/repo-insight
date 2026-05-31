import { getFileName } from '../../utils/filePathDisplay.js';

export default function HotspotRankTable({
  title,
  description,
  rows = [],
  countLabel,
  emptyMessage = 'No dependency data available.',
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>

      {rows.length === 0 ? (
        <p className="px-6 py-8 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-14 px-4 py-3 font-semibold text-slate-600">Rank</th>
                <th className="px-4 py-3 font-semibold text-slate-600">File name</th>
                <th className="w-24 px-4 py-3 text-right font-semibold text-slate-600">
                  {countLabel}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={`${row.rank}-${row.filePath}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-500">{row.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {row.fileName || getFileName(row.filePath)}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-slate-500" title={row.filePath}>
                      {row.filePath}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-indigo-700">
                    {row.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
