import roomBg from "@/assets/room-bg.jpg";
import logo from "@/assets/logo.png";
import { playSfx, unlockAudio } from "@/lib/sound";

export function Welcome({ onEnter }: { onEnter: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        unlockAudio();
        playSfx("select");
        onEnter();
      }}
      className="relative block min-h-screen w-full overflow-hidden text-center"
    >
      <img
        src={roomBg}
        alt=""
        aria-hidden
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />

      <div className="anim-pop relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-6 px-6">
        <img
          src={logo}
          alt="شعار لعبة الاستجواب"
          width={1024}
          height={1024}
          className="anim-glow size-40 object-contain sm:size-56"
        />
        <h1 className="text-5xl font-black tracking-tight sm:text-7xl">الاستجـواب</h1>
        <p className="max-w-md text-sm leading-8 text-muted-foreground sm:text-base">
          غرفة واحدة، محقق يحفظ كل كلمة، وسرّ لا يجب أن يخرج منك.
        </p>
        <span className="mt-2 rounded-2xl bg-primary px-8 py-4 text-lg font-extrabold text-primary-foreground shadow-[var(--shadow-card)]">
          اضغط للدخول
        </span>
      </div>
    </button>
  );
}
