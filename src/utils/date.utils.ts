import i18next from "i18next";

export const getLocale = () => i18next.language === "en" ? "en-US" : "tr-TR";

export const getNow = () => new Date();

export const getDayName = (
  date: Date,
  locale: string = i18next.language === "en" ? "en-US" : "tr-TR"
) => {
  return date.toLocaleDateString(locale, { weekday: "long" });
};

export const toISODateString = (date: Date) => {
  return date.toISOString().split("T")[0];
};

export const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

export const isSameMonth = (d1: Date, d2: Date) => {
  return (
    d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
  );
};

export const getLast7Days = (
  locale: string = i18next.language === "en" ? "en-US" : "tr-TR"
) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateStr: toISODateString(d),
      dayName: d.toLocaleDateString(locale, { weekday: "short" }),
      originalDate: d,
    });
  }
  return days;
};

export const getLastWeek = () => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  return lastWeek;
};

export const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
};

export const getEndOfWeek = (date: Date) => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return endOfWeek;
};

export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(getLocale(), options);
};

export const formatDateTime = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(getLocale(), options);
};

export const formatTime = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(getLocale(), options);
};
