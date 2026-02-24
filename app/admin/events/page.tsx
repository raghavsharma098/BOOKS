'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { adminEventsApi, getImageUrl } from '../../../lib/api';

interface AdminEvent {
  _id: string;
  title: string;
  description: string;
  type: string;
  city: string;
  venue: string;
  address: string;
  startDate: string;
  endDate: string;
  organizer?: any;
  coverImage?: string;
  isFeatured: boolean;
  status: string;
  bookingLink?: string;
  maxAttendees?: number;
  rsvps?: any[];
}

const EVENT_TYPES = ['Author Talk', 'Book Club', 'Workshop', 'Festival', 'Launch', 'Reading', 'Panel', 'Other'];
const STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

const blankForm = {
  title: '',
  description: '',
  type: 'Author Talk',
  city: '',
  venue: '',
  address: '',
  startDate: '',
  endDate: '',
  maxAttendees: '',
  bookingLink: '',
  isFeatured: false,
  status: 'approved',
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [form, setForm] = useState({ ...blankForm });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter
  const [filterStatus, setFilterStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await adminEventsApi.getAll(filterStatus ? { status: filterStatus } : undefined);
      setEvents(res.data || []);
    } catch {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const openCreate = () => {
    setEditingEvent(null);
    setForm({ ...blankForm });
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (ev: AdminEvent) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      type: ev.type || 'Author Talk',
      city: ev.city || '',
      venue: ev.venue || '',
      address: ev.address || '',
      startDate: ev.startDate ? ev.startDate.slice(0, 16) : '',
      endDate: ev.endDate ? ev.endDate.slice(0, 16) : '',
      maxAttendees: ev.maxAttendees ? String(ev.maxAttendees) : '',
      bookingLink: ev.bookingLink || '',
      isFeatured: !!ev.isFeatured,
      status: ev.status || 'approved',
    });
    setImageFile(null);
    setImagePreview(ev.coverImage ? getImageUrl(ev.coverImage) : '');
    setShowForm(true);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return flash('Title is required.', false);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('type', form.type);
      fd.append('city', form.city.trim());
      fd.append('venue', form.venue.trim());
      fd.append('address', form.address.trim());
      if (form.startDate) fd.append('startDate', new Date(form.startDate).toISOString());
      if (form.endDate) fd.append('endDate', new Date(form.endDate).toISOString());
      if (form.maxAttendees) fd.append('maxAttendees', form.maxAttendees);
      if (form.bookingLink.trim()) fd.append('bookingLink', form.bookingLink.trim());
      fd.append('isFeatured', String(form.isFeatured));
      fd.append('status', form.status);
      if (imageFile) fd.append('coverImage', imageFile);

      if (editingEvent) {
        await adminEventsApi.update(editingEvent._id, fd);
        flash('Event updated.');
      } else {
        await adminEventsApi.create(fd);
        flash('Event created.');
      }
      setShowForm(false);
      loadEvents();
    } catch (err: any) {
      flash(err?.message || 'Save failed.', false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (ev: AdminEvent) => {
    try {
      const fd = new FormData();
      fd.append('isFeatured', String(!ev.isFeatured));
      await adminEventsApi.update(ev._id, fd);
      flash(ev.isFeatured ? 'Removed from featured.' : 'Marked as featured.');
      loadEvents();
    } catch {
      flash('Failed to update.', false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await adminEventsApi.delete(id);
      flash('Event deleted.');
      loadEvents();
    } catch {
      flash('Failed to delete.', false);
    }
  };

  const statusPill = (s: string) => {
    const map: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-500',
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${map[s] || 'bg-gray-100 text-gray-500'}`}>{s}</span>;
  };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">← Admin</Link>
          <h1 className="text-2xl font-bold text-gray-800">Featured Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage events shown on the platform. Mark as Featured to highlight them.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#60351B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4A2518] transition-colors"
        >
          + New Event
        </button>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-500">Filter by status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#60351B]"
        >
          <option value="">All</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : error ? (
        <div className="text-red-600 text-sm py-8 text-center">{error}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9F7F0] border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Featured</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Booking Link</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((ev) => (
                <tr key={ev._id} className="hover:bg-[#F9F7F0] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Cover thumb */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#E8E2D4]">
                        {ev.coverImage ? (
                          <img src={getImageUrl(ev.coverImage)} alt={ev.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">📅</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#210C00] text-sm line-clamp-1">{ev.title}</p>
                        <p className="text-[10px] text-gray-400">{ev.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{fmtDate(ev.startDate)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{ev.city || '—'}</td>
                  <td className="px-4 py-3">{statusPill(ev.status)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleFeatured(ev)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                        ev.isFeatured
                          ? 'bg-[#60351B] text-white hover:bg-[#4A2518]'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {ev.isFeatured ? '★ Featured' : 'Set Featured'}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {ev.bookingLink ? (
                      <a href={ev.bookingLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#60351B] underline line-clamp-1 max-w-[140px] block">
                        {ev.bookingLink}
                      </a>
                    ) : <span className="text-[10px] text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(ev)}
                        className="text-[10px] px-2 py-1 border border-[#60351B]/30 rounded text-[#60351B] hover:bg-[#60351B]/5 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ev._id)}
                        className="text-[10px] px-2 py-1 border border-red-200 rounded text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    No events yet. Click &ldquo;+ New Event&rdquo; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-[#210C00]">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Cover Image */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Cover Image</label>
                <div
                  className="relative w-full h-36 rounded-xl overflow-hidden bg-[#F2F0E4] border-2 border-dashed border-[#D0C4B0] flex items-center justify-center cursor-pointer hover:border-[#60351B] transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="text-3xl mb-1">📷</div>
                      <p className="text-xs">Click to upload image</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="E.g. An Evening with Kazuo Ishiguro"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Event description…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B] resize-none"
                />
              </div>

              {/* Type + Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Event Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B] bg-white"
                  >
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B] bg-white capitalize"
                  >
                    {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Start + End Date row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                  />
                </div>
              </div>

              {/* Venue + City row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Venue Name</label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="E.g. The Literary Arts Center"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="E.g. New York"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="E.g. 245 Park Avenue South, NY 10003"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                />
              </div>

              {/* Max Attendees */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Max Attendees</label>
                <input
                  type="number"
                  value={form.maxAttendees}
                  onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })}
                  placeholder="E.g. 200 (leave blank for unlimited)"
                  min={1}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                />
              </div>

              {/* Booking Link */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Booking / Ticketing Link
                  <span className="ml-1 text-gray-400 font-normal">(users click "Book Now" to open this)</span>
                </label>
                <input
                  type="url"
                  value={form.bookingLink}
                  onChange={(e) => setForm({ ...form, bookingLink: e.target.value })}
                  placeholder="https://eventbrite.com/your-event"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#60351B]"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.isFeatured ? 'bg-[#60351B]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.isFeatured ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <label className="text-sm text-gray-700 cursor-pointer" onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}>
                  Feature this event on the dashboard
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#60351B] text-white text-sm font-medium hover:bg-[#4A2518] disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
