export const dataEn = [
  {
    id: 1, // Added ID
    from: "First Account",
    to: "Second Account",
    value: 1000,
    commision: 1.5,
    description: "Payment for services",
    recurring: true,
    date: "2024-12-31",
  },
  {
    id: 2, // Added ID
    from: "Third Account",
    to: "Fourth Account",
    value: 2000,
    commision: 2,
    description: "Monthly subscription",
    recurring: false,
    date: "2025-06-30",
  },
];

export const dataAr = [
  {
    id: 1, // Added ID
    from: "0015798000",
    to: "0015798123",
    value: 1000,
    commision: 1.5,
    description: "دفعة مقابل خدمات",
    recurring: true,
    date: "2024-12-31",
  },
  {
    id: 2, // Added ID
    from: "0015798000",
    to: "0015798123",
    value: 2000,
    commision: 2,
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
  { key: "commision", label: "Commision" },
  { key: "description", label: "Description" },
  { key: "recurring", label: "Recurring Transfer" }, // Fixed key name to match data
  { key: "date", label: "Ends On" },
];

export const columnsAr = [
  { key: "id", label: "المعرف" }, // Added ID column
  { key: "from", label: "من حساب" },
  { key: "to", label: "إلى حساب" },
  { key: "value", label: "القيمة" },
  { key: "commision", label: "العمولة" },
  { key: "description", label: "الشرح" },
  { key: "recurring", label: "حوالة متكررة" },
  { key: "date", label: "تنتهي" },
];

export const dropdownOptions = ["متكررة", "غير متكررة"];

