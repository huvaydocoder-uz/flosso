/** 18000 → "18 000" (thin non-breaking spaces, same in every locale) */
export const formatNumber = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
