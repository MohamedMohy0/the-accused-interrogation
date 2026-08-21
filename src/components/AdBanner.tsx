import { useEffect, useRef } from "react";

const SCRIPT_URL =
  "https://pl30949910.effectivecpmnetwork.com/086266f00be5b2e02b4068a031be6966/invoke.js";
const CONTAINER_ID = "container-086266f00be5b2e02b4068a031be6966";

/** مساحة إعلانية ثابتة أعلى كل صفحة */
export function AdBanner() {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;

    const id = "effectivecpm-js";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.async = true;
      s.setAttribute("data-cfasync", "false");
      s.src = SCRIPT_URL;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div className="w-full border-b border-border/60 bg-secondary/40">
      <div className="mx-auto w-full max-w-5xl px-3 py-2">
        <p className="mb-1 text-center text-[10px] font-bold tracking-widest text-muted-foreground">
          مساحة إعلانية
        </p>
        <div id={CONTAINER_ID} className="min-h-[90px] w-full" />
      </div>
    </div>
  );
}
