"use client";

import { useState, useEffect } from "react";
import RulesetCard from "@/components/rules-agents/RulesetCard";
import AgentListItem from "@/components/rules-agents/AgentListItem";
import Pagination from "@/components/ui/Pagination";
import { rulesets as staticRulesets } from "@/data/rulesets";
import { agents as staticAgents } from "@/data/agents";
import type { Ruleset, Agent, PaginatedResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RulesAgentsPage() {
  const [rulesets, setRulesets] = useState<Ruleset[]>(staticRulesets);
  const [agents, setAgents] = useState<Agent[]>(staticAgents);
  const [rPage, setRPage] = useState(1);
  const [rPages, setRPages] = useState(1);
  const [rTotal, setRTotal] = useState(0);
  const [aPage, setAPage] = useState(1);
  const [aPages, setAPages] = useState(1);
  const [aTotal, setATotal] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/rulesets?page=${rPage}&limit=20`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: PaginatedResponse<Ruleset>) => {
        setRulesets(data.items);
        setRPages(data.pages);
        setRTotal(data.total);
      })
      .catch(() => setRulesets(staticRulesets));
  }, [rPage]);

  useEffect(() => {
    fetch(`${API_BASE}/api/agents?page=${aPage}&limit=20`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: PaginatedResponse<Agent>) => {
        setAgents(data.items);
        setAPages(data.pages);
        setATotal(data.total);
      })
      .catch(() => setAgents(staticAgents));
  }, [aPage]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        {rulesets.map((ruleset) => (
          <RulesetCard key={ruleset.id} ruleset={ruleset} />
        ))}
      </div>
      <Pagination page={rPage} pages={rPages} total={rTotal} onPageChange={setRPage} />

      <div className="mb-12 mt-16 border-b-2 border-black pb-6">
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
      <Pagination page={aPage} pages={aPages} total={aTotal} onPageChange={setAPage} />
    </div>
  );
}
