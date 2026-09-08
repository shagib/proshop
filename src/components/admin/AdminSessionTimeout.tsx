'use client';

import { useEffect, useState } from 'react';

const IDLE_TIMEOUT_MS = 1 * 60 * 1000;
const WARNING_DURATION_SECONDS = 20;
const WARNING_TIMEOUT_MS = IDLE_TIMEOUT_MS - WARNING_DURATION_SECONDS * 1000;
const RESUME_SESSION_EVENT = 'admin-session-resume';

export default function AdminSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_DURATION_SECONDS);

  useEffect(() => {
    let warningTimeoutId: ReturnType<typeof setTimeout>;
    let logoutTimeoutId: ReturnType<typeof setTimeout>;

    const logoutWhenIdle = async () => {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      window.location.replace('/admin/login');
    };

    const showIdleWarning = () => {
      setShowWarning(true);
      setSecondsRemaining(WARNING_DURATION_SECONDS);
      logoutTimeoutId = setTimeout(logoutWhenIdle, WARNING_DURATION_SECONDS * 1000);
    };

    const resetTimeout = () => {
      clearTimeout(warningTimeoutId);
      clearTimeout(logoutTimeoutId);
      setShowWarning(false);
      setSecondsRemaining(WARNING_DURATION_SECONDS);
      warningTimeoutId = setTimeout(showIdleWarning, WARNING_TIMEOUT_MS);
    };

    window.addEventListener(RESUME_SESSION_EVENT, resetTimeout);
    resetTimeout();

    return () => {
      clearTimeout(warningTimeoutId);
      clearTimeout(logoutTimeoutId);
      window.removeEventListener(RESUME_SESSION_EVENT, resetTimeout);
    };
  }, []);

  useEffect(() => {
    if (!showWarning) return;

    const countdownId = setInterval(() => {
      setSecondsRemaining((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => clearInterval(countdownId);
  }, [showWarning]);

  async function continueSession() {
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      credentials: 'same-origin',
    });

    if (response.ok) {
      window.dispatchEvent(new Event(RESUME_SESSION_EVENT));
      return;
    }

    window.location.replace('/admin/login');
  }

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-timeout-title"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 id="session-timeout-title" className="text-lg font-semibold">
          Your session is about to expire
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          You will be logged out in {secondsRemaining} seconds.
        </p>
        <button
          type="button"
          onClick={() => void continueSession()}
          className="mt-5 rounded bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
        >
          Continue session
        </button>
      </div>
    </div>
  );
} 