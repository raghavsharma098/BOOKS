'use client';

import React, { useEffect, useRef, useState } from 'react';
import { userApi, authApi, authorsApi, tokenManager, getImageUrl } from '../../../lib/api';
import Sidebar from '../../components/Sidebar';
import MobileDrawer from '../../components/MobileDrawer';
import SearchBar from '../../components/SearchBar';
import MobileTopBar from '../../components/MobileTopBar';
import UserNavbar from '../../components/UserNavbar';
import Image from 'next/image';
import Link from 'next/link';
import verification from '../../../images/verification.png';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

export default function AccountSettings(): JSX.Element {
  const { mobileMenuOpen, toggleMobileMenu, activeIcon, setActiveIcon } = useMobileMenu();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({ name: '', email: '', username: '' });
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [showRatings, setShowRatings] = useState<boolean>(false);
  const [showClubMembership, setShowClubMembership] = useState<boolean>(true);
  const [allowMessages, setAllowMessages] = useState<boolean>(false);
  const [dataSharing, setDataSharing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);

  // Account edit state
  const [editingAccount, setEditingAccount] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountErrors, setAccountErrors] = useState<{ name?: string; email?: string; username?: string; submit?: string }>({});
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);

  // Change Password modal state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpw, setCpw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwProfile, setPwProfile] = useState<any>(null);

  // Claim Author modal state
  const [showClaimAuthor, setShowClaimAuthor] = useState(false);
  const [authorQuery, setAuthorQuery] = useState('');
  const [authorLoading, setAuthorLoading] = useState(false);
  const [authorResults, setAuthorResults] = useState<any[]>([]);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [claimEmail, setClaimEmail] = useState('');
  const [claimProof, setClaimProof] = useState('');
  const [claimPending, setClaimPending] = useState(false);

  // Profile photo upload state
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPhotoError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Image must be smaller than 5 MB.'); return; }
    setPhotoError(null);
    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Upload
    setPhotoUploading(true);
    try {
      const res: any = await userApi.uploadProfilePicture(file);
      const newUrl: string = res?.data?.profilePicture || res?.profilePicture || '';
      if (newUrl) {
        setUserData((prev: any) => ({ ...prev, profilePicture: newUrl }));
        setPhotoPreview(newUrl);
        // Persist into tokenManager so side navbars pick it up on next mount
        const storedUser = tokenManager.getUser();
        if (storedUser) tokenManager.setUser({ ...storedUser, profilePicture: newUrl });
      }
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 2500);
    } catch (err: any) {
      setPhotoError(err?.message || 'Upload failed. Please try again.');
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }

  // simple email validator
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // debounce search for Claim Author modal
  useEffect(() => {
    if (!showClaimAuthor) return;
    if (!authorQuery || authorQuery.trim().length < 2) {
      setAuthorResults([]);
      return;
    }


    let cancelled = false;
    setAuthorLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res: any = await authorsApi.search(authorQuery.trim(), 8).catch(() => null);
        if (cancelled) return;
        const data = res?.data || res || [];
        setAuthorResults(data);
      } catch (err) {
        console.error('Author search failed', err);
        if (!cancelled) setAuthorResults([]);
      } finally {
        if (!cancelled) setAuthorLoading(false);
      }
    }, 350);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [authorQuery, showClaimAuthor]);

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      try {
        setLoading(true);
        const [profileRes, claimRes]: any[] = await Promise.all([
          userApi.getProfile().catch(() => null),
          authorsApi.getMyClaim().catch(() => null),
        ]);
        if (!mounted) return;
        const data = profileRes?.data || profileRes || {};
        // Email may not come back from getProfile if backend excludes it — fall back to stored login data
        const storedEmail = tokenManager.getUser()?.email || '';
        setProfile({ name: data?.name || '', email: data?.email || storedEmail, username: data?.username || '' });
        setUserData(data);
        const prefs: any = data?.preferences || {};
        setNotifyEmail(prefs?.notifyEmail ?? true);
        setShowRatings(prefs?.showRatings ?? false);
        setShowClubMembership(prefs?.showClubMembership ?? true);
        setAllowMessages(prefs?.allowMessages ?? false);
        setDataSharing(prefs?.dataSharing ?? false);
        // Restore claim pending state from backend
        if (claimRes?.status === 'pending') setClaimPending(true);
      } catch (err) {
        console.warn('Could not load profile (placeholder):', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      console.log('Save (placeholder)', { profile, notifyEmail, showRatings, showClubMembership, allowMessages, dataSharing });
    } catch (err) {
      console.error('Save failed (placeholder):', err);
    } finally {
      setSaving(false);
    }
  }

  // Save handler for Account Information with validation + toast
  async function handleAccountSave() {
    setAccountErrors({});

    const errors: { name?: string; email?: string; username?: string } = {};
    if (!profile?.name || profile.name.trim().length === 0) {
      errors.name = 'Name is required.';
    }
    if (!profile?.email || !isValidEmail(profile.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    // username validation (3+ chars, alphanumeric + underscore)
    if (!profile?.username || profile.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    } else if (!/^[A-Za-z0-9_]+$/.test(profile.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores.';
    }

    if (Object.keys(errors).length > 0) {
      setAccountErrors(errors);
      return;
    }

    setAccountSaving(true);
    try {
      await userApi.updateProfile({ name: profile.name.trim(), email: profile.email.trim(), username: profile.username.trim() });
      const res: any = await userApi.getProfile();
      const data = res?.data || res || {};
      setUserData(data);
      setProfile({ name: data?.name || '', email: data?.email || '', username: data?.username || '' });
      setEditingAccount(false);
      setAccountSuccess('Profile updated');
      setTimeout(() => setAccountSuccess(null), 3000);
    } catch (err: any) {
      console.error('Save failed', err);
      setAccountErrors({ submit: err?.message || 'Save failed. Please try again.' });
    } finally {
      setAccountSaving(false);
    }
  }

  // Change-password submit handler
  async function handlePasswordSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!cpw) {
      setPwError('Please enter your current password.');
      return;
    }
    if (!newPw || newPw.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      await authApi.changePassword(cpw, newPw);
      setPwSuccess('Password changed successfully');
      setTimeout(() => {
        setShowChangePassword(false);
        setCpw('');
        setNewPw('');
        setConfirmPw('');
        setPwSuccess(null);
      }, 1200);
    } catch (err: any) {
      setPwError(err?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  }

  // Close modal on Esc + lock page scroll while any modal is open
  useEffect(() => {
    const modalOpen = showChangePassword || showClaimAuthor;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    if (modalOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setShowChangePassword(false);
        setShowClaimAuthor(false);
      }
    };

    if (modalOpen) window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = originalHtmlOverflow || '';
      document.body.style.overflow = originalBodyOverflow || '';
    };
  }, [showChangePassword, showClaimAuthor]);

  return (
    <main className="min-h-screen bg-[#F2F0E4]">
      {/* mobile top bar with search embedded */}
      <MobileTopBar>
        <div className="flex-1">
          <SearchBar
            asHeader
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search settings and help..."
            showFilters={true}
          />
        </div>
      </MobileTopBar>

      <MobileDrawer isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} activeIcon={activeIcon} setActiveIcon={setActiveIcon} hideHeader />
      <Sidebar activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

      {/* Main Content */}
      <div className="w-full lg:ml-24">
        {/* Top Bar - Desktop/Tablet */}
        <div className="hidden sm:block sticky top-0 z-50 bg-[#F2F0E4] border-b border-[#210C00]/5 px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:-ml-10">
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search settings and help..." showFilters={true} />
              </div>
              <UserNavbar />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 mt-14 sm:mt-0">
          <div className="max-w-7xl mx-auto">
            <div className="w-full mx-auto bg-transparent backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm border border-gray-100">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#210C00] mb-1 sm:mb-2">Account & Privacy</h1>
              <p className="text-xs sm:text-sm text-[#6B6B6B] mb-4 sm:mb-6">Manage your account details, privacy settings, and author verification.</p>

              {/* Profile Photo Upload */}
              <div className="w-full max-w-full mx-auto bg-white rounded-2xl border border-[#E8E4D9] p-5 md:p-7 mb-6 md:mb-8">
                <div className="text-lg md:text-xl font-semibold text-[#210C00] mb-1">Profile Photo</div>
                <p className="text-sm text-[#6B6B6B] mb-5">Your photo appears on your profile, reviews, and club discussions.</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                className="relative group w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-[#D0744C] flex items-center justify-center text-white text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#60351B] focus:ring-offset-2"
                aria-label="Change profile photo"
              >
                {(photoPreview || userData?.profilePicture) ? (
                  <img src={getImageUrl(photoPreview || userData?.profilePicture)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{(userData?.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {photoUploading ? (
                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Text + button */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#210C00] mb-1">{userData?.name || 'Your Name'}</div>
                <p className="text-xs text-[#9B9B9B] mb-3">JPG, PNG or GIF · Max 5 MB</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    className="px-4 py-2 rounded-full bg-[#60351B] text-white text-sm font-medium hover:bg-[#4A2816] disabled:opacity-50 transition-colors"
                  >
                    {photoUploading ? 'Uploading…' : 'Change Photo'}
                  </button>
                  {(photoPreview || userData?.profilePicture) && (
                    <button
                      type="button"
                      onClick={() => { setPhotoPreview(null); setUserData((p: any) => ({ ...p, profilePicture: '' })); }}
                      className="px-4 py-2 rounded-full border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {photoSuccess && <p className="mt-2 text-xs text-green-600">Photo updated successfully!</p>}
                {photoError && <p className="mt-2 text-xs text-red-600">{photoError}</p>}
              </div>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Author verification */}
          {userData?.role === 'verified_author' ? (
            <div className="relative w-full max-w-full mx-auto bg-white rounded-2xl border border-[#E8E4D9] p-6 md:p-8 mb-6 md:mb-8">
              <div className="flex items-start gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 text-green-700 shadow-sm">
                  <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg md:text-xl font-semibold text-[#210C00]">Verified Author</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      Verified
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-[#6B6B6B]">Your author profile has been verified. You now have access to author tools and your verified badge is displayed on your profile.</p>
                </div>
              </div>
            </div>
          ) : claimPending ? (
            <div className="relative w-full max-w-full mx-auto bg-white rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8 mb-6 md:mb-8">
              <div className="flex items-start gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-sm">
                  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg md:text-xl font-semibold text-[#210C00]">Claim Under Review</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">Pending</span>
                  </div>
                  <p className="text-sm md:text-base text-[#6B6B6B]">Your author claim request has been submitted and is currently under review by our admin team. We'll notify you by email once it's been processed.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full max-w-full mx-auto bg-white rounded-2xl border border-[#E8E4D9] p-6 md:p-8 mb-6 md:mb-8">
              {/* Icon and Header */}
              <div className="flex items-start gap-4 md:gap-6 mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-[#60351B]/20 text-[#8B5A3C] shadow-sm">
                  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-[#210C00]">Author Verification</h3>
                  <p className="text-sm md:text-base text-[#6B6B6B] mt-1">Claim your author profile and get verified</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm md:text-base text-[#210C00]/80 leading-relaxed mb-6 md:mb-8">
                Are you an author? Claim your existing author profile on Compass to get verified, connect with your readers, and access exclusive author tools.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button 
                  onClick={() => { setAuthorQuery(''); setAuthorResults([]); setClaimMessage(null); setSelectedAuthorId(null); setClaimEmail(profile.email || tokenManager.getUser()?.email || ''); setClaimProof(''); setShowClaimAuthor(true); }} 
                  className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-full bg-[#60351B] text-white font-semibold text-sm md:text-base hover:bg-[#4A2816] transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Claim Author Profile
                </button>
                <button 
                  onClick={() => { /* navigate to learn more */ }}
                  className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-3.5 rounded-full bg-white/80 border border-[#D4C9B9] text-[#8B5A3C] font-semibold text-sm md:text-base hover:bg-white/90 transition-colors duration-200"
                >
                  Learn More
                </button>
              </div>
            </div>
          )}



          {/* Account information */}
          <div className="w-full max-w-8xl bg-white rounded-[12px] sm:rounded-[16px] border-[0.8px] border-[#F0ECE6] flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 lg:px-8 lg:py-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="text-lg sm:text-xl font-sf font-[590] text-[#210C00]">Account Information</div>
                <div className="text-xs text-[#6B6B6B] mt-1">Full name, email address and username</div>
              </div>

              <div className="text-sm text-[#A09080]">
                {!editingAccount ? (
                  <button onClick={() => setEditingAccount(true)} className="px-3 py-1 font-sf font-[590] text-sm leading-[20px] text-center text-[#60351B]">Edit</button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={handleAccountSave} disabled={accountSaving} className={`px-3 py-1.5 rounded text-sm ${accountSaving ? 'bg-[#3f2519] opacity-70' : 'bg-[#60351B]'} text-white`}>{accountSaving ? 'Saving...' : 'Save'}</button>
                    <button onClick={() => { setProfile({ name: userData?.name || '', email: userData?.email || '', username: userData?.username || '' }); setEditingAccount(false); setAccountErrors({}); }} className="px-3 py-1.5 border text-sm rounded">Cancel</button>
                    {accountSuccess && <div role="status" aria-live="polite" className="text-xs sm:text-sm text-green-600 font-medium mt-1 sm:mt-0 sm:ml-2">{accountSuccess}</div>}
                  </div>
                )}
              </div>
            </div>

            {accountErrors.submit && (
              <div className="text-xs sm:text-sm text-red-600">{accountErrors.submit}</div>
            )}

            <div className="grid gap-4 sm:gap-5">
              <div className="flex flex-col gap-1.5">
                <div>
                  <div className="text-[11px] sm:text-xs font-sf font-[590] tracking-[0.3px] uppercase text-[rgba(33,12,0,0.6)]">Full name</div>
                  <div className="mt-1.5">
                    {editingAccount ? (
                      <>
                        <input value={profile.name} onChange={(e) => setProfile((s: any) => ({ ...s, name: e.target.value }))} className="px-3 py-2 rounded-lg border border-[#D4CFC4] bg-white focus:outline-none w-full sm:max-w-[360px] text-sm" />
                        {accountErrors.name && <p className="text-xs text-red-500 mt-1">{accountErrors.name}</p>}
                      </>
                    ) : (
                      <span className="text-sm sm:text-base text-[#210C00]">{profile.name || userData?.name || 'Your name'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div>
                  <div className="text-[11px] sm:text-xs font-sf font-[590] tracking-[0.3px] uppercase text-[rgba(33,12,0,0.6)]">Email address</div>
                  <div className="mt-1.5">
                    {editingAccount ? (
                      <>
                        <input value={profile.email} onChange={(e) => setProfile((s: any) => ({ ...s, email: e.target.value }))} className="px-3 py-2 rounded-lg border border-[#D4CFC4] bg-white focus:outline-none w-full sm:max-w-[360px] text-sm" />
                        {accountErrors.email && <p className="text-xs text-red-500 mt-1">{accountErrors.email}</p>}
                      </>
                    ) : (
                      <span className="text-sm sm:text-base text-[#210C00] break-all">{profile.email || userData?.email || ''}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div>
                  <div className="text-[11px] sm:text-xs font-sf font-[590] tracking-[0.3px] uppercase text-[rgba(33,12,0,0.6)]">Username</div>
                  <div className="mt-1.5">
                    {editingAccount ? (
                      <>
                        <input value={profile.username} onChange={(e) => setProfile((s: any) => ({ ...s, username: e.target.value }))} className="px-3 py-2 rounded-lg border border-[#D4CFC4] bg-white focus:outline-none w-full sm:max-w-[360px] text-sm" />
                        {accountErrors.username && <p className="text-xs text-red-500 mt-1">{accountErrors.username}</p>}
                      </>
                    ) : (
                      <span className="text-sm sm:text-base text-[#210C00]">{(profile.username || userData?.username) ? `@${profile.username || userData?.username}` : '@username'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password & Security */}
          <div className="w-full max-w-8xl lg:max-w-8xl bg-white rounded-[12px] sm:rounded-[16px] border-[0.8px] border-[#F0ECE6] p-4 sm:p-6 lg:px-8 mb-4 sm:mb-6">
            <div className="w-full">
              <div className="flex items-start justify-between w-full mb-4">
                <div>
                  <div className="text-lg sm:text-xl font-sf font-[590] text-[#210C00]">Password & Security</div>
                  <div className="text-xs text-[#6B6B6B] mt-1">Keep your account secure</div>
                </div>
              </div>

              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-[16px] sm:rounded-[20px] border-[0.8px] border-[#F0ECE6] border-t-[rgba(96,53,27,0.2)] p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-[rgba(96,53,27,0.06)] text-[#60351B] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="10" rx="2" stroke="#60351B" strokeWidth="1.5"/><path d="M7 11V8a5 5 0 0110 0v3" stroke="#60351B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#210C00]">Change Password</div>
                    <div className="text-xs text-[#6B6B6B]">Last changed 3 months ago</div>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <button onClick={async () => { setCpw(''); setNewPw(''); setConfirmPw(''); setPwError(null); setPwSuccess(null); setShowChangePassword(true); const res: any = await userApi.getProfile().catch(() => null); setPwProfile(res?.data || res || null); }} className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#E8E4D9] text-[#6B6B6B]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="relative w-full max-w-8xl bg-white rounded-[12px] sm:rounded-[16px] border-[0.8px] border-[#F0ECE6] border-t-[rgba(96,53,27,0.2)] p-4 sm:p-6 lg:px-8 lg:py-6 flex flex-col gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <div className="text-base sm:text-lg font-semibold text-[#210C00]">Privacy Settings</div>
              <div className="text-xs text-[#6B6B6B] mt-1">Control who can see your information</div>
            </div>

            <div className="grid gap-4 sm:gap-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#210C00]">Profile Visibility</div>
                  <div className="text-xs text-[#6B6B6B]">Choose who can view your profile</div>
                </div>
                <div className="flex-shrink-0">
                  <div className="px-3 py-1 rounded-full bg-[#F0ECE6] text-xs sm:text-sm text-[#6B6B6B]">Public</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#210C00]">Show Reading Activity</div>
                  <div className="text-xs text-[#6B6B6B]">Let others see what you're currently reading</div>
                </div>
                <div className="flex-shrink-0">
                  <input type="checkbox" checked={notifyEmail} onChange={(e) => setShowClubMembership(e.target.checked)} className="theme-checkbox" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#210C00]">Show Book Ratings</div>
                  <div className="text-xs text-[#6B6B6B]">Display your book ratings publicly</div>
                </div>
                <div className="flex-shrink-0">
                  <input type="checkbox" checked={showRatings} onChange={(e) => setShowRatings(e.target.checked)} className="theme-checkbox" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#210C00]">Show Club Membership</div>
                  <div className="text-xs text-[#6B6B6B]">Let others see which book clubs you're in</div>
                </div>
                <div className="flex-shrink-0">
                  <input type="checkbox" checked={showClubMembership} onChange={(e) => setShowClubMembership(e.target.checked)} className="theme-checkbox" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#210C00]">Allow Messages</div>
                  <div className="text-xs text-[#6B6B6B]">Receive messages from other readers</div>
                </div>
                <div className="flex-shrink-0">
                  <input type="checkbox" checked={allowMessages} onChange={(e) => setAllowMessages(e.target.checked)} className="theme-checkbox" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#210C00]">Data Sharing for Recommendations</div>
                  <div className="text-xs text-[#6B6B6B]">Share reading data for better recommendations</div>
                </div>
                <div className="flex-shrink-0">
                  <input type="checkbox" checked={dataSharing} onChange={(e) => setDataSharing(e.target.checked)} className="theme-checkbox" />
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="w-full max-w-8xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-[#210C00]">Danger Zone</h3>
              <p className="text-sm md:text-base text-[#6B6B6B] mt-2">Irreversible actions</p>
            </div>

            {/* Delete Account Card */}
            <div className="bg-white rounded-2xl border border-[#E8E4D9] p-5 md:p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <button 
                onClick={() => {
                  // Handle delete account logic
                }}
                className="w-full flex items-center justify-between gap-4 text-left"
              >
                {/* Left Icon */}
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-[#FFE5E5] text-[#D32F2F]">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base md:text-lg font-semibold text-[#210C00]">Delete Account</h4>
                  <p className="text-sm md:text-base text-[#6B6B6B] mt-1">Permanently delete your account and all data</p>
                </div>

                {/* Right Arrow */}
                <div className="flex-shrink-0 text-[#210C00]/30 hover:text-[#210C00]/60 transition-colors">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
        </div>
        </div>

          {showChangePassword && (
            <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
              <div className="fixed inset-0 bg-black/30" style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={() => setShowChangePassword(false)} />

              <div className="relative bg-white border border-[rgba(33,12,0,0.08)] rounded-[12px] sm:rounded-[16px] shadow-lg w-full max-w-[896px] p-4 sm:p-6 md:p-7 z-[1201] max-h-[90vh] overflow-y-auto">
                <button aria-label="Close change password" onClick={() => setShowChangePassword(false)} className="absolute right-2 sm:right-3 top-2 sm:top-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="#0C1421" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                <div className="w-full">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#210C00] pr-8">Change password</h3>

                  <form onSubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }} className="mt-4 sm:mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-4">
                      <div className="sm:w-[160px] md:w-[200px] text-sm text-[#6B6B6B]">Current password</div>
                      <div className="flex-1">
                        <input value={cpw} onChange={(e) => setCpw(e.target.value)} type="password" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-[10px] border border-[#E8E4D9] bg-white focus:outline-none text-sm" />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-4">
                      <div className="sm:w-[160px] md:w-[200px] text-sm text-[#6B6B6B]">New password</div>
                      <div className="flex-1">
                        <input value={newPw} onChange={(e) => setNewPw(e.target.value)} type="password" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-[10px] border border-[#E8E4D9] bg-white focus:outline-none text-sm" />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div className="sm:w-[160px] md:w-[200px] text-sm text-[#6B6B6B]">Confirm new password</div>
                      <div className="flex-1">
                        <input value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} type="password" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-[10px] border border-[#E8E4D9] bg-white focus:outline-none text-sm" />
                      </div>
                    </div>

                    {pwError && <div className="text-xs sm:text-sm text-red-600 mt-3">{pwError}</div>}
                    {pwSuccess && <div className="text-xs sm:text-sm text-green-600 mt-3">{pwSuccess}</div>}

                    <p className="text-xs text-[#6B6B6B] mt-4 sm:mt-6">Enter your current password and choose a new one. Passwords must be at least 6 characters.</p>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                      <button type="button" onClick={() => setShowChangePassword(false)} className="px-4 py-2 rounded border bg-white text-sm">Cancel</button>
                      <button type="submit" disabled={pwLoading} className={`px-4 py-2 rounded text-sm ${pwLoading ? 'bg-[#3f2519] opacity-70 text-white' : 'bg-[#60351B] text-white'}`}>
                        {pwLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {showClaimAuthor && (
            <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
              <div className="fixed inset-0 bg-black/30" style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={() => setShowClaimAuthor(false)} />

              <div className={`relative w-full max-w-[672px] ${authorResults.length > 0 ? 'bg-white' : 'bg-[rgba(255,255,255,0.95)]'} rounded-[16px] sm:rounded-[24px] border-[0.8px] border-[rgba(33,12,0,0.08)] border-t-[rgba(96,53,27,0.3)] shadow-lg p-4 sm:p-6 z-[1201] max-h-[90vh] overflow-y-auto`}>
                <button aria-label="Close claim author" onClick={() => setShowClaimAuthor(false)} className="absolute right-2 sm:right-3 top-2 sm:top-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="#0C1421" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 flex-shrink-0 rounded-[20px] bg-[rgba(96,53,27,0.1)] flex items-center justify-center">
                        <Image src={verification} alt="verify" width={20} height={20} className="object-contain" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-sf font-[590] text-[#210C00]">Claim Your Author Profile</h3>
                        <p className="text-xs sm:text-sm font-sf font-normal text-[rgba(33,12,0,0.7)] mt-1">Search for your existing author profile in our database</p>
                      </div>
                    </div>

                    <label className="block font-sf font-[590] text-[11px] sm:text-xs tracking-[0.3px] uppercase text-[rgba(33,12,0,0.6)] mb-2">Search Author Name</label>
                    <div className="mt-2">
                      <div className="relative">
                        <input value={authorQuery} onChange={(e) => setAuthorQuery(e.target.value)} placeholder="Enter your full name as it appears on your books" className="w-full rounded-[16px] sm:rounded-[20px] border-[0.8px] border-[#E8E4D9] border-t-[rgba(96,53,27,0.2)] bg-[rgba(255,255,255,0.5)] pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm focus:outline-none" />
                        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#C4BFB5]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="6" stroke="#C4BFB5" strokeWidth="1.5"/><path d="M21 21l-4.35-4.35" stroke="#C4BFB5" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </div>
                      </div>

                      {!authorLoading && authorQuery.trim().length >= 2 && authorResults.length === 0 && (
                        <div className="mt-3 text-xs sm:text-sm text-[#6B6B6B]">No authors found.</div>
                      )}
                    </div>

                    {authorResults.length > 0 && (
                      <div className="mt-4">
                        <div className="text-[11px] sm:text-xs tracking-[0.3px] uppercase text-[#6B6B6B] mb-3">Search results</div>

                        {!selectedAuthorId ? (
                          <div className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-[250px] overflow-y-auto">
                            {authorResults.map((a: any) => (
                              <button key={a._id} onClick={() => setSelectedAuthorId(a._id)} className="w-full text-left bg-white border border-[#F0ECE6] rounded-[10px] sm:rounded-[12px] p-3 sm:p-4 flex items-center justify-between shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg bg-[#E8E4D9] flex items-center justify-center text-[#60351B] text-xs sm:text-sm">{(a.name || '?').split(' ').map((n: string) => n[0]).slice(0,2).join('')}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm sm:text-base text-[#210C00] truncate">{a.name}</div>
                                    <div className="text-xs text-[#6B6B6B] truncate">Author of {a.bookCount || 'several'} books on Compass</div>
                                    <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1 sm:gap-2">
                                      {(a.genres || []).slice(0,2).map((g: string) => <span key={g} className="text-[10px] sm:text-xs bg-[#FFF3EA] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[#8B5A3C]">{g}</span>)}
                                    </div>
                                  </div>
                                </div>

                                <div className="ml-2 sm:ml-4 flex-shrink-0 text-[#6B6B6B]">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (() => {
                          const a = authorResults.find(r => r._id === selectedAuthorId);
                          if (!a) return null;
                          return (
                          <div>
                        <div className="bg-[#FBF7F3] border border-[#F0ECE6] rounded-[10px] sm:rounded-[12px] p-3 sm:p-4 flex flex-col gap-3">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg bg-[#E8E4D9] flex items-center justify-center text-[#60351B] text-xs sm:text-sm">{(a.name || '?').split(' ').map((n: string) => n[0]).slice(0,2).join('')}</div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-sm sm:text-base text-[#210C00] truncate">{a.name}</div>
                                    <div className="text-xs text-[#6B6B6B]">Author of {a.bookCount || 'several'} books on Compass</div>
                                    <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1 sm:gap-2">
                                      {(a.genres || []).slice(0,2).map((g: string) => <span key={g} className="text-[10px] sm:text-xs bg-[#FFF3EA] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[#8B5A3C]">{g}</span>)}
                                    </div>
                                  </div>
                                </div>
                                <button onClick={() => setSelectedAuthorId(null)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border flex items-center justify-center flex-shrink-0 self-end sm:self-center">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                              </div>

                              {/* Proof fields */}
                              <div className="flex flex-col gap-2 mt-1">
                                <div>
                                  <label className="block text-[11px] uppercase tracking-[0.3px] text-[rgba(33,12,0,0.6)] font-sf font-[590] mb-1">Your Author Email</label>
                                  <input
                                    type="email"
                                    value={claimEmail}
                                    onChange={(e) => setClaimEmail(e.target.value)}
                                    placeholder="Email associated with your published works"
                                    className="w-full rounded-[12px] border-[0.8px] border-[#E8E4D9] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#60351B]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] uppercase tracking-[0.3px] text-[rgba(33,12,0,0.6)] font-sf font-[590] mb-1">Proof of Authorship</label>
                                  <input
                                    type="text"
                                    value={claimProof}
                                    onChange={(e) => setClaimProof(e.target.value)}
                                    placeholder="Link to your website, publisher page, or ISBN"
                                    className="w-full rounded-[12px] border-[0.8px] border-[#E8E4D9] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#60351B]"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button disabled={claimLoading || a.claimRequestStatus === 'pending'} onClick={async () => {
                                    setClaimLoading(true); setClaimMessage(null);
                                    try {
                                      await authorsApi.claim(a._id, { email: claimEmail || undefined, proof: claimProof || undefined });
                                      setClaimMessage('Claim request submitted — admins will review it.');
                                      setClaimPending(true);
                                      setTimeout(() => setShowClaimAuthor(false), 1500);
                                    } catch (err: any) {
                                      setClaimMessage(err?.message || 'Could not submit claim');
                                    } finally {
                                      setClaimLoading(false);
                                    }
                                  }} className="px-4 py-2 rounded-full bg-[#60351B] text-white text-sm disabled:opacity-50">
                                  {claimLoading ? 'Submitting…' : a.claimRequestStatus === 'pending' ? 'Claim Pending' : 'Submit Claim'}
                                </button>
                              </div>

                              {claimMessage && <div className={`text-xs sm:text-sm mt-1 ${claimMessage.includes('submitted') ? 'text-green-600' : 'text-red-600'}`}>{claimMessage}</div>}
                            </div>
                          </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-[rgba(96,53,27,0.05)] rounded-[16px] sm:rounded-[20px] border-[0.8px] border-[rgba(33,12,0,0.08)] border-t-[rgba(96,53,27,0.2)] p-4 sm:p-5">
                    <div className="font-medium text-sm sm:text-base text-[#210C00] mb-2">How It Works</div>
                    <ol className="text-xs sm:text-sm text-[#6B6B6B] list-decimal pl-4 space-y-1.5 sm:space-y-2">
                      <li>Search for your name to find your existing author profile</li>
                      <li>Verify your identity through email confirmation</li>
                      <li>Get your verified author badge and access author tools</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </main>
  );
}
