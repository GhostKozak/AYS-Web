// Statik değerler yerine fonksiyon kullanıyoruz
export const getNow = () => new Date();

export const getDayName = (date: Date, locale: string = 'tr-TR') => {
  return date.toLocaleDateString(locale, { weekday: 'long' });
};

export const toISODateString = (date: Date) => {
  return date.toISOString().split('T')[0];
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
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

export const getLast7Days = (locale: string = 'tr-TR') => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateStr: toISODateString(d),
      dayName: d.toLocaleDateString(locale, { weekday: "short" }),
      originalDate: d
    });
  }
  return days;
};

export const getLastWeek = () => {
  const today = new Date();
  const lastWeek = new Date(today.setDate(today.getDate() - 7));
  return lastWeek;
};

export const getStartOfWeek = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

export const getEndOfWeek = (date: Date) => {
  const startOfWeek = getStartOfWeek(new Date(date));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return endOfWeek;
};
