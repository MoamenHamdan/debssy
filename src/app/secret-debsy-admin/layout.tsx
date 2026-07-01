"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./layout.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/secret-debsy-login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className={styles.loadingScreen}>
        <p className={styles.loadingText}>Verifying Access...</p>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarBrand}>
          <div className={styles.topbarText}>
            <h1 className={styles.topbarName}>Debsy Village</h1>
            <p className={styles.topbarRole}>Admin Panel</p>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <span className={styles.topbarEmail}>{user.email}</span>
          <Link href="/" className={styles.viewBtn} target="_blank" rel="noopener">
            View Menu ↗
          </Link>
          <button
            className={styles.logoutBtn}
            onClick={async () => {
              await logout();
              router.replace("/secret-debsy-login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className={styles.body}>{children}</main>
    </div>
  );
}
