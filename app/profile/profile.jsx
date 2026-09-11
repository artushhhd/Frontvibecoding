'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch, clearToken, getToken } from '@/lib/api';

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!getToken()) {
        router.replace('/login');
        return;
      }

      const res = await authFetch('/profile');

      if (cancelled) return;

      if (!res.ok) {
        router.replace('/login');
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authFetch('/logout', { method: 'POST' });
    } finally {
      clearToken();
      setLoggingOut(false);
      router.replace('/login');
    }
  };

  if (loading) {
    return <p>loading...</p>;
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>profile</h2>

      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Role:</strong> {user.role}
      </p>

      <button onClick={handleLogout} disabled={loggingOut}>
        {loggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}