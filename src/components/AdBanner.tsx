import { useEffect, useRef } from "react";

const CLIENT = import.meta.env["VITE_ADSENSE_CLIENT"] as string | undefined;
const SLOT = import.meta.env["VITE_ADSENSE_SLOT"] as string | undefined;

/** مساحة إعلانية ثابتة أعلى كل صفحة */
export function AdBanner() {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || pushed.current) return;
    pushed.current = true;

    const id = "adsbygoogle-js";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.async = true;
      s.crossOrigin = "anonymous";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
      document.head.appendChild(s);
    }

    // متصفحات فيسبوك/إنستغرام الداخلية تحمّل السكربت متأخرًا، لذا نعيد المحاولة
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      const w = window as unknown as { adsbygoogle?: unknown[] };
      if (w.adsbygoogle) {
        try {
          w.adsbygoogle.push({});
        } catch {
          /* تجاهل */
        }
        window.clearInterval(timer);
      } else if (tries > 20) {
        window.clearInterval(timer);
      }
    }, 400);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="w-full border-b border-border/60 bg-secondary/40">
      <div className="mx-auto w-full max-w-5xl px-3 py-2">
        <p className="mb-1 text-center text-[10px] font-bold tracking-widest text-muted-foreground">
          مساحة إعلانية
        </p>
        {CLIENT ? (
          <ins
            ref={ref}
            className="adsbygoogle block min-h-[90px] w-full"
            style={{ display: "block" }}
            data-ad-client={CLIENT}
            data-ad-slot={SLOT}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex min-h-[90px] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 text-xs font-bold text-muted-foreground">
            مساحة إعلانية 728×90
          </div>
        )}
      </div>
    </div>
  );
}
