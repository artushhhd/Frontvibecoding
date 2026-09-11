"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authFetch } from "../lib/api";

const HIDDEN_ROUTES = ["/login", "/register"];

export default function TopBar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (HIDDEN_ROUTES.includes(pathname)) {
    return null;
  }

  const canSeeSettings =
    user && ["moder", "admin", "superadmin"].includes(user.role);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <span className="topbar-logo">MyApp</span>

        <div className="topbar-actions">
          {!loading && (
            <>
              <a href="/profile" className="topbar-btn">
                <span className="topbar-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
                Profile
              </a>
              <a href="/" className="topbar-btn topbar-btn-settings">
                Courses
              </a>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
