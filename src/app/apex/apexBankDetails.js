/** Bank transfer instructions — override via NEXT_PUBLIC_APEX_BANK_* env vars */

export const apexBankDetails = {
  bankName: process.env.NEXT_PUBLIC_APEX_BANK_NAME || "Meezan Bank",
  accountTitle:
    process.env.NEXT_PUBLIC_APEX_BANK_ACCOUNT_TITLE ||
    "AL SIDDIQUE SCHOLARS PUBLIC SCHOOL",
  accountNumber: process.env.NEXT_PUBLIC_APEX_BANK_ACCOUNT || "Contact support for account",
  iban: process.env.NEXT_PUBLIC_APEX_BANK_IBAN || "",
  branch: process.env.NEXT_PUBLIC_APEX_BANK_BRANCH || "Lahore",
  referenceHint: "Use your school name as payment reference",
};
