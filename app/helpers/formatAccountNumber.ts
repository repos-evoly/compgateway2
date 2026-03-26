export const formatAccountNumber = (value: string): string => {
  if (/^\d{4}-\d{6}-\d{3}$/.test(value)) {
    return value;
  }

  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length !== 13) {
    return value;
  }

  return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 10)}-${digitsOnly.slice(10)}`;
};
