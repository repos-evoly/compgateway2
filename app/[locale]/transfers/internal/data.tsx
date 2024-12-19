export const dataEn = [
  {
    id: 1, // Added ID
    from: "First Account",
    to: "Second Account",
    value: 1000,
    curr: "USD",
    description: "Payment for services",
    recurring: true,
    date: "2024-12-31",
  },
  {
    id: 2, // Added ID
    from: "Third Account",
    to: "Fourth Account",
    value: 2000,
    curr: "EUR",
    description: "Monthly subscription",
    recurring: false,
    date: "2025-06-30",
  },
];

export const dataAr = [
  {
    id: 1, // Added ID
    from: "الحساب الأول",
    to: "الحساب الثاني",
    value: 1000,
    curr: "دولار أمريكي",
    description: "دفعة مقابل خدمات",
    recurring: true,
    date: "2024-12-31",
  },
  {
    id: 2, // Added ID
    from: "الحساب الثالث",
    to: "الحساب الرابع",
    value: 2000,
    curr: "يورو",
    description: "اشتراك شهري",
    recurring: false,
    date: "2025-06-30",
  },
];

export const columnsEn = [
  { key: "id", label: "ID" }, // Added ID column
  { key: "from", label: "From Account" },
  { key: "to", label: "To Account" },
  { key: "value", label: "Value" },
  { key: "curr", label: "Currency" },
  { key: "description", label: "Description" },
  { key: "recurring", label: "Recurring Transfer" }, // Fixed key name to match data
  { key: "date", label: "Ends On" },
];

export const columnsAr = [
  { key: "id", label: "المعرف" }, // Added ID column
  { key: "from", label: "من حساب" },
  { key: "to", label: "إلى حساب" },
  { key: "value", label: "القيمة" },
  { key: "curr", label: "العملة" },
  { key: "description", label: "الشرح" },
  { key: "recurring", label: "حوالة متكررة" },
  { key: "date", label: "تنتهي" },
];

export const dropdownOptions = ["متكررة", "غير متكررة"];
