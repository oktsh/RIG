export interface AgentDef {
  id: string;
  preset: 'shared' | 'pm' | 'small-team' | 'solo-dev';
  filename: string;
}

export interface RuleDef {
  id: string;
  preset: 'shared' | 'pm' | 'small-team' | 'solo-dev';
  filename: string;
}

export interface HookDef {
  id: string;
  stack: 'nextjs' | 'python-fastapi';
  filename: string;
}

export interface TemplateDef {
  id: string;
  filename: string;
}

export interface WorkflowDef {
  id: string;
  preset: 'shared' | 'pm' | 'small-team' | 'solo-dev';
  filename: string;
}

export interface ProtocolDef {
  id: string;
  preset: 'shared' | 'pm' | 'small-team' | 'solo-dev';
  filename: string;
}

export interface ContentSet {
  agents: AgentDef[];
  rules: RuleDef[];
  hooks: HookDef[];
  templates: TemplateDef[];
  workflows: WorkflowDef[];
  protocols: ProtocolDef[];
  presetMeta: {
    id: string;
    displayName: string;
    description: string;
    tone: 'simplified' | 'technical' | 'minimal';
    agentCount: number;
  };
}
