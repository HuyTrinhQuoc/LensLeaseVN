/** Khớp backend `bookings.service.ts` PLATFORM_FEE_RATE */
export const PLATFORM_FEE_RATE = 0.08;

export function rentalLineSubtotal(pricePerDay: number, rentalDays: number, quantity: number): number {
  return pricePerDay * rentalDays * quantity;
}

export function platformFeeFromSubtotal(subTotal: number): number {
  return Math.round(subTotal * PLATFORM_FEE_RATE * 100) / 100;
}

export function lineTotalWithPlatformFee(pricePerDay: number, rentalDays: number, quantity: number): number {
  const sub = rentalLineSubtotal(pricePerDay, rentalDays, quantity);
  return sub + platformFeeFromSubtotal(sub);
}
