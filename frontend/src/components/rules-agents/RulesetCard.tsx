import { Ruleset } from "@/types";

interface RulesetCardProps {
  ruleset: Ruleset;
}

export default function RulesetCard({ ruleset }: RulesetCardProps) {
  return (
    <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-6">
        <span className="bg-black text-white text-[10px] font-bold px-2 py-1 font-mono uppercase">
          RULESET
        </span>
        <span className="text-[10px] font-mono font-bold text-black border border-black px-2 py-1">
          {ruleset.language}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-black mb-2 uppercase">
        {ruleset.title}
      </h3>
      <p className="text-sm text-[#444] mb-6 font-medium">{ruleset.desc}</p>
      <button className="w-full text-[11px] font-bold uppercase tracking-wider bg-[#F5F5F5] border border-black text-black px-4 py-3 hover:bg-[#FFE600] transition-colors">
        Посмотреть Правила
      </button>
    </div>
  );
}
