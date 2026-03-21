import i18next from "i18next";

// Statik değerler yerine fonksiyon kullanıyoruz
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
