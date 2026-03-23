import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { AxiosError } from 'axios';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from './ConfirmModal';

type Memory = {
  id: string;
  text: string;
  kind: string;
  source?: 'text' | 'link' | 'document';
  sourceRef?: string;
  createdAt: string;
};

type KindFilter = '' | 'semantic' | 'bubble';
type SourceFilter = '' | 'text' | 'link' | 'document';

const SOURCE_COLORS: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  text: { dot: 'bg-sky-400', text: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  link: { dot: 'bg-emerald-400', text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  document: { dot: 'bg-violet-400', text: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
};

function SourceBadge({ source }: { source?: string }) {
  if (!source) return null;
  const c = SOURCE_COLORS[source] ?? { dot: 'bg-slate-400', text: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
  return (
    <span data-testid="source-badge" className={`inline-flex items-center gap-1.5 ${c.bg} ${c.border} border rounded-full px-2 py-0.5 text-[10px] font-semibold`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={c.text}>{source.charAt(0).toUpperCase() + source.slice(1)}</span>
    </span>
  );
}

function MemoryCard({
  memory, onDelete, onSaveEdit, expanded, onToggleExpand,
}: {
  memory: Memory;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, newText: string) => Promise<void>;
  expanded: boolean;
  onToggleExpand: (id: string) => void;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(memory.text);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) setOverflows(el.scrollHeight > el.clientHeight);
  }, [memory.text]);

  const handleSave = async () => {
    setSaving(true);
    try { await onSaveEdit(memory.id, editText); setEditing(false); }
    catch { /* error handled upstream */ }
    finally { setSaving(false); }
  };

  return (
    <div className="group rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:border-white/12"
      style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={memory.source} />
          <span className="text-[10px] text-slate-600 uppercase tracking-widest">{memory.kind}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {!editing && (
            <button type="button" onClick={() => { setEditText(memory.text); setEditing(true); }}
              className="text-[11px] font-medium text-slate-400 hover:text-indigo-300 bg-white/4 hover:bg-indigo-500/10 border border-white/6 hover:border-indigo-500/20 rounded-lg px-2.5 py-1 transition-all cursor-pointer">
              Edit
            </button>
          )}
          <button type="button" onClick={() => onDelete(memory.id)}
            className="text-[11px] font-medium text-slate-400 hover:text-red-400 bg-white/4 hover:bg-red-500/10 border border-white/6 hover:border-red-500/20 rounded-lg px-2.5 py-1 transition-all cursor-pointer">
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-indigo-500/50 transition"
            rows={5} value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus
          />
          <div className="flex gap-2">
            <button type="button" disabled={saving} onClick={handleSave}
              className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 disabled:opacity-50 text-indigo-300 text-xs font-semibold rounded-lg px-3 py-1.5 transition cursor-pointer">
              {saving && <svg className="animate-spin" width="11" height="11" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>}
              Save
            </button>
            <button type="button" disabled={saving} onClick={() => setEditing(false)}
              className="bg-white/4 hover:bg-white/7 border border-white/7 disabled:opacity-50 text-slate-400 text-xs font-semibold rounded-lg px-3 py-1.5 transition cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: expanded ? '1000px' : '4.5rem' }}>
            <div ref={textRef} className={`text-sm leading-6 text-slate-300 ${expanded ? '' : 'line-clamp-3'}`}>
              {memory.text}
            </div>
          </div>

          {overflows && (
            <button type="button" onClick={() => onToggleExpand(memory.id)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 self-start transition cursor-pointer">
              {expanded ? 'Show less ↑' : 'Show more ↓'}
            </button>
          )}

          {memory.sourceRef && (
            memory.source === 'link' ? (
              <a href={memory.sourceRef} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-emerald-400 hover:text-emerald-300 truncate block underline underline-offset-2" title={memory.sourceRef}>
                {memory.sourceRef}
              </a>
            ) : (
              <span className="text-[10px] text-violet-400 truncate block" title={memory.sourceRef}>{memory.sourceRef}</span>
            )
          )}

          <p className="text-[10px] text-slate-700 mt-auto">{new Date(memory.createdAt).toLocaleDateString()}</p>
        </>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-xs font-medium rounded-full px-3 py-1 transition-all duration-150 cursor-pointer border
        ${active
          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
          : 'bg-white/4 text-slate-500 border-white/6 hover:bg-white/7 hover:text-slate-300'
        }`}>
      {children}
    </button>
  );
}

const ManageMemories = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [nextOffset, setNextOffset] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [kindFilter, setKindFilter] = useState<KindFilter>('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletingSingle, setDeletingSingle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const buildUrl = useCallback((offset: string | null, kind: KindFilter, source: SourceFilter) => {
    const params = new URLSearchParams();
    params.set('limit', '20');
    if (offset) params.set('offset', offset);
    if (kind) params.set('kind', kind);
    if (source) params.set('source', source);
    return `/api/v1/memories?${params.toString()}`;
  }, []);

  const fetchMemories = useCallback(async (kind: KindFilter, source: SourceFilter) => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ success: boolean; data: Memory[]; nextOffset: string | null; hasMore: boolean }>(buildUrl(null, kind, source));
      setMemories(res.data.data ?? []);
      setNextOffset(res.data.nextOffset ?? null);
      setHasMore(res.data.hasMore ?? false);
    } catch { setError('Failed to load memories.'); }
    finally { setLoading(false); }
  }, [buildUrl]);

  const fetchSearch = useCallback(async (q: string) => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ success: boolean; data: Memory[] }>(`/api/v1/memories/search?q=${encodeURIComponent(q)}`);
      setMemories(res.data.data ?? []);
      setNextOffset(null); setHasMore(false);
    } catch { setError('Search failed.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim()) fetchSearch(debouncedQuery.trim());
    else fetchMemories(kindFilter, sourceFilter);
  }, [debouncedQuery, fetchSearch, fetchMemories, kindFilter, sourceFilter]);

  const handleLoadMore = async () => {
    if (!nextOffset || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await api.get<{ success: boolean; data: Memory[]; nextOffset: string | null; hasMore: boolean }>(buildUrl(nextOffset, kindFilter, sourceFilter));
      setMemories((prev) => [...prev, ...(res.data.data ?? [])]);
      setNextOffset(res.data.nextOffset ?? null);
      setHasMore(res.data.hasMore ?? false);
    } catch { setError('Failed to load more.'); }
    finally { setLoadingMore(false); }
  };

  const handleKindFilter = (value: KindFilter) => { setKindFilter(value); setNextOffset(null); setMemories([]); };
  const handleSourceFilter = (value: SourceFilter) => { setSourceFilter(value); setNextOffset(null); setMemories([]); };

  const handleConfirmSingleDelete = async () => {
    if (!deleteTargetId) return;
    setDeletingSingle(true);
    try {
      await api.delete(`/api/v1/memories/${deleteTargetId}`);
      setMemories((prev) => prev.filter((m) => m.id !== deleteTargetId));
      showToast('success', 'Memory deleted.');
    } catch (err) {
      showToast('error', err instanceof AxiosError ? (err.response?.data?.message ?? 'Failed to delete.') : 'Failed to delete.');
    } finally { setDeletingSingle(false); setDeleteTargetId(null); }
  };

  const handleConfirmDeleteAll = async () => {
    setDeletingAll(true);
    try {
      await api.delete('/api/v1/memories');
      setMemories([]); setNextOffset(null); setHasMore(false);
      showToast('success', 'All memories deleted.');
    } catch (err) {
      showToast('error', err instanceof AxiosError ? (err.response?.data?.message ?? 'Failed to delete all.') : 'Failed to delete all.');
    } finally { setDeletingAll(false); setShowDeleteAllModal(false); }
  };

  const handleSaveEdit = async (id: string, newText: string) => {
    const original = memories.find((m) => m.id === id);
    if (!original) return;
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, text: newText } : m)));
    try {
      await api.patch(`/api/v1/memories/${id}`, { text: newText });
    } catch (err) {
      setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, text: original.text } : m)));
      showToast('error', err instanceof AxiosError ? (err.response?.data?.message ?? 'Failed to update.') : 'Failed to update.');
      throw err;
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const isSearchMode = debouncedQuery.trim() !== '';

  return (
    <main className="relative min-h-full px-4 py-8 sm:px-6 md:px-10 overflow-hidden" style={{ background: '#080b14' }}>
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-600/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-1.5">Memory Workspace</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Manage Memories</h1>
            <p className="text-sm text-slate-500 mt-1">Organize, search, and clean up your saved knowledge.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setShowDeleteAllModal(true)}
              className="text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-xl px-4 py-2 transition cursor-pointer">
              Delete All
            </button>
            <button onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl px-4 py-2 transition cursor-pointer">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Memory
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="rounded-2xl p-4 sm:p-5 flex flex-col gap-4" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text" placeholder="Search memories…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/4 border border-white/7 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition"
            />
          </div>

          {!isSearchMode && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest">Kind</span>
                {(['', 'semantic', 'bubble'] as KindFilter[]).map((val) => (
                  <FilterPill key={val || 'all-kind'} active={kindFilter === val} onClick={() => handleKindFilter(val)}>
                    {val === '' ? 'All' : val.charAt(0).toUpperCase() + val.slice(1)}
                  </FilterPill>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest">Source</span>
                {(['', 'text', 'link', 'document'] as SourceFilter[]).map((val) => (
                  <FilterPill key={val || 'all-source'} active={sourceFilter === val} onClick={() => handleSourceFilter(val)}>
                    {val === '' ? 'All' : val.charAt(0).toUpperCase() + val.slice(1)}
                  </FilterPill>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 h-40 animate-pulse" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="h-3 bg-white/5 rounded w-1/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-4/5 mb-2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && memories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-slate-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">{isSearchMode ? 'No results found.' : 'No memories yet.'}</p>
          </div>
        )}

        {!loading && !error && memories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id} memory={memory}
                onDelete={(id) => setDeleteTargetId(id)}
                onSaveEdit={handleSaveEdit}
                expanded={expandedIds.has(memory.id)}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        )}

        {!isSearchMode && hasMore && (
          <div className="flex justify-center mt-2">
            <button type="button" disabled={loadingMore} onClick={handleLoadMore}
              className="text-sm font-medium text-slate-400 hover:text-white bg-white/4 hover:bg-white/7 border border-white/7 rounded-xl px-6 py-2.5 transition disabled:opacity-50 cursor-pointer">
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={showDeleteAllModal} title="Delete All Memories"
        description="This will permanently delete all your memories. This cannot be undone."
        confirmLabel="Delete All" loading={deletingAll}
        onConfirm={handleConfirmDeleteAll} onCancel={() => setShowDeleteAllModal(false)}
      />
      <ConfirmModal
        open={deleteTargetId !== null} title="Delete Memory"
        description="Delete this memory? This cannot be undone."
        confirmLabel="Delete" loading={deletingSingle}
        onConfirm={handleConfirmSingleDelete} onCancel={() => setDeleteTargetId(null)}
      />
    </main>
  );
};

export default ManageMemories;
