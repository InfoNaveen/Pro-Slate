function randomHex(length: number): string {
  const chars = '0123456789abcdef';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function generateMockTxHash(): string {
  return '0xPS' + randomHex(38);
}

export async function simulateEscrowDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1500));
}
