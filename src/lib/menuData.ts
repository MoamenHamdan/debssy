export interface MenuItem {
  id: string;
  nameEn: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  sortOrder?: number;
}

export interface MenuCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  icon?: string;
  sortOrder: number;
  items: MenuItem[];
  subcategories?: MenuSubcategory[];
}

export interface MenuSubcategory {
  id: string;
  nameEn: string;
  nameAr: string;
  items: MenuItem[];
}

export const INITIAL_MENU_DATA: MenuCategory[] = [
  {
    id: "village-signature",
    nameEn: "Village Signature",
    nameAr: "توقيع القرية",
    sortOrder: 1,
    items: [
      {
        id: "vs-1",
        nameEn: "The Green Cloud",
        nameAr: "السحابة الخضراء",
        descriptionEn: "M2ay2et, Avocado, Carob Molasses, Almond",
        descriptionAr: "مغية، أفوكادو، دبس الخروب، لوز",
        price: 7,
        available: true,
      },
    ],
  },
  {
    id: "water",
    nameEn: "Water",
    nameAr: "المياه",
    sortOrder: 2,
    items: [
      { id: "w-1", nameEn: "Small Water 0.5L", nameAr: "مياه صغيرة 0.5 لن", price: 1.5, available: true },
      { id: "w-2", nameEn: "Large Water 1.5L", nameAr: "مياه كبيرة 1.5 لن", price: 3, available: true },
      { id: "w-3", nameEn: "Sparkling Water", nameAr: "مياه غازية", price: 2, available: true },
    ],
  },
  {
    id: "desserts",
    nameEn: "Desserts",
    nameAr: "الحلى",
    sortOrder: 3,
    items: [
      {
        id: "d-1",
        nameEn: "M2ay2et Sette",
        nameAr: "مفية ستي",
        descriptionEn: "Traditional Lebanese m2ay2a dessert, Carob Biscuits, Almond, Chocolate Syrup",
        descriptionAr: "الحلية اللبنانية التقليدية بسكويت الخروب، اللوز، وصوص الشوكولاتة",
        price: 7,
        available: true,
      },
      {
        id: "d-2",
        nameEn: "Village Cream",
        nameAr: "كريمة القرية",
        descriptionEn: "Merry Cream made with carob molasses",
        descriptionAr: "ميري كريم مصنوع بدبس الخروب",
        price: 3,
        available: true,
      },
      {
        id: "d-3",
        nameEn: "The Sweet Duo",
        nameAr: "الثنائي الحلى",
        descriptionEn: "Merry cream made with carob molasses + Mimi's cookie",
        descriptionAr: "ميري كريم مصنوع من الخروب مع كوكي ميمي",
        price: 5,
        available: true,
      },
    ],
  },
  {
    id: "hot-drinks",
    nameEn: "Hot Drinks",
    nameAr: "المشروبات الساخنة",
    sortOrder: 4,
    items: [
      { id: "hd-1", nameEn: "Turkish Coffee", nameAr: "قهوة تركية", price: 2, available: true },
      { id: "hd-2", nameEn: "Ragwa for 1", nameAr: "رغوة لشخص واحد", price: 4, available: true },
      { id: "hd-3", nameEn: "Ragwa for 2", nameAr: "رغوة لشخصين", price: 4, available: true },
      { id: "hd-4", nameEn: "Ragwa for 6", nameAr: "رغوة لعائلة أشخاص", price: 7, available: true },
      { id: "hd-5", nameEn: "Ragwa for 8", nameAr: "رغوة للعائلة أشخاص", price: 14, available: true },
      { id: "hd-6", nameEn: "Ragwa for 11", nameAr: "رغوة لحدا عشر شخص", price: 18, available: true },
      { id: "hd-7", nameEn: "Cappuccino", nameAr: "كابتشينو", price: 3.5, available: true },
      { id: "hd-8", nameEn: "Mocha", nameAr: "موكا", price: 3.5, available: true },
      { id: "hd-9", nameEn: "Nescafé Gold", nameAr: "نسكافيه جولد", price: 3, available: true },
      { id: "hd-10", nameEn: "Nescafé Red Mug", nameAr: "نسكافيه رد ماج", price: 3, available: true },
      { id: "hd-11", nameEn: "Nescafé 3in1", nameAr: "نسكافيه 3 في 1", price: 2.5, available: true },
      { id: "hd-12", nameEn: "Nescafé 3in1 Creamy", nameAr: "نسكافيه 3 في 1 كريمي", price: 2.5, available: true },
      { id: "hd-13", nameEn: "Café Latte", nameAr: "كافيه لاتيه", price: 3.5, available: true },
      { id: "hd-14", nameEn: "Vanilla Latte", nameAr: "فانيلا لاتيه", price: 5, available: true },
      { id: "hd-15", nameEn: "Caramel Latte", nameAr: "كراميل لاتيه", price: 5, available: true },
      { id: "hd-16", nameEn: "Flat White", nameAr: "فلات وايت", price: 4, available: true },
      { id: "hd-17", nameEn: "Hot Chocolate", nameAr: "هوت شوكلايت", price: 4, available: true },
    ],
  },
  {
    id: "soft-drinks",
    nameEn: "Soft Drinks",
    nameAr: "المشروبات الغازية",
    sortOrder: 5,
    items: [
      { id: "sd-1", nameEn: "Ice Tea Mango Tango", nameAr: "آيس تي مانجو تانغو", price: 2.5, available: true },
      { id: "sd-2", nameEn: "Ice Tea Strawberry Ice Dream", nameAr: "آيس تي ستروبيري آيس دريم", price: 2.5, available: true },
      { id: "sd-3", nameEn: "Ice Tea Red Fruits", nameAr: "آيس تي رد فروتس", price: 2.5, available: true },
      { id: "sd-4", nameEn: "Ice Tea Peach", nameAr: "آيس تي خوخ", price: 2.5, available: true },
      { id: "sd-5", nameEn: "7UP Zero Sugar", nameAr: "سفن أب زيرو سكر", price: 2.5, available: true },
      { id: "sd-6", nameEn: "Ice Tea Red Fruits Zero Sugar", nameAr: "آيس تي رد فروتس زيرو سكر", price: 2.5, available: true },
      { id: "sd-7", nameEn: "Pepsi Extra Fizz", nameAr: "بيبسي إكسترا فيز", price: 2.5, available: true },
    ],
  },
  {
    id: "cold-drinks",
    nameEn: "Cold Drinks",
    nameAr: "المشروبات الباردة",
    sortOrder: 6,
    subcategories: [
      {
        id: "fresh-juices",
        nameEn: "Fresh Juices",
        nameAr: "العصائر الطازجة",
        items: [
          { id: "fj-1", nameEn: "Lemonade", nameAr: "ليموناضة", price: 4, available: true },
          { id: "fj-2", nameEn: "Orange & Carrot Juice", nameAr: "عصير برتقال وجزر", price: 4, available: true },
          { id: "fj-3", nameEn: "Carrot Juice", nameAr: "عصير جزر", price: 4, available: true },
          { id: "fj-4", nameEn: "Watermelon Juice", nameAr: "عصير بطيخ", price: 4, available: true },
          { id: "fj-5", nameEn: "Carob Juice", nameAr: "عصير خروب", price: 5, available: true },
          { id: "fj-6", nameEn: "Minted Lemonade", nameAr: "ليموناضة بالنعناع", price: 5, available: true },
          { id: "fj-7", nameEn: "Minted Lemonade with Carob Juice", nameAr: "ليموناضة بالنعناع مع عصير الخروب", price: 5, available: true },
          { id: "fj-8", nameEn: "Strawberry Juice", nameAr: "عصير فراولة", price: 5, available: true },
        ],
      },
      {
        id: "milkshakes",
        nameEn: "Milkshakes",
        nameAr: "ميلك شيك",
        items: [
          { id: "ms-1", nameEn: "Chocolate Milkshake", nameAr: "شوكولاتة ميلك شيك", price: 6, available: true },
          { id: "ms-2", nameEn: "Hazelnut Milkshake", nameAr: "ميلك شيك بندق", price: 6, available: true },
          { id: "ms-3", nameEn: "Banana Milkshake", nameAr: "ميلك شيك موز", price: 6, available: true },
          { id: "ms-4", nameEn: "Strawberry Milkshake", nameAr: "ميلك شيك فراولة", price: 6, available: true },
          { id: "ms-5", nameEn: "Banana & Strawberry Milkshake", nameAr: "ميلك شيك موز وفراولة", price: 6, available: true },
          { id: "ms-6", nameEn: "Lotus Milkshake", nameAr: "ميلك شيك لوتس", price: 6, available: true },
          { id: "ms-7", nameEn: "Vanilla Milkshake", nameAr: "ميلك شيك فانيليا", price: 6, available: true },
        ],
      },
      {
        id: "iced-drinks",
        nameEn: "Iced Drinks",
        nameAr: "المشروبات المثلجة",
        items: [
          { id: "id-1", nameEn: "Iced Coffee", nameAr: "قهوة مثلجة", price: 4, available: true },
          { id: "id-2", nameEn: "Iced Caramel Latte", nameAr: "لاتيه كراميل مثلج", price: 5, available: true },
          { id: "id-3", nameEn: "Iced Vanilla Latte", nameAr: "لاتيه فانيليا مثلج", price: 5, available: true },
          { id: "id-4", nameEn: "Vanilla Frappe", nameAr: "فانيليا فرابيه", price: 5, available: true },
          { id: "id-5", nameEn: "Caramel Frappe", nameAr: "كراميل فرابيه", price: 5, available: true },
          { id: "id-6", nameEn: "Iced Mocha", nameAr: "موكا مثلجة", price: 5, available: true },
        ],
      },
    ],
    items: [],
  },
  {
    id: "appetizers",
    nameEn: "Appetizers",
    nameAr: "المقبلات",
    sortOrder: 7,
    items: [
      { id: "ap-1", nameEn: "Small Fries", nameAr: "بطاطس صغيرة", price: 3.5, available: true },
      { id: "ap-2", nameEn: "Large Fries", nameAr: "بطاطس كبيرة", price: 5, available: true },
      { id: "ap-3", nameEn: "Small Curly Fries", nameAr: "بطاطس كيرلي صغيرة", price: 4, available: true },
      { id: "ap-4", nameEn: "Large Curly Fries", nameAr: "بطاطس كيرلي كبيرة", price: 7, available: true },
      { id: "ap-5", nameEn: "Mozzarella Sticks", nameAr: "موزاريلا ستيكس", price: 5, available: true },
    ],
  },
  {
    id: "sandwiches",
    nameEn: "Sandwiches",
    nameAr: "الساندويشات",
    sortOrder: 8,
    items: [
      { id: "sw-1", nameEn: "Fahita", nameAr: "فاهيتا", descriptionEn: "with a side of fries", price: 7, available: true },
      { id: "sw-2", nameEn: "Philadelphia", nameAr: "فيلادلفيا", descriptionEn: "with a side of fries", price: 8, available: true },
      { id: "sw-3", nameEn: "Tawouk", nameAr: "تاووق", descriptionEn: "with a side of fries", price: 7, available: true },
      { id: "sw-4", nameEn: "Francisco", nameAr: "فرانشيسكو", descriptionEn: "with a side of fries", price: 7, available: true },
    ],
  },
  {
    id: "saj",
    nameEn: "Saj",
    nameAr: "الصاج",
    sortOrder: 9,
    items: [
      { id: "sj-1", nameEn: "Zaatar", nameAr: "زعتر", price: 3.33, available: true },
      { id: "sj-2", nameEn: "Jebne", nameAr: "جبنة", price: 5, available: true },
      { id: "sj-3", nameEn: "Keshek", nameAr: "كشك", price: 5, available: true },
      { id: "sj-4", nameEn: "Jebne & Zaatar", nameAr: "جبنة وزعتر", price: 4, available: true },
      { id: "sj-5", nameEn: "Jebne & Keshek", nameAr: "جبنة وكشك", price: 5, available: true },
      { id: "sj-6", nameEn: "Nutella", nameAr: "نوتيلا", price: 5, available: true },
    ],
  },
  {
    id: "hookah",
    nameEn: "Hookah",
    nameAr: "الأراجيل",
    sortOrder: 10,
    items: [
      { id: "hk-1", nameEn: "Ajami", nameAr: "عجمي", price: 10, available: true },
      { id: "hk-2", nameEn: "Double Apple", nameAr: "تفاحتين", price: 8, available: true },
      { id: "hk-3", nameEn: "Lemon & Mint", nameAr: "ليمون ونعنع", price: 8, available: true },
      { id: "hk-4", nameEn: "Grape", nameAr: "عنب", price: 8, available: true },
      { id: "hk-5", nameEn: "Grape & Mint", nameAr: "عنب ونعنع", price: 8, available: true },
      { id: "hk-6", nameEn: "Blueberry", nameAr: "توت أزرق", price: 8, available: true },
      { id: "hk-7", nameEn: "Love", nameAr: "لوف", price: 8, available: true },
      { id: "hk-8", nameEn: "Bowl Renewal", nameAr: "تجديد رأس", price: 4, available: true },
    ],
  },
];
