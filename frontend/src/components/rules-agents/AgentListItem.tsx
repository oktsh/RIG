import { Agent } from "@/types";

interface AgentListItemProps {
  agent: Agent;
}

export default function AgentListItem({ agent }: AgentListItemProps) {
  return (
    <div className="bg-white border-2 border-black p-6 flex items-center justify-between group hover:bg-[#FAFAFA]">
      <div className="flex items-center gap-6">
        <div
          className={`w-14 h-14 flex items-center justify-center font-mono text-xl font-bold ${
            agent.status === "active"
              ? "bg-black text-white"
              : "bg-white border border-black text-black"
          }`}
        >
          {agent.number}
        </div>
        <div>
          <h3 className="text-xl font-bold text-black mb-1 uppercase">
            {agent.title}
          </h3>
          <p className="text-sm text-[#555] font-medium">{agent.desc}</p>
        </div>
      </div>
      <span
        className={`text-[10px] font-mono font-bold px-2 py-1 uppercase ${
          agent.status === "active"
            ? "text-black border border-black bg-[#FFE600]"
            : "text-[#666] border border-[#CCC]"
        }`}
      >
        {agent.status === "active" ? "АКТИВЕН" : "БЕТА"}
      </span>
    </div>
  );
}
