import type { DiffChange, DiffConfigItem } from "../types";
export { formatDate, formatDateTime, formatTime } from "./date.utils";

export const formatPhoneNumber = (phone_number: string): string => {
  if (!phone_number) return "";
  
  const clean = phone_number.replace(/\D/g, "");

  // Turkish numbers (+90 or 90 or 05...)
  if (clean.startsWith("90") || (clean.startsWith("5") && clean.length === 10)) {
    const numberPart = clean.startsWith("90") ? clean.substring(2) : clean;
    if (numberPart.length === 10) {
      return `+90 ${numberPart.slice(0, 3)} ${numberPart.slice(3, 6)} ${numberPart.slice(6, 8)} ${numberPart.slice(8, 10)}`;
    }
  }

  // Handle numbers starting with 0 (e.g. 0532...)
  if (clean.length === 11 && clean.startsWith("0")) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7, 9)} ${clean.slice(9, 11)}`;
  }

  // Generic international formatting for other countries
  if (phone_number.startsWith("+")) {
    // Keep the + and the first 2 or 3 digits as country code, then group the rest
    // This is a heuristic but works well for most cases
    if (clean.length > 10) {
      const countryCodeLen = clean.length - 10;
      return `+${clean.slice(0, countryCodeLen)} ${clean.slice(countryCodeLen, countryCodeLen + 3)} ${clean.slice(countryCodeLen + 3, countryCodeLen + 6)} ${clean.slice(countryCodeLen + 6, countryCodeLen + 8)} ${clean.slice(countryCodeLen + 8)}`;
    }
    // Very short or very long numbers, just add spaces every 3-4 digits
    return phone_number.replace(/(\+\d+)(\d{3})(\d{3})/, "$1 $2 $3 ");
  }

  return phone_number;
};

export const formatLicencePlate = (plate: string): string => {
  return plate
    .replace(/([A-Z]+)(\d+)/g, "$1 $2")
    .replace(/(\d+)([A-Z]+)/g, "$1 $2");
};

export const getUniqueOptions = <T,>(
  data: T[],
  selector: (item: T) => string | undefined,
  formatter?: (val: string) => string
) => {
  const uniqueValues = new Set(data.map(selector).filter(Boolean) as string[]);
  return Array.from(uniqueValues).map((val) => ({
    text: formatter ? formatter(val) : val,
    value: val,
  }));
};

export const calculateDiffs = <
  T extends Record<string, any>,
  F extends Record<string, any>
>(
  initialValues: T | undefined,
  currentValues: F | undefined,
  config: (keyof T | DiffConfigItem<T, F>)[]
): DiffChange[] => {
  if (!initialValues || !currentValues) return [];

  const changes: DiffChange[] = [];

  config.forEach((item) => {
    let key: string;
    let oldVal: any;
    let newVal: any;

    // A) Eğer item sadece bir string ise (Basit kullanım: ["name", "phone"])
    if (typeof item === "string") {
      key = item;
      oldVal = initialValues[item];
      newVal = currentValues[item];
    }
    // B) Eğer item bir obje ise (Gelişmiş kullanım)
    else {
      const conf = item as DiffConfigItem<T, F>;

      // Key ismini belirle (DiffViewer'da görünecek ID)
      key = (conf.label || conf.key || conf.dbKey) as string;

      // Eski Değeri Bul
      if (conf.getOldValue) {
        oldVal = conf.getOldValue(initialValues);
      } else {
        oldVal = initialValues[conf.dbKey || (conf.key as keyof T)];
      }

      // Yeni Değeri Bul
      if (conf.getNewValue) {
        newVal = conf.getNewValue(currentValues);
      } else {
        newVal = currentValues[conf.formKey || (conf.key as keyof F)]; // Cast gerekebilir
      }
    }

    // Eşitlik Kontrolü (Boşluk/Null yönetimi dahil)
    if (oldVal !== newVal && (oldVal || newVal)) {
      if (!oldVal && !newVal) return;
      changes.push({ key, oldValue: oldVal, newValue: newVal });
    }
  });

  return changes;
};


export const shortHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; 
  }
  return Math.abs(hash).toString(36);
};

export const safeErrorMessage = (err: any, fallback: string): string => {
  const msg = err?.response?.data?.message ?? err?.message ?? fallback;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) {
    return msg.map((m: any) => {
      if (typeof m === "string") return m;
      if (m?.constraints) return Object.values(m.constraints).join(", ");
      if (m?.property) return m.property;
      return JSON.stringify(m);
    }).join("; ");
  }
  return JSON.stringify(msg);
};
