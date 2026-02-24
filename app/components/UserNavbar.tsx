'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import bellIcon from '../../images/bell.png';
import { userApi } from '../../lib/api';

// Admin panel content interface
interface UserNavbarContent {
  viewProfileText: string;
  notificationsLabel: string;
  defaultUserInitials: string;
  defaultUserName: string;
}

const defaultContent: UserNavbarContent = {
  viewProfileText: 'View profile',
  notificationsLabel: 'Notifications',
  defaultUserInitials: 'U',
  defaultUserName: 'User',
};

interface UserNavbarProps {
  /** Custom class names for the container */
  className?: string;
  /** Whether to show the notification bell */
  showBell?: boolean;
  /** Whether to show the username text */
  showUsername?: boolean;
  /** Callback when user avatar is clicked */
  onAvatarClick?: () => void;
  /** Callback when bell is clicked */
  onBellClick?: () => void;
  /** Position variant */
  position?: 'left' | 'right';
  /** Override user data (useful for SSR or preloaded data) */
  userData?: {
    name?: string;
    profileImage?: string;
  } | null;
}

export default function UserNavbar({
  className = '',
  showBell = true,
  showUsername = true,
  onAvatarClick,
  onBellClick,
  position = 'right',
  userData: propUserData,
}: UserNavbarProps) {
  const [content] = useState<UserNavbarContent>(defaultContent);
  const [userData, setUserData] = useState<{ name?: string; profileImage?: string } | null>(propUserData || null);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  // Fetch user data if not provided via props
  useEffect(() => {
    if (propUserData !== undefined) {
      setUserData(propUserData);
      return;
    }

    async function fetchUser() {
      try {
        const res: any = await userApi.getProfile();
        setUserData(res?.data || null);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    }
    fetchUser();
  }, [propUserData]);

  // Get user initials
  const getInitials = (name?: string): string => {
    if (!name) return content.defaultUserInitials;
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleAvatarClick = () => {
    if (onAvatarClick) {
      onAvatarClick();
    } else {
      router.push('/profile');
    }
  };

  const handleBellClick = () => {
    if (onBellClick) {
      onBellClick();
    } else {
      router.push('/notifications');
    }
  };

  const positionClasses = position === 'left' ? 'justify-start' : 'justify-end';

  return (
    <>
      {/* Desktop version - hidden on mobile */}
      <div
        className={`
          flex items-center gap-3
          ${positionClasses}
          ${className}
        `}
      >
        {/* User avatar and name */}
        <button
          onClick={handleAvatarClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="User profile"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden flex-shrink-0">
            {userData?.profileImage ? (
              <Image
                src={userData.profileImage}
                alt={userData.name || content.defaultUserName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-xs sm:text-sm font-semibold">
                {getInitials(userData?.name)}
              </span>
            )}
          </div>

          {/* Username - visible on md screens and up */}
          {showUsername && (
            <span className="hidden md:block text-xs sm:text-sm font-medium text-[#0C1421] truncate max-w-[80px] sm:max-w-[120px]">
              {userData?.name || content.defaultUserName}
            </span>
          )}
        </button>

        {/* Bell icon */}
        {showBell && (
          <button
            onClick={handleBellClick}
            aria-label={content.notificationsLabel}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors"
          >
            <Image
              src={bellIcon}
              alt={content.notificationsLabel}
              width={18}
              height={18}
              className="object-contain sm:w-[22px] sm:h-[22px]"
            />
            {/* Notification badge */}
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Mobile version - for use in drawer, not rendered here */}
      {/* The mobile drawer should use UserNavbarMobile component */}
    </>
  );
}

// Mobile version for use inside the hamburger drawer
export function UserNavbarMobile({
  className = '',
  onAvatarClick,
  userData: propUserData,
}: {
  className?: string;
  onAvatarClick?: () => void;
  userData?: { name?: string; profileImage?: string } | null;
}) {
  const [content] = useState<UserNavbarContent>(defaultContent);
  const [userData, setUserData] = useState<{ name?: string; profileImage?: string } | null>(propUserData || null);
  const router = useRouter();

  // Fetch user data if not provided
  useEffect(() => {
    if (propUserData !== undefined) {
      setUserData(propUserData);
      return;
    }

    async function fetchUser() {
      try {
        const res: any = await userApi.getProfile();
        setUserData(res?.data || null);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    }
    fetchUser();
  }, [propUserData]);

  const getInitials = (name?: string): string => {
    if (!name) return content.defaultUserInitials;
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleClick = () => {
    if (onAvatarClick) {
      onAvatarClick();
    } else {
      // use account settings page for mobile view profile
      router.push('/settings/account');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-2 sm:gap-3 w-full
        px-3 sm:px-4 py-2 sm:py-3
        border-b border-black/5
        hover:bg-black/5 transition-colors
        ${className}
      `}
    >
      {/* Avatar */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden flex-shrink-0">
        {userData?.profileImage ? (
          <Image
            src={userData.profileImage}
            alt={userData.name || content.defaultUserName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-xs sm:text-sm font-semibold">
            {getInitials(userData?.name)}
          </span>
        )}
      </div>

      {/* User info */}
      <div className="flex flex-col items-start">
        <span className="text-xs sm:text-sm font-medium text-[#0C1421]">
          {userData?.name || content.defaultUserName}
        </span>
        <span className="text-[10px] sm:text-xs text-[#6B4A33]">{content.viewProfileText}</span>
      </div>
    </button>
  );
}

// Header bar with user info for mobile (to be shown at top)
export function UserNavbarHeader({
  className = '',
  onBellClick,
  userData: propUserData,
  showLogo = false,
  logoSrc,
}: {
  className?: string;
  onBellClick?: () => void;
  userData?: { name?: string; profileImage?: string } | null;
  showLogo?: boolean;
  logoSrc?: any;
}) {
  const [content] = useState<UserNavbarContent>(defaultContent);
  const [userData, setUserData] = useState<{ name?: string; profileImage?: string } | null>(propUserData || null);
  const [notificationCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (propUserData !== undefined) {
      setUserData(propUserData);
      return;
    }

    async function fetchUser() {
      try {
        const res: any = await userApi.getProfile();
        setUserData(res?.data || null);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    }
    fetchUser();
  }, [propUserData]);

  const getInitials = (name?: string): string => {
    if (!name) return content.defaultUserInitials;
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleBellClick = () => {
    if (onBellClick) {
      onBellClick();
    } else {
      router.push('/notifications');
    }
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* Bell icon */}
      <button
        onClick={handleBellClick}
        aria-label={content.notificationsLabel}
        className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors"
      >
        <Image
          src={bellIcon}
          alt={content.notificationsLabel}
          width={20}
          height={20}
          className="w-5 h-5 sm:w-[22px] sm:h-[22px] object-contain"
        />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full flex items-center justify-center">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </button>

      {/* User avatar */}
      <button
        onClick={() => router.push('/profile')}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#D0744C] flex items-center justify-center overflow-hidden"
        aria-label="User profile"
      >
        {userData?.profileImage ? (
          <Image
            src={userData.profileImage}
            alt={userData.name || content.defaultUserName}
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-xs font-semibold">{getInitials(userData?.name)}</span>
        )}
      </button>
    </div>
  );
}
