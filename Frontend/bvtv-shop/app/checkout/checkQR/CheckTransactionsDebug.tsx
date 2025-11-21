"use client";

import React, { useState } from "react";
import { fetchTransactionsFromEnv } from "./checkCompleted";

export default function CheckTransactionsDebug() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onClick = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetchTransactionsFromEnv();
      setResult(res);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-3 border rounded bg-white">
      <div className="flex items-center gap-3">
        <button onClick={onClick} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Đang tải...' : 'Test lấy giao dịch (Casso)'}
        </button>
        <div className="text-sm text-gray-600">(Sử dụng env: <code>NEXT_PUBLIC_API_GET_TRANSACTION</code> và <code>NEXT_PUBLIC_CASSO_API_KEY</code>)</div>
      </div>

      {result && (
        <pre className="mt-3 max-h-80 overflow-auto text-xs bg-gray-50 p-3 rounded border">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
