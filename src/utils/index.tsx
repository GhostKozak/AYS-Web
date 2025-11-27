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
