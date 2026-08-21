import { useCallback, useEffect, useState } from "react";

const AD_SCRIPT_URL =
  "https://pl30949910.effectivecpmnetwork.com/086266f00be5b2e02b4068a031be6966/invoke.js";

async function detectAdblock(): Promise<boolean> {
  // الفحص الأول: عنصر طُعم (Bait Element)
  // طريقة دقيقة ومباشرة لا تتأثر ببطء الشبكة
  const bait = document.createElement("div");
  bait.className = "adsbox ad-banner ad-placement pub_300x250 text-ad";
  bait.style.cssText =
    "position:absolute;left:-9999px;top:-9999px;height:60px;width:300px;";
  document.body.appendChild(bait);
  
  await new Promise((r) => window.setTimeout(r, 100));
  const style = window.getComputedStyle(bait);
  const baitBlocked =
    bait.offsetHeight === 0 || style.display === "none" || style.visibility === "hidden";
  bait.remove();

  // إذا تم كشف الحظر عن طريق الـ Bait، لا داعي لانتظار الشبكة
  if (baitBlocked) return true;

  // الفحص الثاني: محاولة تحميل سكربت الإعلانات
  const scriptBlocked = await new Promise<boolean>((resolve) => {
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = `${AD_SCRIPT_URL}?probe=${Date.now()}`;

    const done = (v: boolean) => {
      window.clearTimeout(timer);
      s.remove();
      resolve(v);
    };

    // رفع المهلة إلى 5 ثوانٍ لاستيعاب بطء شبكات المحمول (4G/5G)
    // إذا انتهت المهلة نعتبره غير محجوب لتجنب حظر زوار 4G/5G بالخطأ (false)
    const timer = window.setTimeout(() => done(false), 5000);

    s.onload = () => done(false);
    s.onerror = () => done(true); // يفشل فوراً عند وجود حظر DNS أو مانع إعلانات صريح
    document.head.appendChild(s);
  });

  return scriptBlocked;
}

export function AdblockGate({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  const run = useCallback(() => {
    setChecking(true);
    detectAdblock()
      .then((isBlocked) => {
        setBlocked(isBlocked);
      })
      .catch(() => {
        // في حال حدوث خطأ أثناء الفحص نتيح الدخول بدلاً من الحظر الخاطئ
        setBlocked(false);
      })
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  // أثناء الفحص الأول للموقع
  if (checking && !blocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm font-bold text-muted-foreground">جارٍ التحقق من إعدادات المتصفح…</p>
      </div>
    );
  }

  // إذا تم اكتشاف مانع الإعلانات
  if (blocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="card-soft max-w-md p-6 text-center">
          <p className="text-xs font-black tracking-widest text-danger">تنبيه: مانع الإعلانات مفعل</p>
          <h1 className="mt-2 text-2xl font-black">يرجى إيقاف مانع الإعلانات للبدء في اللعب</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            هذه اللعبة مجانية بالكامل وتعتمد على الإعلانات للاستمرار. يرجى تعطيل مانع الإعلانات (AdBlocker) لهذا الموقع ثم الضغط على زر إعادة المحاولة.
          </p>
          <button
            onClick={run}
            disabled={checking}
            className="mt-6 min-h-[52px] w-full rounded-2xl bg-primary px-6 font-extrabold text-primary-foreground transition-opacity disabled:opacity-60"
          >
            {checking ? "جارٍ الفحص…" : "أعدت المحاولة"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
