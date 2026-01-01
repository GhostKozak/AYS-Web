import type { NavigateFunction } from "react-router";
import { ROUTES, STORAGE_KEYS } from "../constants";
import type { DiffChange, DiffConfigItem } from "../types";

export const formatPhoneNumber = (phone_number: string): string => {
  const cleanNumber = String(phone_number).replace(/\D/g, "");

  if (cleanNumber.length === 11 && cleanNumber.startsWith("0")) {
    const [, countryCode, ...rest] = cleanNumber.split("");
    const areaCode = rest.slice(0, 3).join("");
    const prefix = rest.slice(3, 6).join("");
    const suffix = rest.slice(6, 8).join("");
    const lastTwo = rest.slice(8, 10).join("");

    return `${countryCode}${areaCode} ${prefix} ${suffix} ${lastTwo}`;
  }

  if (cleanNumber.length === 10) {
    const [, ...rest] = `0${cleanNumber}`.split("");
    const areaCode = rest.slice(0, 3).join("");
    const prefix = rest.slice(3, 6).join("");
    const suffix = rest.slice(6, 8).join("");
    const lastTwo = rest.slice(8, 10).join("");

    return `0${areaCode} ${prefix} ${suffix} ${lastTwo}`;
  }

  return phone_number;
};

export const formatLicencePlate = (plate: string): string => {
  return plate
    .replace(/([A-Z]+)(\d+)/g, "$1 $2")
    .replace(/(\d+)([A-Z]+)/g, "$1 $2");
};

export const checkTokenValidity = (navigate: NavigateFunction) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) return; // Token yoksa zaten sorun yok, Header boş gelecek

  try {
    // JWT Token'ın içindeki "expiration" (son kullanma) tarihini okuyoruz
    // Token yapısı: header.payload.signature (noktalarla ayrılır)
    const payloadBase64 = token.split(".")[1];

    if (!payloadBase64) throw new Error("Invalid token");

    // Base64 decode işlemi
    const decodedJson = atob(payloadBase64);
    const payload = JSON.parse(decodedJson);

    // Süre kontrolü (payload.exp saniye cinsindendir, 1000 ile çarpıp milisaniye yaparız)
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      // Süresi dolmuşsa temizle ve at
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      navigate(ROUTES.LOGIN);
    }
  } catch (error) {
    // Token bozuksa da temizle
    console.error("Token kontrol hatası:", error);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate(ROUTES.LOGIN);
  }
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
    if (oldVal != newVal && (oldVal || newVal)) {
      if (!oldVal && !newVal) return;
      changes.push({ key, oldValue: oldVal, newValue: newVal });
    }
  });

  return changes;
};
