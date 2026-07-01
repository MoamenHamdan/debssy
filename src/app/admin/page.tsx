"use client";

import React, { useState, useCallback } from "react";
import styles from "./page.module.css";
import { MenuCategory, MenuItem, INITIAL_MENU_DATA } from "@/lib/menuData";
import {
  seedMenuData,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
} from "@/lib/firestore";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Toast { msg: string; type: "ok" | "error" }
interface EditTarget { catId: string; item: MenuItem }
interface NewForm { nameEn: string; nameAr: string; descriptionEn: string; price: string }
const BLANK: NewForm = { nameEn: "", nameAr: "", descriptionEn: "", price: "" };

function fmt(p: number) {
  return p % 1 === 0 ? `${p}$` : `${p.toFixed(2)}$`;
}

function countItems(menu: MenuCategory[]) {
  return menu.reduce(
    (t, c) =>
      t +
      c.items.length +
      (c.subcategories?.reduce((s, sub) => s + sub.items.length, 0) || 0),
    0
  );
}

// ─── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({
  target,
  onSave,
  onClose,
}: {
  target: EditTarget;
  onSave: (catId: string, item: MenuItem) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<NewForm>({
    nameEn: target.item.nameEn,
    nameAr: target.item.nameAr || "",
    descriptionEn: target.item.descriptionEn || "",
    price: String(target.item.price),
  });
  const [saving, setSaving] = useState(false);
  const f = (k: keyof NewForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    const price = parseFloat(form.price);
    if (!form.nameEn.trim() || isNaN(price)) return;
    setSaving(true);
    await onSave(target.catId, {
      ...target.item,
      nameEn: form.nameEn.trim(),
      nameAr: form.nameAr.trim() || undefined,
      descriptionEn: form.descriptionEn.trim() || undefined,
      price,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHandle} />
        <h2 className={styles.modalTitle}>Edit Item</h2>

        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.full}`}>
            <label className={styles.formLabel}>Name (English) *</label>
            <input className={styles.formInput} value={form.nameEn} onChange={(e) => f("nameEn", e.target.value)} placeholder="e.g. Cappuccino" />
          </div>
          <div className={`${styles.formField} ${styles.full}`}>
            <label className={styles.formLabel}>Name (Arabic)</label>
            <input className={styles.formInput} value={form.nameAr} onChange={(e) => f("nameAr", e.target.value)} placeholder="الاسم بالعربي" dir="rtl" />
          </div>
          <div className={`${styles.formField} ${styles.full}`}>
            <label className={styles.formLabel}>Description (optional)</label>
            <input className={styles.formInput} value={form.descriptionEn} onChange={(e) => f("descriptionEn", e.target.value)} placeholder="Short description…" />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Price ($) *</label>
            <input className={styles.formInput} type="number" min="0" step="0.01" value={form.price} onChange={(e) => f("price", e.target.value)} placeholder="0.00" />
          </div>
        </div>

        <div className={styles.formActions} style={{ marginTop: 16 }}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.addBtn} onClick={save} disabled={saving || !form.nameEn || !form.price}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Item Row ───────────────────────────────────────────────────────────────
function ItemRow({
  item,
  catId,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  catId: string;
  onToggle: (c: string, i: string, v: boolean) => void;
  onEdit: (c: string, i: MenuItem) => void;
  onDelete: (c: string, i: string) => void;
}) {
  return (
    <div className={styles.itemRow}>
      <div className={styles.itemRowInfo}>
        <p className={styles.itemRowName}>{item.nameEn}</p>
        {item.nameAr && <p className={styles.itemRowAr}>{item.nameAr}</p>}
        {item.descriptionEn && <p className={styles.itemRowDesc}>{item.descriptionEn}</p>}
      </div>
      <span className={styles.itemRowPrice}>{fmt(item.price)}</span>

      <label className={styles.toggle} title={item.available ? "Available" : "Unavailable"}>
        <input type="checkbox" checked={item.available} onChange={(e) => onToggle(catId, item.id, e.target.checked)} />
        <span className={styles.slider} />
      </label>

      <div className={styles.rowActions}>
        <button className={styles.editBtn} onClick={() => onEdit(catId, item)}>Edit</button>
        <button className={styles.delBtn} onClick={() => onDelete(catId, item.id)}>Del</button>
      </div>
    </div>
  );
}

// ─── Category Card ──────────────────────────────────────────────────────────
function CatCard({
  cat,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
}: {
  cat: MenuCategory;
  onToggle: (c: string, i: string, v: boolean) => void;
  onEdit: (c: string, i: MenuItem) => void;
  onDelete: (c: string, i: string) => void;
  onAdd: (c: string, f: NewForm) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewForm>(BLANK);
  const [adding, setAdding] = useState(false);
  const f = (k: keyof NewForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const total =
    cat.items.length +
    (cat.subcategories?.reduce((s, sub) => s + sub.items.length, 0) || 0);

  const handleAdd = async () => {
    if (!form.nameEn.trim() || !form.price) return;
    setAdding(true);
    await onAdd(cat.id, form);
    setForm(BLANK);
    setShowForm(false);
    setAdding(false);
  };

  return (
    <div className={styles.catCard}>
      <div className={styles.catCardHead} onClick={() => setOpen((v) => !v)}>
        <span className={styles.catEmoji}>{cat.icon}</span>
        <div className={styles.catInfo}>
          <p className={styles.catTitleEn}>{cat.nameEn}</p>
          <p className={styles.catTitleAr}>{cat.nameAr}</p>
        </div>
        <span className={styles.catBadge}>{total} items</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>›</span>
      </div>

      {open && (
        <div className={styles.catCardBody}>
          {cat.items.map((item) => (
            <ItemRow key={item.id} item={item} catId={cat.id} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
          ))}

          {cat.subcategories?.map((sub) => (
            <div key={sub.id}>
              <div className={styles.subcatLabel}>
                <div className={styles.subcatBar} />
                <span className={styles.subcatText}>{sub.nameEn} · {sub.nameAr}</span>
              </div>
              {sub.items.map((item) => (
                <ItemRow key={item.id} item={item} catId={cat.id} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          ))}

          {showForm ? (
            <div className={styles.addFormWrap}>
              <p className={styles.addFormTitle}>Add New Item</p>
              <div className={styles.formGrid}>
                <div className={`${styles.formField} ${styles.full}`}>
                  <label className={styles.formLabel}>Name (English) *</label>
                  <input className={styles.formInput} value={form.nameEn} onChange={(e) => f("nameEn", e.target.value)} placeholder="e.g. Oat Latte" />
                </div>
                <div className={`${styles.formField} ${styles.full}`}>
                  <label className={styles.formLabel}>Name (Arabic)</label>
                  <input className={styles.formInput} value={form.nameAr} onChange={(e) => f("nameAr", e.target.value)} placeholder="الاسم بالعربي" dir="rtl" />
                </div>
                <div className={`${styles.formField} ${styles.full}`}>
                  <label className={styles.formLabel}>Description</label>
                  <input className={styles.formInput} value={form.descriptionEn} onChange={(e) => f("descriptionEn", e.target.value)} placeholder="Optional description…" />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Price ($) *</label>
                  <input className={styles.formInput} type="number" min="0" step="0.01" value={form.price} onChange={(e) => f("price", e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setForm(BLANK); }}>Cancel</button>
                <button className={styles.addBtn} onClick={handleAdd} disabled={adding || !form.nameEn || !form.price}>
                  {adding ? "Adding…" : "Add Item"}
                </button>
              </div>
            </div>
          ) : (
            <button className={styles.openAddBtn} onClick={() => setShowForm(true)}>
              ＋ Add item to {cat.nameEn}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Admin Page ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [menu, setMenu] = useState<MenuCategory[]>(INITIAL_MENU_DATA);
  const [toast, setToast] = useState<Toast | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const totalItems = countItems(menu);

  const notify = (msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Toggle ─────────────────────────────────────────────────────────
  const handleToggle = useCallback(async (catId: string, itemId: string, val: boolean) => {
    setMenu((prev) =>
      prev.map((c) =>
        c.id !== catId ? c : {
          ...c,
          items: c.items.map((i) => i.id === itemId ? { ...i, available: val } : i),
          subcategories: c.subcategories?.map((sub) => ({
            ...sub,
            items: sub.items.map((i) => i.id === itemId ? { ...i, available: val } : i),
          })),
        }
      )
    );
    try {
      await toggleItemAvailability(catId, itemId, val);
      notify(val ? "✓ Item is now available" : "Item marked unavailable");
    } catch { notify("Updated locally – sync Firebase to persist", "error"); }
  }, []);

  // ── Edit ───────────────────────────────────────────────────────────
  const handleEdit = useCallback((catId: string, item: MenuItem) => setEditTarget({ catId, item }), []);

  const handleSaveEdit = useCallback(async (catId: string, updated: MenuItem) => {
    setMenu((prev) =>
      prev.map((c) =>
        c.id !== catId ? c : {
          ...c,
          items: c.items.map((i) => i.id === updated.id ? updated : i),
          subcategories: c.subcategories?.map((sub) => ({
            ...sub,
            items: sub.items.map((i) => i.id === updated.id ? updated : i),
          })),
        }
      )
    );
    try { await updateMenuItem(catId, updated.id, updated); notify("✓ Item updated"); }
    catch { notify("Saved locally – sync Firebase to persist"); }
  }, []);

  // ── Delete ─────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (catId: string, itemId: string) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setMenu((prev) =>
      prev.map((c) =>
        c.id !== catId ? c : {
          ...c,
          items: c.items.filter((i) => i.id !== itemId),
          subcategories: c.subcategories?.map((sub) => ({
            ...sub,
            items: sub.items.filter((i) => i.id !== itemId),
          })),
        }
      )
    );
    try { await deleteMenuItem(catId, itemId); notify("Item deleted"); }
    catch { notify("Deleted locally – sync Firebase to persist"); }
  }, []);

  // ── Add ────────────────────────────────────────────────────────────
  const handleAdd = useCallback(async (catId: string, form: NewForm) => {
    const newItem: MenuItem = {
      id: `${catId}-${Date.now()}`,
      nameEn: form.nameEn.trim(),
      nameAr: form.nameAr.trim() || undefined,
      descriptionEn: form.descriptionEn.trim() || undefined,
      price: parseFloat(form.price),
      available: true,
    };
    setMenu((prev) =>
      prev.map((c) => c.id !== catId ? c : { ...c, items: [...c.items, newItem] })
    );
    try { await addMenuItem(catId, newItem); notify("✓ Item added"); }
    catch { notify("Added locally – sync Firebase to persist"); }
  }, []);

  // ── Seed ───────────────────────────────────────────────────────────
  const handleSeed = async () => {
    setSeeding(true);
    try { await seedMenuData(); setSeeded(true); notify("✓ Menu uploaded to Firestore!"); }
    catch { notify("Seed failed – check your Firebase config", "error"); }
    finally { setSeeding(false); }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Menu Management</h2>
        <p className={styles.pageSub}>Toggle availability, edit prices, or add new items</p>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{menu.length}</div>
          <div className={styles.statLabel}>Categories</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{totalItems}</div>
          <div className={styles.statLabel}>Total Items</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>
            {menu.reduce((t, c) => t + c.items.filter((i) => i.available).length + (c.subcategories?.reduce((s, sub) => s + sub.items.filter((i) => i.available).length, 0) || 0), 0)}
          </div>
          <div className={styles.statLabel}>Available</div>
        </div>
      </div>

      {/* Seed Banner */}
      {!seeded && (
        <div className={styles.seedBanner}>
          <span className={styles.seedIcon}>☁️</span>
          <div className={styles.seedContent}>
            <p className={styles.seedTitle}>Upload Menu to Firebase</p>
            <p className={styles.seedDesc}>Push all menu items to Firestore. Do this once after configuring your Firebase project.</p>
          </div>
          <button className={styles.seedBtn} onClick={handleSeed} disabled={seeding}>
            {seeding ? "Uploading…" : "Upload Now"}
          </button>
        </div>
      )}

      {/* Category Cards */}
      {menu.map((cat) => (
        <CatCard
          key={cat.id}
          cat={cat}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      ))}

      {/* Edit Modal */}
      {editTarget && (
        <EditModal target={editTarget} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
