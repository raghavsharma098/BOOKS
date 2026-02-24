'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminBooksApi } from '../../../../lib/api';

const GENRES_SUGGESTIONS = [
  'Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery',
  'Thriller', 'Romance', 'Historical Fiction', 'Biography', 'Self-Help',
  'Horror', 'Literary Fiction', 'Young Adult', 'Children\'s', 'Graphic Novel',
];

const MOOD_TAGS_SUGGESTIONS = [
  'Adventurous', 'Uplifting', 'Dark', 'Thought-provoking', 'Funny',
  'Romantic', 'Nostalgic', 'Inspiring', 'Suspenseful', 'Melancholic',
];

const FORMATS = ['Paperback', 'Hardcover', 'eBook', 'Audiobook', 'Audio CD', 'Board Book'];

const READING_PACE_OPTIONS = ['slow', 'medium', 'fast'];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Arabic', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Hindi', 'Other',
];

type Form = {
  title: string;
  authorName: string;
  subtitle: string;
  description: string;
  isbn: string;
  language: string;
  pageCount: string;
  publicationDate: string;
  publisher: string;
  format: string;
  editors: string;
  buyLink: string;
  genres: string[];
  moodTags: string[];
  readingPace: string;
  contentWarnings: string;
  editorialBadge: string;
  coverUrl: string;
};

const initial: Form = {
  title: '', authorName: '', subtitle: '', description: '',
  isbn: '', language: 'English', pageCount: '', publicationDate: '',
  publisher: '', format: 'Paperback', editors: '', buyLink: '',
  genres: [], moodTags: [], readingPace: 'medium',
  contentWarnings: '', editorialBadge: '', coverUrl: '',
};

function TagPicker({
  label, suggestions, selected, onChange,
}: {
  label: string;
  suggestions: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(tag: string) {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  }
  return (
    <div>
      <label className="block text-xs font-medium text-[#210C00]/60 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selected.includes(tag)
                ? 'bg-[#60351B] text-white'
                : 'bg-[#FAF6F0] border border-[#210C00]/15 text-[#210C00]/60 hover:border-[#60351B]/40'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      {/* Custom tag input */}
      <input
        type="text"
        placeholder="Type and press Enter to add custom tags…"
        className="mt-2 w-full h-8 px-3 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-xs placeholder:text-[#210C00]/30 focus:outline-none focus:border-[#60351B]"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const val = (e.target as HTMLInputElement).value.trim();
            if (val && !selected.includes(val)) {
              onChange([...selected, val]);
              (e.target as HTMLInputElement).value = '';
            }
          }
        }}
      />
    </div>
  );
}

export default function AdminBookNewPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof Form, value: any) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); set('coverUrl', ''); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.authorName.trim()) { setError('Author name is required.'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      const textFields: (keyof Form)[] = [
        'title', 'authorName', 'subtitle', 'description', 'isbn', 'language',
        'pageCount', 'publicationDate', 'publisher', 'format', 'buyLink',
        'readingPace', 'contentWarnings', 'editorialBadge', 'coverUrl',
      ];
      textFields.forEach((f) => { if (form[f]) fd.append(f, String(form[f])); });
      if (form.editors.trim()) {
        fd.append('editors', JSON.stringify(form.editors.split(',').map((e) => e.trim()).filter(Boolean)));
      }
      if (form.genres.length) fd.append('genres', JSON.stringify(form.genres));
      if (form.moodTags.length) fd.append('moodTags', JSON.stringify(form.moodTags));
      if (file) fd.append('coverImage', file);

      await adminBooksApi.create(fd);
      router.push('/admin/books?tab=approved');
    } catch (err: any) {
      setError(err.message || 'Failed to create book.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full h-9 px-3 rounded-lg bg-white border border-[#210C00]/10 text-sm placeholder:text-[#210C00]/30 focus:outline-none focus:border-[#60351B]';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#60351B] mb-1">
            <Link href="/admin/books" className="hover:underline">← Books</Link>
            <span className="text-[#210C00]/20">/</span>
            <span className="text-[#210C00]/50">New Book</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#210C00]">Create New Book</h1>
          <p className="text-sm text-[#210C00]/50 mt-0.5">
            Creates a fully approved book immediately — no review step required.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Cover column ── */}
        <div className="space-y-4">
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-semibold text-[#210C00]/50 uppercase tracking-wide">Cover Image</h2>
            <div className="flex justify-center">
              {preview || form.coverUrl ? (
                <img src={preview || form.coverUrl} alt="Cover" className="w-32 h-44 object-cover rounded-lg shadow" />
              ) : (
                <div className="w-32 h-44 bg-[#F0EBE3] rounded-lg flex items-center justify-center text-4xl">📚</div>
              )}
            </div>
            <label className="flex items-center justify-center gap-2 cursor-pointer w-full h-9 rounded-lg bg-[#FAF6F0] border border-[#210C00]/10 text-xs text-[#60351B] hover:bg-[#F0EBE3] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload cover
              <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
            </label>
            <input
              type="url"
              value={form.coverUrl}
              onChange={(e) => { set('coverUrl', e.target.value); setFile(null); setPreview(null); }}
              placeholder="Or paste cover URL"
              disabled={!!file}
              className={`${inputCls} disabled:opacity-50`}
            />
          </div>

          {/* Reading pace + editorial badge */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-4 space-y-3">
            <h2 className="text-xs font-semibold text-[#210C00]/50 uppercase tracking-wide">Catalogue Metadata</h2>
            <div>
              <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Reading Pace</label>
              <select
                value={form.readingPace}
                onChange={(e) => set('readingPace', e.target.value)}
                className={inputCls}
              >
                {READING_PACE_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Editorial Badge</label>
              <select
                value={form.editorialBadge}
                onChange={(e) => set('editorialBadge', e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                <option value="pick">Pick</option>
                <option value="recommended">Recommended</option>
                <option value="featured">Featured</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Content Warnings</label>
              <input
                type="text"
                value={form.contentWarnings}
                onChange={(e) => set('contentWarnings', e.target.value)}
                placeholder="e.g. Violence, Adult themes…"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* ── Main fields ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Core info */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-[#210C00]/50 uppercase tracking-wide">Core Information</h2>
            <div>
              <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Title <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Book title" required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Subtitle</label>
              <input type="text" value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="Optional subtitle" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Author Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.authorName} onChange={(e) => set('authorName', e.target.value)} placeholder="Author full name" required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Book synopsis or description…"
                rows={5}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#210C00]/10 text-sm placeholder:text-[#210C00]/30 focus:outline-none focus:border-[#60351B] resize-none"
              />
            </div>
          </div>

          {/* Publication details */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-[#210C00]/50 uppercase tracking-wide">Publication Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#210C00]/60 mb-1">ISBN</label>
                <input type="text" value={form.isbn} onChange={(e) => set('isbn', e.target.value)} placeholder="978-0-00-000000-0" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Language</label>
                <select value={form.language} onChange={(e) => set('language', e.target.value)} className={inputCls}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Page Count</label>
                <input type="number" min={1} value={form.pageCount} onChange={(e) => set('pageCount', e.target.value)} placeholder="e.g. 320" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Publication Date</label>
                <input type="date" value={form.publicationDate} onChange={(e) => set('publicationDate', e.target.value)} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Publisher</label>
                <input type="text" value={form.publisher} onChange={(e) => set('publisher', e.target.value)} placeholder="Publisher name" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Format</label>
                <select value={form.format} onChange={(e) => set('format', e.target.value)} className={inputCls}>
                  {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Buy Link</label>
                <input type="url" value={form.buyLink} onChange={(e) => set('buyLink', e.target.value)} placeholder="https://..." className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#210C00]/60 mb-1">Editors (comma-separated)</label>
                <input type="text" value={form.editors} onChange={(e) => set('editors', e.target.value)} placeholder="Editor A, Editor B" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Genres + Mood tags */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-5 space-y-5">
            <h2 className="text-xs font-semibold text-[#210C00]/50 uppercase tracking-wide">Classification</h2>
            <TagPicker
              label="Genres"
              suggestions={GENRES_SUGGESTIONS}
              selected={form.genres}
              onChange={(v) => set('genres', v)}
            />
            <TagPicker
              label="Mood Tags"
              suggestions={MOOD_TAGS_SUGGESTIONS}
              selected={form.moodTags}
              onChange={(v) => set('moodTags', v)}
            />
          </div>
        </div>
      </div>

      {/* Sticky submit bar */}
      <div className="sticky bottom-0 bg-[#FAF6F0] border-t border-[#210C00]/10 -mx-6 px-6 py-4 -mb-6 flex items-center justify-between gap-4">
        <Link href="/admin/books" className="text-sm text-[#60351B] hover:underline">Cancel</Link>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-[#60351B] text-white text-sm font-medium rounded-lg hover:bg-[#4A2814] disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Creating…
            </>
          ) : 'Create Book (Live Immediately)'}
        </button>
      </div>
    </form>
  );
}
