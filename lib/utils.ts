export function formatLKR(amount: number): string {
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString('en-LK')}`;
}

export function formatLKRDecimal(amount: number): string {
  return `Rs. ${amount.toFixed(2)}`;
}
