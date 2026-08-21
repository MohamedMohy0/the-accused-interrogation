import { useCallback, useEffect, useState } from "react";

const AD_SCRIPT_URL =
  "https://pl30949910.effectivecpmnetwork.com/086266f00be5b2e02b4068a031be6966/invoke.js";

/** فحص مزدوج: عنصر طُعم + طلب سكربت إعلانات. لا نعتبره حجبًا إلا إذا فشل الاثنان،
 *  حتى لا يظهر التحذير بالخطأ داخل متصفح فيسبوك أو عند بطء الشبكة. */
async function detectAdblock(): Promise<boolean> {
  const bait = document.createElement("div");
  bait.className = "adsbox ad-banner ad-placement pub_300x250 text-ad";
  bait.style.cssText = "position:absolute;left:-9999px;top:-9999px;height:60px;width:300px;";
  document.body.appendChild(bait);
  await new Promise((r) => window.setTimeout(r, 120));
  const style = window.getComputedStyle(bait);
  const baitBlocked =
    bait.offsetHeight === 0 || style.display === "none" || style.visibility === "hidden";
  bait.remove();

  let scriptBlocked = false;
  try {
    await fetch(AD_SCRIPT_URL, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
    });
  } catch {
    scriptBlocked = true;
  }

  return baitBlocked && scriptBlocked;
}

export function AdblockGate({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(false);

  const run = useCallback(() => {
    setChecking(true);
    detectAdblock()
      .then(setBlocked)
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  if (blocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="card-soft max-w-md p-6 text-center">
          <p className="text-xs font-black tracking-widest text-danger">مانع الإعلانات يعمل</p>
          <h1 className="mt-2 text-2xl font-black">أوقف مانع الإعلانات لتبدأ اللعب</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            اللعبة مجانية بالكامل وتعتمد على الإعلانات. من فضلك عطّل مانع الإعلانات لهذا الموقع ثم
            اضغط «أعدت المحاولة».
          </p>
          <button
            onClick={run}
            disabled={checking}
            className="mt-6 min-h-[52px] w-full rounded-2xl bg-primary px-6 font-extrabold text-primary-foreground disabled:opacity-60"
          >
            {checking ? "جارٍ الفحص…" : "أعدت المحاولة"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
