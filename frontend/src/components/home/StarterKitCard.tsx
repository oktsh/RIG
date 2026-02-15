export default function StarterKitCard() {
  return (
    <div className="mb-20">
      <div className="card-base bg-white border-2 border-black flex flex-col md:flex-row group">
        <div className="flex-1 p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r-2 border-black">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="bg-black text-white text-[10px] px-2 py-1 font-mono uppercase font-bold">
                STARTER KIT
              </span>
              <span className="font-mono text-[10px] text-black border border-black px-2 py-1 uppercase font-bold">
                RECOMMENDED
              </span>
            </div>

            <h2 className="text-5xl font-display font-bold text-black mb-6 tracking-tighter leading-none">
              RIG Full-Stack
              <br />
              Стартер
            </h2>

            <p className="text-lg text-[#444] leading-relaxed mb-8 font-medium">
              Предконфигурированный boilerplate с AI context rules, Tailwind,
              shadcn/ui. Создан для скорости.
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              <span className="font-mono text-[10px] bg-[#F0F0F0] border border-black px-3 py-1 text-black font-bold uppercase">
                NEXT.JS 14
              </span>
              <span className="font-mono text-[10px] bg-[#F0F0F0] border border-black px-3 py-1 text-black font-bold uppercase">
                TYPESCRIPT
              </span>
              <span className="font-mono text-[10px] bg-[#F0F0F0] border border-black px-3 py-1 text-black font-bold uppercase">
                TAILWIND
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="btn-primary px-8 py-4 text-xs font-bold border border-black">
              Развернуть
            </button>
            <button className="btn-outline px-8 py-4 text-xs font-bold border border-black">
              GitHub
            </button>
          </div>
        </div>

        <div className="w-full md:w-[40%] bg-[#F5F5F5] relative flex flex-col items-center justify-center p-12 overflow-hidden">
          <div className="w-full h-full border border-black bg-white relative p-4 flex flex-col gap-4 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
            <div className="w-full h-8 border border-black bg-[#E5E5E5] flex items-center px-2 gap-2">
              <div className="w-2 h-2 rounded-full border border-black bg-white"></div>
              <div className="w-2 h-2 rounded-full border border-black bg-white"></div>
            </div>
            <div className="flex-1 border border-black bg-[#FAFAFA] flex items-center justify-center">
              <span className="font-display text-6xl font-bold text-[#DDD]">
                RIG
              </span>
            </div>
            <div className="h-16 border border-black bg-[#FFE600] flex items-center justify-center">
              <span className="font-mono text-xs font-bold uppercase">
                System Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
