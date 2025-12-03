import type { NavigateFunction } from "react-router";
import { ROUTES, STORAGE_KEYS } from "../constants";

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
