async function getTransactions(apiUrl, apiKey) {
  const response = await fetch(apiUrl,{
    headers: {
        Authorization: `Apikey ${apiKey}`,
        'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  console.log('getTransactions data', data);
  return data;
}

// Helper that reads configuration from environment variables and fetches transactions.
// WARNING: Exposing API keys to the browser is insecure. Use server-side proxy in production.
export async function fetchTransactionsFromEnv() {
  // Client-side code can only access env vars that start with NEXT_PUBLIC_
  // For local testing, set `NEXT_PUBLIC_API_GET_TRANSACTION` and `NEXT_PUBLIC_API_CHECK_BANK` (or NEXT_PUBLIC_CASSO_API_KEY)
  const apiUrl = process.env.NEXT_PUBLIC_API_GET_TRANSACTION;
  const apiKey = process.env.NEXT_PUBLIC_CASSO_API_KEY;

  if (!apiUrl) {
    console.warn('API_GET_TRANSACTION not set in env (set NEXT_PUBLIC_API_GET_TRANSACTION for client-side testing)');
    return { error: 'missing_api_url' };
  }
  if (!apiKey) {
    console.warn('CASSO API key not set in env (set NEXT_PUBLIC_API_CHECK_BANK or NEXT_PUBLIC_CASSO_API_KEY for client-side testing)');
    return { error: 'missing_api_key' };
  }

  try {
    const result = await getTransactions(apiUrl, apiKey);
    return result;
  } catch (err) {
    console.error('fetchTransactionsFromEnv error', err);
    return { error: 'fetch_failed', detail: String(err) };
  }
}