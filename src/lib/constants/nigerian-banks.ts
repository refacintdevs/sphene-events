// Static bank list from nigerian-context.md.
// Paystack /bank resolution is deferred to Unit 2.3 (AD-011).
export const NIGERIAN_BANKS = [
  "Access Bank",
  "Carbon",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "FCMB",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Mint",
  "Opay",
  "PalmPay",
  "Polaris Bank",
  "Providus Bank",
  "Sparkle",
  "Standard Chartered Bank",
  "Stanbic IBTC Bank",
  "Sterling Bank",
  "Union Bank",
  "United Bank for Africa (UBA)",
  "VBank",
  "Wema Bank",
  "Zenith Bank",
] as const satisfies readonly string[];

export type NigerianBank = (typeof NIGERIAN_BANKS)[number];
