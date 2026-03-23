import { Link } from 'react-router';
import { useMemoryStats } from '../hooks/useMemoryStats';

function StatBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-semibold text-slate-300">{value}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 px-4 py-4">
      {[3, 2, 2.5].map((w, i) => (
        <div key={i} className="h-3 bg-white/5 rounded animate-pulse" style={{ width: `${w * 25}%` }} />
      ))}
    </div>
  );
}

export default function Sidebar() {
  const { stats, loading, error } = useMemoryStats();

  return (
    <aside className="flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Overview</p>
      </div>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <p className="px-4 py-4 text-xs text-slate-600">Could not load stats</p>
      ) : stats ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Total */}
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Total Memories</p>
          </div>

          {/* By Type */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">By Type</p>
            <StatBar label="Semantic" value={stats.byKind.semantic} total={stats.total} color="bg-indigo-500" />
            <StatBar label="Bubble" value={stats.byKind.bubble} total={stats.total} color="bg-violet-500" />
          </div>

          {/* By Source */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">By Source</p>
            <StatBar label="Text" value={stats.bySource.text} total={stats.total} color="bg-sky-500" />
            <StatBar label="Link" value={stats.bySource.link} total={stats.total} color="bg-emerald-500" />
            <StatBar label="Document" value={stats.bySource.document} total={stats.total} color="bg-amber-500" />
          </div>
        </div>
      ) : null}

      <div className="px-4 py-4 border-t border-white/5 space-y-2 mt-auto">
        <Link to="/"
          className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 rounded-xl py-2.5 transition-all duration-150">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Memory
        </Link>
        <Link to="/manage-memories"
          className="block w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors py-1">
          Manage all →
        </Link>
      </div>
    </aside>
  );
}
