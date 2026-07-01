"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import { MenuCategory, MenuItem, INITIAL_MENU_DATA } from "@/lib/menuData";
import {
  seedMenuData,
  getMenu,
  addCategory,
  updateCategory,
  deleteCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  moveMenuItem,
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
  categories,
  onSave,
  onClose,
}: {
  target: EditTarget;
  categories: { id: string; nameEn: string }[];
  onSave: (oldCatId: string, newCatId: string, item: MenuItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<NewForm>({
    nameEn: target.item.nameEn,
    nameAr: target.item.nameAr || "",
    descriptionEn: target.item.descriptionEn || "",
    price: String(target.item.price),
  });
  const [targetCatId, setTargetCatId] = useState(target.catId);
  const f = (k: keyof NewForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = () => {
    const price = parseFloat(form.price);
    if (!form.nameEn.trim() || isNaN(price)) return;
    onSave(target.catId, targetCatId, {
      ...target.item,
      nameEn: form.nameEn.trim(),
      nameAr: form.nameAr.trim() || undefined,
      descriptionEn: form.descriptionEn.trim() || undefined,
      price,
    });
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
          <div className={styles.formField}>
            <label className={styles.formLabel}>Category *</label>
            <select className={styles.formInput} value={targetCatId} onChange={(e) => setTargetCatId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nameEn}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formActions} style={{ marginTop: 16 }}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.addBtn} onClick={save} disabled={!form.nameEn || !form.price}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Modal ──────────────────────────────────────────────────────────
interface CategoryModalProps {
  target?: MenuCategory;
  onSave: (cat: Omit<MenuCategory, "items" | "subcategories">) => void;
  onClose: () => void;
}

function CategoryModal({ target, onSave, onClose }: CategoryModalProps) {
  const [nameEn, setNameEn] = useState(target ? target.nameEn : "");
  const [nameAr, setNameAr] = useState(target ? target.nameAr : "");
  const [icon, setIcon] = useState(target ? target.icon || "" : "");

  const save = () => {
    if (!nameEn.trim()) return;
    const catId = target ? target.id : `cat-${Date.now()}`;
    onSave({
      id: catId,
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      icon: icon.trim() || "",
      sortOrder: target ? target.sortOrder : 1,
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHandle} />
        <h2 className={styles.modalTitle}>{target ? "Edit Category" : "Add Category"}</h2>

        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.full}`}>
            <label className={styles.formLabel}>Name (English) *</label>
            <input className={styles.formInput} value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. Hot Drinks" autoFocus />
          </div>
          <div className={`${styles.formField} ${styles.full}`}>
            <label className={styles.formLabel}>Name (Arabic)</label>
            <input className={styles.formInput} value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="المشروبات الساخنة" dir="rtl" />
          </div>
          <div className={`${styles.formField} ${styles.full}`}>
            <label className={styles.formLabel}>Icon (Emoji)</label>
            <input className={styles.formInput} value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. ☕" />
          </div>
        </div>

        <div className={styles.formActions} style={{ marginTop: 16 }}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.addBtn} onClick={save} disabled={!nameEn.trim()}>
            {target ? "Save Changes" : "Add Category"}
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
  onEditCat,
  onDeleteCat,
}: {
  cat: MenuCategory;
  onToggle: (c: string, i: string, v: boolean) => void;
  onEdit: (c: string, i: MenuItem) => void;
  onDelete: (c: string, i: string) => void;
  onAdd: (c: string, f: NewForm) => void;
  onEditCat: (cat: MenuCategory) => void;
  onDeleteCat: (catId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewForm>(BLANK);
  const f = (k: keyof NewForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const total =
    cat.items.length +
    (cat.subcategories?.reduce((s, sub) => s + sub.items.length, 0) || 0);

  const handleAdd = () => {
    if (!form.nameEn.trim() || !form.price) return;
    onAdd(cat.id, form);
    setForm(BLANK);
    setShowForm(false);
  };

  return (
    <div className={styles.catCard}>
      <div className={styles.catCardHead} onClick={() => setOpen((v) => !v)}>
        <span className={styles.catEmoji}>{cat.icon || "📂"}</span>
        <div className={styles.catInfo}>
          <p className={styles.catTitleEn}>{cat.nameEn}</p>
          <p className={styles.catTitleAr}>{cat.nameAr}</p>
        </div>
        <span className={styles.catBadge}>{total} items</span>
        <div className={styles.catActions} onClick={(e) => e.stopPropagation()}>
          <button className={styles.editBtn} style={{ padding: "4px 8px" }} onClick={() => onEditCat(cat)}>Edit</button>
          <button className={styles.delBtn} style={{ padding: "4px 8px" }} onClick={() => onDeleteCat(cat.id)}>Delete</button>
        </div>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} style={{ marginLeft: 8 }}>›</span>
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
                  <input className={styles.formInput} value={form.nameEn} onChange={(e) => f("nameEn", e.target.value)} placeholder="e.g. Oat Latte" autoFocus />
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
                <button className={styles.addBtn} onClick={handleAdd} disabled={!form.nameEn || !form.price}>
                  Add Item
                </button>
              </div>
            </div>
          ) : (
            <button className={styles.openAddBtn} onClick={() => setShowForm(true)}>
              + Add item to {cat.nameEn}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Admin Page ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  // Start with static data immediately — no loading screen
  const [menu, setMenu] = useState<MenuCategory[]>(INITIAL_MENU_DATA);
  const [toast, setToast] = useState<Toast | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editCatTarget, setEditCatTarget] = useState<MenuCategory | undefined>(undefined);
  const [showAddCat, setShowAddCat] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const notify = (msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch live data from Firestore in background (non-blocking)
  useEffect(() => {
    getMenu()
      .then((data) => {
        if (data && data.length > 0) {
          setMenu(data);
          setSeeded(true);
        }
      })
      .catch((err) => console.error("Firestore fetch error:", err));
  }, []);

  const totalItems = countItems(menu);

  // ── Toggle — fire & forget ──────────────────────────────────────────
  const handleToggle = useCallback((catId: string, itemId: string, val: boolean) => {
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
    toggleItemAvailability(catId, itemId, val)
      .then(() => notify(val ? "✓ Available" : "Marked unavailable"))
      .catch(() => notify("Sync to Firebase failed", "error"));
  }, []);

  // ── Edit item — fire & forget ───────────────────────────────────────
  const handleEdit = useCallback((catId: string, item: MenuItem) => setEditTarget({ catId, item }), []);

  const handleSaveEdit = useCallback((oldCatId: string, newCatId: string, updated: MenuItem) => {
    if (oldCatId !== newCatId) {
      setMenu((prev) =>
        prev.map((c) => {
          if (c.id === oldCatId) return {
            ...c,
            items: c.items.filter((i) => i.id !== updated.id),
            subcategories: c.subcategories?.map((sub) => ({ ...sub, items: sub.items.filter((i) => i.id !== updated.id) })),
          };
          if (c.id === newCatId) return { ...c, items: [...c.items, updated] };
          return c;
        })
      );
      moveMenuItem(oldCatId, newCatId, updated.id, updated)
        .then(() => notify("✓ Item moved"))
        .catch(() => notify("Firebase sync failed", "error"));
    } else {
      setMenu((prev) =>
        prev.map((c) =>
          c.id !== oldCatId ? c : {
            ...c,
            items: c.items.map((i) => i.id === updated.id ? updated : i),
            subcategories: c.subcategories?.map((sub) => ({ ...sub, items: sub.items.map((i) => i.id === updated.id ? updated : i) })),
          }
        )
      );
      updateMenuItem(oldCatId, updated.id, updated)
        .then(() => notify("✓ Item updated"))
        .catch(() => notify("Firebase sync failed", "error"));
    }
  }, []);

  // ── Delete item — fire & forget ─────────────────────────────────────
  const handleDelete = useCallback((catId: string, itemId: string) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setMenu((prev) =>
      prev.map((c) =>
        c.id !== catId ? c : {
          ...c,
          items: c.items.filter((i) => i.id !== itemId),
          subcategories: c.subcategories?.map((sub) => ({ ...sub, items: sub.items.filter((i) => i.id !== itemId) })),
        }
      )
    );
    deleteMenuItem(catId, itemId)
      .then(() => notify("Item deleted"))
      .catch(() => notify("Firebase sync failed", "error"));
  }, []);

  // ── Add item — fire & forget ────────────────────────────────────────
  const handleAdd = useCallback((catId: string, form: NewForm) => {
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
    addMenuItem(catId, newItem)
      .then(() => notify("✓ Item added"))
      .catch(() => notify("Firebase sync failed", "error"));
  }, []);

  // ── Category CRUD — fire & forget ───────────────────────────────────
  const handleSaveCategory = useCallback((catData: Omit<MenuCategory, "items" | "subcategories">) => {
    const isEdit = menu.some((c) => c.id === catData.id);

    if (isEdit) {
      const existing = menu.find((c) => c.id === catData.id);
      const finalCatData = { ...catData, sortOrder: existing ? existing.sortOrder : 1 };
      setMenu((prev) => prev.map((c) => c.id === finalCatData.id ? { ...c, ...finalCatData } : c));
      updateCategory(finalCatData.id, finalCatData)
        .then(() => notify("✓ Category updated"))
        .catch(() => notify("Firebase sync failed", "error"));
    } else {
      const finalCatData = { ...catData, sortOrder: menu.length + 1 };
      const newCat: MenuCategory = { ...finalCatData, items: [], subcategories: [] };
      setMenu((prev) => [...prev, newCat].sort((a, b) => a.sortOrder - b.sortOrder));
      addCategory(finalCatData)
        .then(() => notify("✓ Category added"))
        .catch(() => notify("Firebase sync failed", "error"));
    }
  }, [menu]);

  const handleDeleteCategory = useCallback((catId: string) => {
    if (!confirm("Delete this category? All items inside will also be removed.")) return;
    setMenu((prev) => prev.filter((c) => c.id !== catId));
    deleteCategory(catId)
      .then(() => notify("Category deleted"))
      .catch(() => notify("Firebase sync failed", "error"));
  }, []);

  // ── Seed ───────────────────────────────────────────────────────────
  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedMenuData();
      setSeeded(true);
      notify("✓ Menu uploaded to Firestore!");
      const data = await getMenu();
      if (data && data.length > 0) setMenu(data);
    } catch {
      notify("Seed failed – check your Firebase config", "error");
    } finally {
      setSeeding(false);
    }
  };

  const categoryOptions = menu.map((c) => ({ id: c.id, nameEn: c.nameEn }));

  return (
    <>
      <div className={styles.pageHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className={styles.pageTitle}>Menu Management</h2>
          <p className={styles.pageSub}>Add categories, edit items, and update details</p>
        </div>
        <button className={styles.seedBtn} onClick={() => setShowAddCat(true)}>
          + Add Category
        </button>
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
          onEditCat={(c) => setEditCatTarget(c)}
          onDeleteCat={handleDeleteCategory}
        />
      ))}

      {/* Edit Item Modal */}
      {editTarget && (
        <EditModal
          target={editTarget}
          categories={categoryOptions}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Add Category Modal */}
      {showAddCat && (
        <CategoryModal
          onSave={handleSaveCategory}
          onClose={() => setShowAddCat(false)}
        />
      )}

      {/* Edit Category Modal */}
      {editCatTarget && (
        <CategoryModal
          target={editCatTarget}
          onSave={handleSaveCategory}
          onClose={() => setEditCatTarget(undefined)}
        />
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
