/** Server-side bank transfer details (not exposed in client bundle). */

export function bankDetailsReady() {
  const account =
    process.env.APEX_BANK_ACCOUNT?.trim() ||
    process.env.NEXT_PUBLIC_APEX_BANK_ACCOUNT?.trim() ||
    "";
  const iban =
    process.env.APEX_BANK_IBAN?.trim() ||
    process.env.NEXT_PUBLIC_APEX_BANK_IBAN?.trim() ||
    "";
  return Boolean(account || iban);
}

export function getBankTransferDetails() {
  return {
    bankName: process.env.APEX_BANK_NAME?.trim() || "Meezan Bank",
    accountTitle:
      process.env.APEX_BANK_ACCOUNT_TITLE?.trim() ||
      "AL SIDDIQUE SCHOLARS PUBLIC SCHOOL",
    accountNumber:
      process.env.APEX_BANK_ACCOUNT?.trim() ||
      process.env.NEXT_PUBLIC_APEX_BANK_ACCOUNT?.trim() ||
      "",
    iban:
      process.env.APEX_BANK_IBAN?.trim() ||
      process.env.NEXT_PUBLIC_APEX_BANK_IBAN?.trim() ||
      "",
    branch:
      process.env.APEX_BANK_BRANCH?.trim() ||
      process.env.NEXT_PUBLIC_APEX_BANK_BRANCH?.trim() ||
      "Lahore",
    referenceHint: "Use your school name as payment reference",
  };
}
