'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { blogsApi, getImageUrl } from '../../../lib/api';

const VISIBILITY_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  published: 'bg-green-100 text-green-700',
  featured: 'bg-amber-100 text-amber-700',
};

const TYPE_LABELS: Record<string, string> = {
  editorial_review: 'Editorial Review',
  book_of_week: 'Book of the Week',
  reading_guide: 'Reading Guide',
  author_spotlight: 'Author Spotlight',
  announcement: 'Announcement',
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [visibility, setVisibility] = useState('');
  const [type, setType] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const fetchBlogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const r: any = await blogsApi.getAll({ page: p, limit: 20, visibility: visibility || undefined, type: type || undefined });
      setBlogs(r.data || []);
      setPages(r.pages || 1);
      setTotal(r.total || 0);
    } catch {
      flash('Failed to load blogs', false);
    } finally {
      setLoading(false);
    }
  }, [visibility, type]);

  useEffect(() => { setPage(1); }, [visibility, type]);
  useEffect(() => { fetchBlogs(page); }, [page, fetchBlogs]);

  const setVis = async (id: string, vis: 'draft' | 'published' | 'featured') => {
    try {
      await blogsApi.setVisibility(id, vis);
      flash(`Post ${vis}`);
      fetchBlogs(page);
    } catch {
      flash('Failed to update visibility', false);
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await blogsApi.delete(id);
      flash('Post deleted');
      fetchBlogs(page);
    } catch {
      flash('Failed to delete', false);
    }
  };

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#210C00]">Blogs & Editorial</h1>
          <p className="text-sm text-[#210C00]/50 mt-0.5">{total} posts</p>
        </div>
        <Link href="/admin/blogs/new" className="bg-[#60351B] text-white text-sm px-4 py-2 rounded-full hover:bg-[#4A2518] transition-colors">
          + New Post
        </Link>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-2.5 text-sm ${msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="border border-[#210C00]/20 rounded-lg px-3 py-1.5 text-sm text-[#210C00] focus:outline-none focus:border-[#60351B] bg-white"
        >
          <option value="">All visibility</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="featured">Featured</option>
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-[#210C00]/20 rounded-lg px-3 py-1.5 text-sm text-[#210C00] focus:outline-none focus:border-[#60351B] bg-white"
        >
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#210C00]/10 rounded-xl overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-[#210C00]/40 animate-pulse">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#210C00]/10 bg-[#FAF6F0]">
                {['Post', 'Type', 'Author', 'Status', 'Views', 'Published', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-[#210C00]/50 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b._id} className="border-b border-[#210C00]/5 last:border-b-0 hover:bg-[#FAF6F0] transition-colors">
                  <td className="px-4 py-3 max-w-[200px]">
                    <Link href={`/admin/blogs/${b._id}`} className="flex items-center gap-2 group">
                      {b.coverImage && (
                        <img src={getImageUrl(b.coverImage)} className="w-8 h-10 object-cover rounded flex-shrink-0" alt="" />
                      )}
                      <span className="text-[#60351B] group-hover:underline truncate">{b.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#210C00]/60 whitespace-nowrap">{TYPE_LABELS[b.type] || b.type}</td>
                  <td className="px-4 py-3 text-xs text-[#210C00]/60">{b.author?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${VISIBILITY_COLORS[b.visibility] || ''}`}>
                      {b.visibility}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#210C00]/50">{b.views ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-[#210C00]/50">
                    {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <Link href={`/admin/blogs/${b._id}`} className="text-[10px] px-2 py-1 border border-[#60351B]/30 rounded text-[#60351B] hover:bg-[#60351B]/5">
                        Edit
                      </Link>
                      {b.visibility !== 'published' && (
                        <button onClick={() => setVis(b._id, 'published')} className="text-[10px] px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Publish</button>
                      )}
                      {b.visibility !== 'featured' && (
                        <button onClick={() => setVis(b._id, 'featured')} className="text-[10px] px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600">Feature</button>
                      )}
                      {b.visibility !== 'draft' && (
                        <button onClick={() => setVis(b._id, 'draft')} className="text-[10px] px-2 py-1 border border-gray-300 text-gray-500 rounded hover:bg-gray-50">Unpublish</button>
                      )}
                      <button onClick={() => deleteBlog(b._id)} className="text-[10px] px-2 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#210C00]/40">No posts found</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-4 py-3 bg-[#FAF6F0] border-t border-[#210C00]/10 flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-xs px-3 py-1 rounded border border-[#210C00]/20 disabled:opacity-40">←</button>
            <span className="text-xs text-[#210C00]/60">Page {page}/{pages}</span>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="text-xs px-3 py-1 rounded border border-[#210C00]/20 disabled:opacity-40">→</button>
          </div>
        )}
      </div>
    </div>
  );
}
