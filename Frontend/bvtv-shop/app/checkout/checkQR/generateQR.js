// Utility to build VietQR quick-link image URL
// Usage: getVietQRImageUrl({ amount, addInfo })
export function getVietQRImageUrl({ amount = 0, addInfo = '' } = {}) {
  const bankId = process.env.NEXT_PUBLIC_BANK_NAME || '';
  const accountNo = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '';
  const accountName = process.env.NEXT_PUBLIC_BANK_OWNER || '';

  const cleanBankId = String(bankId).trim();
  const cleanAccountNo = String(accountNo).trim();
  const template = 'compact2.jpg';
  
  const base = `https://img.vietqr.io/image/${cleanBankId}-${cleanAccountNo}-${template}`;

  const params = new URLSearchParams();
  // include amount even when 0; round to integer VND
  if (amount != null) params.set('amount', String(Math.round(amount)));
  if (addInfo) params.set('addInfo', String(addInfo));
  if (accountName) params.set('accountName', String(accountName));

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export default getVietQRImageUrl;
