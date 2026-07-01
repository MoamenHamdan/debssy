import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc,
  writeBatch,
  orderBy,
  query,
} from "firebase/firestore";
import { MenuCategory, MenuItem, INITIAL_MENU_DATA } from "./menuData";

const CATEGORIES_COLLECTION = "menuCategories";

/* ------------------------------------------------------------------ */
/*  Seed Firestore with initial data (run once from admin)              */
/* ------------------------------------------------------------------ */
export const seedMenuData = async () => {
  const batch = writeBatch(db);
  for (const cat of INITIAL_MENU_DATA) {
    const catRef = doc(db, CATEGORIES_COLLECTION, cat.id);
    const { items, subcategories, ...catMeta } = cat;
    batch.set(catRef, catMeta);

    // items sub-collection
    for (const item of items) {
      const itemRef = doc(db, CATEGORIES_COLLECTION, cat.id, "items", item.id);
      batch.set(itemRef, item);
    }

    // subcategory items
    if (subcategories) {
      for (const sub of subcategories) {
        const subRef = doc(db, CATEGORIES_COLLECTION, cat.id, "subcategories", sub.id);
        batch.set(subRef, { id: sub.id, nameEn: sub.nameEn, nameAr: sub.nameAr });
        for (const item of sub.items) {
          const itemRef = doc(
            db,
            CATEGORIES_COLLECTION,
            cat.id,
            "subcategories",
            sub.id,
            "items",
            item.id
          );
          batch.set(itemRef, item);
        }
      }
    }
  }
  await batch.commit();
};

/* ------------------------------------------------------------------ */
/*  Fetch full menu                                                     */
/* ------------------------------------------------------------------ */
export const getMenu = async (): Promise<MenuCategory[]> => {
  const catsSnap = await getDocs(
    query(collection(db, CATEGORIES_COLLECTION), orderBy("sortOrder"))
  );

  const categories: MenuCategory[] = [];

  for (const catDoc of catsSnap.docs) {
    const catData = catDoc.data() as Omit<MenuCategory, "items" | "subcategories">;

    // items
    const itemsSnap = await getDocs(collection(db, CATEGORIES_COLLECTION, catDoc.id, "items"));
    const items: MenuItem[] = itemsSnap.docs.map((d) => d.data() as MenuItem);

    // subcategories
    const subsSnap = await getDocs(
      collection(db, CATEGORIES_COLLECTION, catDoc.id, "subcategories")
    );
    const subcategories = await Promise.all(
      subsSnap.docs.map(async (subDoc) => {
        const subItemsSnap = await getDocs(
          collection(db, CATEGORIES_COLLECTION, catDoc.id, "subcategories", subDoc.id, "items")
        );
        return {
          ...subDoc.data(),
          items: subItemsSnap.docs.map((d) => d.data() as MenuItem),
        };
      })
    );

    categories.push({
      ...catData,
      items,
      subcategories: subcategories.length ? (subcategories as any) : undefined,
    });
  }

  return categories;
};

/* ------------------------------------------------------------------ */
/*  Category CRUD                                                       */
/* ------------------------------------------------------------------ */
export const updateCategory = async (
  catId: string,
  data: Partial<Omit<MenuCategory, "items" | "subcategories">>
) => {
  await updateDoc(doc(db, CATEGORIES_COLLECTION, catId), data);
};

/* ------------------------------------------------------------------ */
/*  Item CRUD                                                           */
/* ------------------------------------------------------------------ */
export const addMenuItem = async (catId: string, item: Omit<MenuItem, "id">) => {
  const ref = await addDoc(collection(db, CATEGORIES_COLLECTION, catId, "items"), item);
  return ref.id;
};

export const updateMenuItem = async (catId: string, itemId: string, data: Partial<MenuItem>) => {
  await updateDoc(doc(db, CATEGORIES_COLLECTION, catId, "items", itemId), data);
};

export const deleteMenuItem = async (catId: string, itemId: string) => {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, catId, "items", itemId));
};

export const toggleItemAvailability = async (
  catId: string,
  itemId: string,
  available: boolean
) => {
  await updateDoc(doc(db, CATEGORIES_COLLECTION, catId, "items", itemId), { available });
};
