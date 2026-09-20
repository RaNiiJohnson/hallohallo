import { useRef, useState } from "react";

export type SupportedLang = "fr" | "en" | "de";

/**
 * On-demand translation (lists): nothing happens until the user
 * selects a language. `run` calls the resource's Convex action.
 */
export function useManualTranslate<T>(
  run: (lang: SupportedLang) => Promise<T>,
  options?: { onError?: () => void },
) {
  const [result, setResult] = useState<{ lang: SupportedLang; data: T } | null>(
    null,
  );
  const [pendingLang, setPendingLang] = useState<SupportedLang | null>(null);
  const requestId = useRef(0); // ignore outdated responses (rapid clicks)

  const translate = async (lang: SupportedLang) => {
    const id = ++requestId.current;
    setPendingLang(lang);
    try {
      const data = await run(lang);
      if (id === requestId.current) setResult({ lang, data });
    } catch {
      if (id === requestId.current) options?.onError?.();
    } finally {
      if (id === requestId.current) setPendingLang(null);
    }
  };

  const reset = () => {
    requestId.current++;
    setResult(null);
    setPendingLang(null);
  };

  return {
    data: result?.data ?? null,
    activeLang: result?.lang ?? null,
    pendingLang,
    translate,
    reset,
  };
}
