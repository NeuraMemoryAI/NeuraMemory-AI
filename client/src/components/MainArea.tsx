import { useState, useRef } from 'react';
import { AxiosError } from 'axios';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

type Tab = 'text' | 'link' | 'document';

const ACCEPTED_TYPES = '.pdf,.docx,.txt,.md';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'text',
    label: 'Text',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h10M4 14h16M4 18h10" />
      </svg>
    ),
  },
  {
    id: 'link',
    label: 'Link',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5M10.172 13.828a4 4 0 015.656 0l3-3a4 4 0 10-5.656-5.656l-1.5 1.5" />
      </svg>
    ),
  },
  {
    id: 'document',
    label: 'Document',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M5 8h14M7 4h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    ),
  },
];

const MainArea = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = (new FormData(e.currentTarget).get('text') as string).trim();
    if (!text) return;
    setLoading(true);
    try {
      await api.post('/api/v1/memories/text', { text });
      showToast('success', 'Memory saved.');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      showToast('error', err instanceof AxiosError ? (err.response?.data?.message ?? 'Failed to save.') : 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = (new FormData(e.currentTarget).get('url') as string).trim();
    if (!url) return;
    setLoading(true);
    try {
      await api.post('/api/v1/memories/link', { url });
      showToast('success', 'Link saved to memory.');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      showToast('error', err instanceof AxiosError ? (err.response?.data?.message ?? 'Failed to process link.') : 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) { showToast('error', 'Please select a file.'); return; }
    setLoading(true);
    const form = new FormData();
    form.append('file', selectedFile);
    try {
      await api.post('/api/v1/memories/document', form);
      showToast('success', `"${selectedFile.name}" saved to memory.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      showToast('error', err instanceof AxiosError ? (err.response?.data?.message ?? 'Failed to upload.') : 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full px-4 py-6">
      <div className="w-full max-w-xl flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Add to Memory</h1>
          <p className="text-xs text-slate-500 mt-1">Save text, links, or documents — key insights are extracted automatically.</p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,17,23,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex border-b border-white/5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveTab(tab.id); setSelectedFile(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-none
                  ${activeTab === tab.id
                    ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/3'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'text' && (
              <form onSubmit={handleTextSubmit} className="flex flex-col gap-4">
                <textarea
                  name="text" rows={7} required
                  placeholder="Paste an article, note, meeting summary, research snippet…"
                  className="w-full bg-white/4 border border-white/7 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/4 resize-none transition-all duration-200"
                />
                <SaveButton loading={loading} label="Save to Memory" />
              </form>
            )}

            {activeTab === 'link' && (
              <form onSubmit={handleLinkSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 bg-white/4 border border-white/7 rounded-xl px-4 py-3 focus-within:border-indigo-500/50 focus-within:bg-indigo-500/4 transition-all duration-200">
                  <svg width="14" height="14" className="text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5M10.172 13.828a4 4 0 015.656 0l3-3a4 4 0 10-5.656-5.656l-1.5 1.5" />
                  </svg>
                  <input
                    name="url" type="url" required
                    placeholder="https://example.com/article"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
                  />
                </div>
                <p className="text-xs text-slate-600 -mt-2">The page will be fetched and its insights extracted.</p>
                <SaveButton loading={loading} label="Fetch & Save" />
              </form>
            )}

            {activeTab === 'document' && (
              <form onSubmit={handleDocumentSubmit} className="flex flex-col gap-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); setSelectedFile(e.dataTransfer.files[0] ?? null); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-10 cursor-pointer transition-all duration-200
                    ${dragOver ? 'border-indigo-500/60 bg-indigo-500/8' : 'border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/4'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${dragOver ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                    <svg width="20" height="20" className={dragOver ? 'text-indigo-400' : 'text-slate-500'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-300">
                      {selectedFile ? selectedFile.name : 'Drop file or click to browse'}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">PDF, DOCX, TXT, MD — max 10 MB</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} className="sr-only"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between bg-white/4 border border-white/7 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg width="13" height="13" className="text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M5 8h14M7 4h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
                      </svg>
                      <span className="text-xs text-slate-300 truncate">{selectedFile.name}</span>
                    </div>
                    <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-slate-500 hover:text-red-400 transition ml-3 shrink-0 cursor-pointer">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <SaveButton loading={loading} label="Upload & Save" />
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-700">
          Memories are private and tied to your account.
        </p>
      </div>
    </div>
  );
};

function SaveButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit" disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/15 cursor-pointer"
    >
      {loading ? (
        <>
          <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Processing…
        </>
      ) : label}
    </button>
  );
}

export default MainArea;
