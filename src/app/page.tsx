"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { MenuCategory, MenuItem, MenuSubcategory, INITIAL_MENU_DATA } from "@/lib/menuData";
import { getMenu } from "@/lib/firestore";

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
  q,
}: {
  cat: MenuCategory;
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
        {cat.icon && <span className={styles.catHeaderIcon}>{cat.icon}</span>}
        <div className={styles.catHeaderText}>
          <h2 className={styles.catNameEn}>{cat.nameEn}</h2>
          <p className={styles.catNameAr}>{cat.nameAr}</p>
        </div>
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

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function MenuPage() {
  // Show static data instantly — no loading screen
  const [menu, setMenu] = useState<MenuCategory[]>(INITIAL_MENU_DATA);
  const [activeTab, setActiveTab] = useState(INITIAL_MENU_DATA[0]?.id || "");
  const [searchQ, setSearchQ] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Silently fetch live data from Firestore in background
  useEffect(() => {
    getMenu()
      .then((data) => {
        if (data && data.length > 0) {
          setMenu(data);
          setActiveTab((prev) => prev || (data[0]?.id || ""));
        }
      })
      .catch((err) => console.error("Firestore fetch:", err));
  }, []);



  // Track page scroll to style the navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    const top = el.getBoundingClientRect().top + window.scrollY - 130;
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
      {/* ══ Top Navbar (SaaS Style) ═════════════════════ */}
      <nav className={`${styles.saasNav} ${scrolled ? styles.scrolled : ""}`} aria-label="Main navigation">
        <div className={styles.saasNavInner}>
          {/* Brand */}
          <div className={styles.saasBrand} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className={styles.saasBrandName}>Debsy Village</span>
          </div>



          {/* Desktop Actions — hidden from public */}

          {/* Mobile Hamburger Button */}
          <button
            className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerActive : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div className={`${styles.drawerOverlay} ${mobileMenuOpen ? styles.drawerOpen : ""}`} onClick={() => setMobileMenuOpen(false)}>
        <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.drawerHeader}>
            <span className={styles.drawerBrand}>Categories</span>
            <button className={styles.drawerClose} onClick={() => setMobileMenuOpen(false)}>×</button>
          </div>
          <div className={styles.drawerList}>
            {menu.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.drawerTab} ${activeTab === cat.id ? styles.active : ""}`}
                onClick={() => {
                  scrollTo(cat.id);
                  setMobileMenuOpen(false);
                }}
              >
                {cat.icon && <span className={styles.drawerTabIcon}>{cat.icon}</span>}
                <div className={styles.drawerTabTextWrap}>
                  <span className={styles.drawerTabEn}>{cat.nameEn}</span>
                  {cat.nameAr && <span className={styles.drawerTabAr}>{cat.nameAr}</span>}
                </div>
                {activeTab === cat.id && <span className={styles.drawerTabActiveDot} />}
              </button>
            ))}

          </div>
        </div>
      </div>

      {/* ══ Hero ══════════════════════════════ */}
      <header className={styles.hero}>
        <div className={styles.heroGrain} />
        <div className={styles.heroInner}>
          <h1 className={styles.brandName}>DEBSY</h1>
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

      {/* ══ Content ══════════════════════════════ */}
      <main className={styles.content}>
        {anyResult ? (
          menu.map((cat) => (
            <CategorySection key={cat.id} cat={cat} q={q} />
          ))
        ) : (
          <div className={styles.noResults}>
            <p className={styles.noResultsText}>No items found for "{searchQ}"</p>
            <p>Try searching in English or Arabic</p>
          </div>
        )}
      </main>

      {/* ══ Footer ════════════════════════════════ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerDivider}>
            <div className={styles.footerDividerLine} />
            <div className={styles.footerDividerDot} />
            <div className={styles.footerDividerLine} />
          </div>
          <p className={styles.footerBrand}>DEBSY</p>
          <p className={styles.footerSub}>Village</p>
          <a
            href="https://instagram.com/debsy_village"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerIG}
          >
            <svg className={styles.igIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="1.7" fill="none" />
              <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.7" fill="none" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
            @debsy_village
          </a>
          <p className={styles.footerCopy}>© 2026 Debsy Village. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
