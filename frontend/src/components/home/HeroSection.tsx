import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="flex flex-col text-left mb-24 relative">
      <div className="flex items-center gap-4 mb-8">
        <span className="font-mono text-xs font-bold bg-black text-white px-2 py-1">
          2025 RELEASE
        </span>
        <div className="h-[2px] bg-black w-24"></div>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">
          RIG — TOOLS FOR THE VIBE ERA
        </span>
      </div>

      <h1 className="text-[80px] md:text-[100px] font-display font-bold leading-[0.85] text-black mb-10 tracking-tighter uppercase">
        Инструменты
        <br />
        для <span className="text-[#888]">Вайб</span>-Кодинга
      </h1>

      <div className="flex flex-col md:flex-row gap-10 items-start md:items-center border-t-2 border-black pt-10">
        <p className="text-xl text-black font-medium max-w-xl leading-tight font-display">
          Единая оснастка для вайб-кодинга: промпты, гайды, шаблоны проектов и
          командные AI-инструменты.
        </p>
        <Link
          href="/dashboard"
          className="btn-primary px-10 py-5 text-sm tracking-widest border border-black shadow-[6px_6px_0px_#000]"
        >
          Начать Работу -&gt;
        </Link>
      </div>
    </div>
  );
}
