import RulesetCard from "@/components/rules-agents/RulesetCard";
import AgentListItem from "@/components/rules-agents/AgentListItem";
import { rulesets } from "@/data/rulesets";
import { agents } from "@/data/agents";

export default function RulesAgentsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-10 py-10">
      <div className="fixed right-10 top-20 text-[200px] font-black text-[#F0F0F0] select-none pointer-events-none -z-10 leading-none font-display uppercase">
        RIG
      </div>

      <div className="mb-12 border-b-2 border-black pb-6">
        <h2 className="text-4xl font-bold text-black mb-2 uppercase">
          Правила Cursor
        </h2>
        <p className="text-[#555] font-medium">
          Контекстные правила для AI-ассистентов разработки.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {rulesets.map((ruleset) => (
          <RulesetCard key={ruleset.id} ruleset={ruleset} />
        ))}
      </div>

      <div className="mb-12 border-b-2 border-black pb-6">
        <h2 className="text-4xl font-bold text-black mb-2 uppercase">
          Начать Задачу
        </h2>
        <p className="text-[#555] font-mono text-sm uppercase tracking-wide">
          Выберите модуль для начала работы
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => (
          <AgentListItem key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
