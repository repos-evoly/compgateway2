export const dataEn = [
  {
    from: "First Account",
    to: "Second Account",
    value: 1000,
    curr: "USD",
    description: "Payment for services",
    rec: "Yes",
    ends: "2024-12-31",
  },
  {
    from: "Third Account",
    to: "Fourth Account",
    value: 2000,
    curr: "EUR",
    description: "Monthly subscription",
    rec: "No",
    ends: "2025-06-30",
  },
];

export const dataAr = [
  {
    from: "الحساب الأول",
    to: "الحساب الثاني",
    value: 1000,
    curr: "دولار أمريكي",
    description: "دفعة مقابل خدمات",
    rec: "نعم",
    ends: "2024-12-31",
  },
  {
    from: "الحساب الثالث",
    to: "الحساب الرابع",
    value: 2000,
    curr: "يورو",
    description: "اشتراك شهري",
    rec: "لا",
    ends: "2025-06-30",
  },
];

export const columnsEn = [
  { key: "from", label: "From Account" },
  { key: "to", label: "To Account" },
  { key: "value", label: "Value" },
  { key: "curr", label: "Currency" },
  { key: "description", label: "Description" },
  { key: "rec", label: "Recurring Transfer" },
  { key: "ends", label: "Ends On" },
];

export const columnsAr = [
  { key: "from", label: "من حساب" },
  { key: "to", label: "إلى حساب" },
  { key: "value", label: "القيمة" },
  { key: "curr", label: "العملة" },
  { key: "description", label: "الشرح" },
  { key: "rec", label: "حوالة متكررة" },
  { key: "ends", label: "تنتهي" },
];

export const dropdownOptions = ["متكررة", "غير متكررة"];
