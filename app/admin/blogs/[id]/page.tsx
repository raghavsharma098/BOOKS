'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { blogsApi } from '../../../../lib/api';

const TYPE_OPTIONS = [
  { value: 'editorial_review', label: 'Editorial Review' },
  { value: 'book_of_week', label: 'Book of the Week' },
  { value: 'reading_guide', label: 'Reading Guide' },
  { value: 'author_spotlight', label: 'Author Spotlight' },
  { value: 'announcement', label: 'Announcement' },
];

const VISIBILITY_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'featured', label: 'Featured' },
];

const VISIBILITY_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  published: 'bg-green-100 text-green-700',
  featured: 'bg-amber-100 text-amber-700',
};

// ─── Minimal toolbar ─────────────────────────────────────────────────────────
function ToolbarBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-1 text-xs border border-[#210C00]/20 rounded hover:bg-[#FAF6F0] text-[#210C00] transition-colors"
    >
      {label}
    </button>
  );
}

export default function BlogEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id; // 'new' or existing ID
  const isNew = id === 'new';
  const router = useRouter();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    body: '',
    type: 'editorial_review',
    visibility: 'draft',
    tags: '',        // comma-separated
    relatedBook: '',
    relatedAuthor: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  // Load existing blog
  useEffect(() => {
    if (isNew) return;
    blogsApi
      .getBySlug(id)
      .then((r: any) => {
        const b = r.data;
        setForm({
          title: b.title || '',
          excerpt: b.excerpt || '',
          body: b.body || '',
          type: b.type || 'editorial_review',
          visibility: b.visibility || 'draft',
          tags: (b.tags || []).join(', '),
          relatedBook: b.relatedBook?._id || b.relatedBook || '',
          relatedAuthor: b.relatedAuthor?._id || b.relatedAuthor || '',
        });
        if (b.coverImage) setCoverPreview(b.coverImage);
      })
      .catch(() => flash('Could not load post', false))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  // ── Toolbar helpers ──────────────────────────────────────────────────────
  const insertTag = (open: string, close: string) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.body.substring(start, end);
    const newBody =
      form.body.substring(0, start) + open + selected + close + form.body.substring(end);
    setForm((f) => ({ ...f, body: newBody }));
    // Re-focus
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + open.length, start + open.length + selected.length);
    }, 0);
  };

  // ── Cover file ────────────────────────────────────────────────────────────
  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      flash('Title and body are required', false);
      return;
    }
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('excerpt', form.excerpt);
      fd.append('body', form.body);
      fd.append('type', form.type);
      fd.append('visibility', form.visibility);

      // Tags: split on comma, trim, lowercase
      const tagsArr = form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      tagsArr.forEach((t) => fd.append('tags[]', t));

      if (form.relatedBook) fd.append('relatedBook', form.relatedBook);
      if (form.relatedAuthor) fd.append('relatedAuthor', form.relatedAuthor);
      if (coverFile) fd.append('coverImage', coverFile);

      if (isNew) {
        const r: any = await blogsApi.create(fd);
        flash('Post created!');
        router.push(`/admin/blogs/${r.data._id}`);
      } else {
        await blogsApi.update(id, fd);
        flash('Post saved!');
      }
    } catch {
      flash('Failed to save post', false);
    } finally {
      setSaving(false);
    }
  };

  const quickVis = async (vis: 'published' | 'featured' | 'draft') => {
    if (isNew) return flash('Save the post first before changing visibility', false);
    try {
      await blogsApi.setVisibility(id, vis);
      setForm((f) => ({ ...f, visibility: vis }));
      flash(`Post marked as: ${vis}`);
    } catch {
      flash('Failed to update visibility', false);
    }
  };

  if (loading) return <p className="text-sm text-[#210C00]/40 animate-pulse">Loading post…</p>;

  return (
    <form onSubmit={handleSave} className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blogs" className="text-xs text-[#60351B] hover:underline">← Blogs</Link>
          <span className="text-[#210C00]/30">/</span>
          <h1 className="text-xl font-semibold text-[#210C00]">{isNew ? 'New Post' : 'Edit Post'}</h1>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${VISIBILITY_COLORS[form.visibility]}`}>
            {form.visibility}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <button type="button" onClick={() => quickVis('featured')} className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600">Feature</button>
              <button type="button" onClick={() => quickVis('published')} className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700">Publish</button>
              <button type="button" onClick={() => quickVis('draft')} className="text-xs px-3 py-1.5 border border-[#210C00]/20 text-[#210C00] rounded-full hover:bg-[#FAF6F0]">Unpublish</button>
            </>
          )}
          <button type="submit" disabled={saving} className="text-sm px-5 py-2 bg-[#60351B] text-white rounded-full hover:bg-[#4A2518] disabled:opacity-50">
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-2.5 text-sm mb-5 ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* ── Main editor ── */}
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs text-[#210C00]/60 mb-1.5 font-medium">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Post title…"
              className="w-full border border-[#210C00]/20 rounded-xl px-4 py-3 text-[#210C00] text-base font-medium focus:outline-none focus:border-[#60351B] bg-white"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs text-[#210C00]/60 mb-1.5 font-medium">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Short summary (optional)…"
              rows={2}
              className="w-full border border-[#210C00]/20 rounded-xl px-4 py-3 text-sm text-[#210C00] focus:outline-none focus:border-[#60351B] resize-none bg-white"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-[#210C00]/60 font-medium">Body (HTML) *</label>
              <span className="text-[10px] text-[#210C00]/40">
                💡 Install <code>react-quill</code> or <code>@tiptap/react</code> for rich editor
              </span>
            </div>
            {/* Minimal toolbar */}
            <div className="flex flex-wrap gap-1 mb-2 p-2 bg-[#FAF6F0] border border-[#210C00]/10 rounded-t-lg">
              <ToolbarBtn label="B" onClick={() => insertTag('<strong>', '</strong>')} />
              <ToolbarBtn label="I" onClick={() => insertTag('<em>', '</em>')} />
              <ToolbarBtn label="H2" onClick={() => insertTag('<h2>', '</h2>')} />
              <ToolbarBtn label="H3" onClick={() => insertTag('<h3>', '</h3>')} />
              <ToolbarBtn label="P" onClick={() => insertTag('<p>', '</p>')} />
              <ToolbarBtn label="Quote" onClick={() => insertTag('<blockquote>', '</blockquote>')} />
              <ToolbarBtn label="UL" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')} />
              <ToolbarBtn label="Link" onClick={() => insertTag('<a href="">', '</a>')} />
              <ToolbarBtn label="Img" onClick={() => insertTag('<img src="', '" alt="" />')} />
              <ToolbarBtn label="HR" onClick={() => insertTag('<hr />', '')} />
            </div>
            <textarea
              ref={bodyRef}
              required
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Write your post content as HTML…"
              rows={20}
              className="w-full border border-[#210C00]/20 rounded-b-xl px-4 py-3 text-sm text-[#210C00] font-mono focus:outline-none focus:border-[#60351B] resize-y bg-white"
            />
          </div>

          {/* Live preview */}
          {form.body && (
            <details className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
              <summary className="px-4 py-3 cursor-pointer text-xs font-medium text-[#210C00]/60 hover:text-[#210C00]">
                Preview rendered HTML
              </summary>
              <div
                className="px-6 py-4 prose prose-sm max-w-none text-[#210C00]"
                dangerouslySetInnerHTML={{ __html: form.body }}
              />
            </details>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Cover image */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-4">
            <label className="block text-xs text-[#210C00]/60 mb-2 font-medium">Cover Image</label>
            {coverPreview ? (
              <div className="relative mb-2 aspect-video rounded-lg overflow-hidden">
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setCoverFile(null); setCoverPreview(''); }}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full text-xs"
                >✕</button>
              </div>
            ) : (
              <div
                onClick={() => coverInputRef.current?.click()}
                className="aspect-video rounded-lg border-2 border-dashed border-[#210C00]/20 flex items-center justify-center cursor-pointer hover:border-[#60351B] transition-colors mb-2"
              >
                <span className="text-xs text-[#210C00]/40">Click to upload</span>
              </div>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
            <button type="button" onClick={() => coverInputRef.current?.click()} className="w-full text-xs py-1.5 border border-[#210C00]/20 rounded-lg text-[#210C00]/60 hover:bg-[#FAF6F0]">
              {coverPreview ? 'Change image' : 'Upload image'}
            </button>
          </div>

          {/* Type */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-4">
            <label className="block text-xs text-[#210C00]/60 mb-2 font-medium">Post Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm text-[#210C00] focus:outline-none focus:border-[#60351B] bg-white"
            >
              {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Visibility */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-4">
            <label className="block text-xs text-[#210C00]/60 mb-2 font-medium">Visibility</label>
            <div className="space-y-1.5">
              {VISIBILITY_OPTIONS.map((v) => (
                <label key={v.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value={v.value}
                    checked={form.visibility === v.value}
                    onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value }))}
                    className="accent-[#60351B]"
                  />
                  <span className="text-sm text-[#210C00]">{v.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-4">
            <label className="block text-xs text-[#210C00]/60 mb-2 font-medium">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="fiction, romance, guide…"
              className="w-full border border-[#210C00]/20 rounded-lg px-3 py-2 text-sm text-[#210C00] focus:outline-none focus:border-[#60351B]"
            />
            <p className="text-[10px] text-[#210C00]/40 mt-1">Comma-separated</p>
          </div>

          {/* Relations */}
          <div className="bg-white border border-[#210C00]/10 rounded-xl p-4 space-y-3">
            <p className="text-xs text-[#210C00]/60 font-medium">Related Content</p>
            <div>
              <label className="text-[10px] text-[#210C00]/50 block mb-1">Book ID (optional)</label>
              <input
                type="text"
                value={form.relatedBook}
                onChange={(e) => setForm((f) => ({ ...f, relatedBook: e.target.value }))}
                placeholder="MongoDB ObjectId"
                className="w-full border border-[#210C00]/20 rounded-lg px-3 py-1.5 text-xs text-[#210C00] focus:outline-none focus:border-[#60351B]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#210C00]/50 block mb-1">Author ID (optional)</label>
              <input
                type="text"
                value={form.relatedAuthor}
                onChange={(e) => setForm((f) => ({ ...f, relatedAuthor: e.target.value }))}
                placeholder="MongoDB ObjectId"
                className="w-full border border-[#210C00]/20 rounded-lg px-3 py-1.5 text-xs text-[#210C00] focus:outline-none focus:border-[#60351B]"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
