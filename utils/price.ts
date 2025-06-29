export function formatPrice(value: number, currency: string = "KES"): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
  }).format(value);
}
