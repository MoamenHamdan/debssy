"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/admin");
    } catch (err: any) {
      const code = err?.code as string;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("An error occurred. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={styles.particle}
          style={{
            width: `${20 + i * 14}px`,
            height: `${20 + i * 14}px`,
            left: `${10 + i * 15}%`,
            animationDuration: `${12 + i * 4}s`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoArea}>
          <div className={styles.cupWrap}>
            <div className={styles.cupRing} />
            <div className={styles.cup}>☕</div>
          </div>
          <h1 className={styles.brand}>Debsy</h1>
          <p className={styles.brandSub}>Village</p>
          <span className={styles.adminBadge}>Admin Panel</span>
        </div>

        <div className={styles.divider}>
          <div className={styles.divLine} />
          <div className={styles.divDot} />
          <div className={styles.divLine} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>✉️</span>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="admin@debsy.village"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <Link href="/" className={styles.backLink}>
          ← Back to Menu
        </Link>
      </div>
    </div>
  );
}
