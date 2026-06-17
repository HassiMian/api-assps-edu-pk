"use client";

import { useEffect, useRef } from "react";

/** Auto-post hidden form to JazzCash hosted checkout. */
export default function JazzCashRedirect({ endpoint, fields, onError }) {
  const formRef = useRef(null);

  useEffect(() => {
    if (!endpoint || !fields || !formRef.current) {
      onError?.("Invalid JazzCash redirect payload");
      return;
    }
    formRef.current.submit();
  }, [endpoint, fields, onError]);

  if (!endpoint || !fields) return null;

  return (
    <form ref={formRef} method="POST" action={endpoint} className="hidden" aria-hidden>
      {Object.entries(fields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={String(value)} />
      ))}
    </form>
  );
}
