type ScaleName = {
  singular: string;
  dual: string;
  plural: string;
};

const ONES = [
  "صفر",
  "واحد",
  "اثنان",
  "ثلاثة",
  "أربعة",
  "خمسة",
  "ستة",
  "سبعة",
  "ثمانية",
  "تسعة",
];

const TENS = [
  "",
  "عشرة",
  "عشرون",
  "ثلاثون",
  "أربعون",
  "خمسون",
  "ستون",
  "سبعون",
  "ثمانون",
  "تسعون",
];

const TEENS = [
  "عشرة",
  "أحد عشر",
  "اثنا عشر",
  "ثلاثة عشر",
  "أربعة عشر",
  "خمسة عشر",
  "ستة عشر",
  "سبعة عشر",
  "ثمانية عشر",
  "تسعة عشر",
];

const HUNDREDS = [
  "",
  "مائة",
  "مائتان",
  "ثلاثمائة",
  "أربعمائة",
  "خمسمائة",
  "ستمائة",
  "سبعمائة",
  "ثمانمائة",
  "تسعمائة",
];

const SCALES: ScaleName[] = [
  { singular: "", dual: "", plural: "" }, // units
  { singular: "ألف", dual: "ألفان", plural: "آلاف" },
  { singular: "مليون", dual: "مليونان", plural: "ملايين" },
  { singular: "مليار", dual: "ملياران", plural: "مليارات" },
];

const joinWithAnd = (parts: string[]): string => parts.filter(Boolean).join(" و ");

const threeDigitsToWords = (n: number): string => {
  if (n === 0) return "";
  const hundred = Math.floor(n / 100);
  const rest = n % 100;

  const parts: string[] = [];
  if (hundred > 0) parts.push(HUNDREDS[hundred]);

  if (rest > 0) {
    if (rest < 10) {
      parts.push(ONES[rest]);
    } else if (rest < 20) {
      parts.push(TEENS[rest - 10]);
    } else {
      const ones = rest % 10;
      const tens = Math.floor(rest / 10);
      if (ones > 0) parts.push(ONES[ones]);
      parts.push(TENS[tens]);
    }
  }

  return joinWithAnd(parts);
};

const scaleNameFor = (scaleIndex: number, groupValue: number): string => {
  const scale = SCALES[scaleIndex];
  if (!scale || scaleIndex === 0) return "";

  if (groupValue === 1) return scale.singular;
  if (groupValue === 2) return scale.dual;
  if (groupValue >= 3 && groupValue <= 10) return scale.plural;
  return scale.singular;
};

const integerToArabicWords = (n: number): string => {
  if (n === 0) return ONES[0];

  const parts: string[] = [];
  let remaining = n;
  let scaleIndex = 0;

  while (remaining > 0) {
    const group = remaining % 1000;
    if (group > 0) {
      const groupWords = threeDigitsToWords(group);
      const scaleName = scaleNameFor(scaleIndex, group);

      if (scaleIndex === 0) {
        parts.push(groupWords);
      } else if (group === 1 || group === 2) {
        parts.push(scaleName);
      } else {
        parts.push(joinWithAnd([groupWords, scaleName]));
      }
    }
    remaining = Math.floor(remaining / 1000);
    scaleIndex += 1;
  }

  return joinWithAnd(parts.reverse());
};

export const amountToArabicWords = (amount: number): string => {
  if (!Number.isFinite(amount)) return "";

  const dinars = Math.trunc(Math.floor(amount + 1e-9));
  const dirhams = Math.round((amount - dinars) * 1000);

  const dinarWords = integerToArabicWords(Math.abs(dinars));
  const dirhamWords = integerToArabicWords(Math.abs(dirhams));

  const parts: string[] = [];
  parts.push(`${dinarWords} دينار`);

  if (dirhams > 0) {
    parts.push(`${dirhamWords} درهم`);
  }

  return `${joinWithAnd(parts)} فقط لا غير`;
};
