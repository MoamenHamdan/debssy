"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { MenuCategory, MenuItem, MenuSubcategory, INITIAL_MENU_DATA } from "@/lib/menuData";

// ─── Helpers ──────────────────────────────────────────────────────────────
function fmt(p: number) {
  return p % 1 === 0 ? `${p}$` : `${p.toFixed(2)}$`;
}

// ─── Item Card ─────────────────────────────────────────────────────────────
function ItemCard({ item }: { item: MenuItem }) {
  return (
    <article className={`${styles.itemCard} ${!item.available ? styles.soldOut : ""}`}>
      <div className={styles.itemBody}>
        <div className={styles.itemNameRow}>
          <h3 className={styles.itemNameEn}>{item.nameEn}</h3>
          {item.nameAr && <span className={styles.itemNameAr}>{item.nameAr}</span>}
        </div>
        {item.descriptionEn && <p className={styles.itemDesc}>{item.descriptionEn}</p>}
        {item.descriptionAr && <p className={styles.itemDescAr}>{item.descriptionAr}</p>}
        {!item.available && <span className={styles.soldOutTag}>Unavailable</span>}
      </div>
      <div className={`${styles.pricePill} ${!item.available ? styles.muted : ""}`}>
        {fmt(item.price)}
      </div>
    </article>
  );
}

// ─── Subcategory Block ─────────────────────────────────────────────────────
function SubcategoryBlock({ sub, q }: { sub: MenuSubcategory; q: string }) {
  const items = sub.items.filter(
    (i) => i.nameEn.toLowerCase().includes(q) || (i.nameAr || "").includes(q)
  );
  if (!items.length) return null;
  return (
    <div className={styles.subcategoryBlock}>
      <div className={styles.subcatHeading}>
        <div className={styles.subcatDash} />
        <p className={styles.subcatNameEn}>{sub.nameEn}</p>
        <span className={styles.subcatNameAr}>{sub.nameAr}</span>
        <div className={styles.subcatLine} />
      </div>
      {items.map((item) => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}

// ─── Category Section ──────────────────────────────────────────────────────
function CategorySection({
  cat,
  index,
  q,
}: {
  cat: MenuCategory;
  index: number;
  q: string;
}) {
  const filteredItems = cat.items.filter(
    (i) => i.nameEn.toLowerCase().includes(q) || (i.nameAr || "").includes(q)
  );
  const subHasResults = cat.subcategories?.some((sub) =>
    sub.items.some(
      (i) => i.nameEn.toLowerCase().includes(q) || (i.nameAr || "").includes(q)
    )
  );

  if (!filteredItems.length && !subHasResults) return null;

  return (
    <section className={styles.categorySection} id={`cat-${cat.id}`}>
      {/* Header */}
      <div className={styles.catHeaderCard}>
        <div className={styles.catNumBadge}>{index + 1}</div>
        <div className={styles.catHeaderText}>
          <h2 className={styles.catNameEn}>{cat.nameEn}</h2>
          <p className={styles.catNameAr}>{cat.nameAr}</p>
        </div>
        {cat.icon && <span className={styles.catHeaderIcon}>{cat.icon}</span>}
      </div>

      {/* Items */}
      {filteredItems.map((item) => <ItemCard key={item.id} item={item} />)}

      {/* Subcategories */}
      {cat.subcategories?.map((sub) => (
        <SubcategoryBlock key={sub.id} sub={sub} q={q} />
      ))}
    </section>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────────
function computeStats(menu: MenuCategory[]) {
  let items = 0;
  let cats = menu.length;
  menu.forEach((c) => {
    items += c.items.length;
    c.subcategories?.forEach((s) => (items += s.items.length));
  });
  return { items, cats };
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function MenuPage() {
  const menu = INITIAL_MENU_DATA;
  const { items: totalItems, cats: totalCats } = computeStats(menu);
  const [activeTab, setActiveTab] = useState(menu[0]?.id || "");
  const [searchQ, setSearchQ] = useState("");
  const navRef = useRef<HTMLDivElement>(null);

  // Scroll active tab button into view
  useEffect(() => {
    const btn = navRef.current?.querySelector(`[data-id="${activeTab}"]`) as HTMLElement | null;
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab]);

  // Highlight tab on scroll
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.id.replace("cat-", "");
            setActiveTab(id);
          }
        });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    menu.forEach((c) => {
      const el = document.getElementById(`cat-${c.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [menu]);

  const scrollTo = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const q = searchQ.toLowerCase().trim();
  const anyResult = menu.some(
    (cat) =>
      cat.items.some(
        (i) => i.nameEn.toLowerCase().includes(q) || (i.nameAr || "").includes(q)
      ) ||
      cat.subcategories?.some((sub) =>
        sub.items.some(
          (i) => i.nameEn.toLowerCase().includes(q) || (i.nameAr || "").includes(q)
        )
      )
  );

  return (
    <div className={styles.menuPage}>
      {/* ══ Hero ══════════════════════════════ */}
      <header className={styles.hero}>
        <div className={styles.heroGrain} />
        <div className={styles.heroInner}>
          {/* Cup icon */}
          <div className={styles.heroCupWrap}>
            <div className={styles.heroCupRing2} />
            <div className={styles.heroCupRing} />
            <div className={styles.heroCup}>☕</div>
          </div>

          <h1 className={styles.brandName}>Debsy</h1>
          <p className={styles.brandSub}>Village</p>

          <div className={styles.heroDivider}>
            <div className={styles.heroDividerLine} />
            <div className={styles.heroDividerDot} />
            <div className={styles.heroDividerLine} />
          </div>

          <div className={styles.heroBadge}>
            <span className={styles.liveDot} />
            Soft Opening Menu
          </div>
        </div>

        {/* Stats strip */}
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <div className={styles.heroStatNum}>{totalItems}+</div>
            <div className={styles.heroStatLabel}>Menu Items</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatNum}>{totalCats}</div>
            <div className={styles.heroStatLabel}>Categories</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatNum}>2$</div>
            <div className={styles.heroStatLabel}>Starting From</div>
          </div>
        </div>
      </header>

      {/* ══ Search ══════════════════════════════ */}
      <div className={styles.searchWrap}>
        <div className={styles.searchInner}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="search"
            className={styles.searchBar}
            placeholder="Search items in English or Arabic…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
      </div>

      {/* ══ Category Tab Bar ═════════════════════ */}
      <nav className={styles.categoryNav} aria-label="Menu categories">
        <div className={styles.navInner} ref={navRef}>
          {menu.map((cat) => (
            <button
              key={cat.id}
              data-id={cat.id}
              className={`${styles.categoryTab} ${activeTab === cat.id ? styles.active : ""}`}
              onClick={() => scrollTo(cat.id)}
            >
              {cat.icon && <span className={styles.tabEmoji}>{cat.icon}</span>}
              {cat.nameEn}
            </button>
          ))}
        </div>
      </nav>

      {/* ══ Content ══════════════════════════════ */}
      <main className={styles.content}>
        {anyResult ? (
          menu.map((cat, idx) => (
            <CategorySection key={cat.id} cat={cat} index={idx} q={q} />
          ))
        ) : (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>☕</span>
            <p className={styles.noResultsText}>No items found</p>
            <p>Try searching in English or Arabic</p>
          </div>
        )}
      </main>

      {/* ══ Footer ════════════════════════════════ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerDivider}>
            <div className={styles.footerDividerLine} />
            <span className={styles.footerLeafIcon}>🌿</span>
            <div className={styles.footerDividerLine} />
          </div>
          <p className={styles.footerBrand}>Debsy</p>
          <p className={styles.footerSub}>Village</p>
          <span className={styles.footerIG}>📸 @debsy.village</span>
          <p className={styles.footerCopy}>© 2025 Debsy Village. All rights reserved.</p>
        </div>
      </footer>

      {/* ══ Admin FAB ════════════════════════════ */}
      <Link href="/login" className={styles.adminFab} title="Admin Panel">
        ⚙️
      </Link>
    </div>
  );
}
