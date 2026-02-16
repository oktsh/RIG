export const landingContent = {
  hero: {
    badge: {
      prefix: '[ 00 ]',
      status: 'READY FOR INPUT',
      statusColor: 'text-green-500'
    },
    title: 'Orchestrate\nIntelligence.',
    description: 'RIG is the central nervous system for AI-assisted development. Manage prompts, contexts, and agents in a unified grid.',
    stats: {
      cpu: 'CPU: 12%',
      mem: 'MEM: 4.2GB',
      net: 'NET: 1.2GB/s'
    }
  },
  sections: [
    {
      id: 'prompts',
      badge: {
        number: '[ 01 ]',
        label: 'CORE PROTOCOLS'
      },
      title: 'Prompts &\nContext Rules.',
      description: 'Define strict boundary layers for your AI agents. RIG injects context rules dynamically, ensuring code generation adheres to your architectural standards.',
      features: [
        'Context Window Optimization',
        'Dynamic Prompt Injection',
        'Heuristic Guardrails'
      ],
      codeSnippet: `// LOADING CONTEXT RULES...
const SYSTEM_PROMPT = {
    role: "architect",
    constraints: ["dry", "solid", "atomic"],
    stack: ["react", "tailwind", "three"]
};

class Agent extends NeuralInterface {
    constructor(id) {
        super(id);
        this.context = new ContextBuffer();
    }

    async synthesize(input) {
        await this.validate(input);
        return this.stream(input);
    }
}`
    },
    {
      id: 'agents',
      badge: {
        number: '[ 02 ]',
        label: 'DEPLOYMENT'
      },
      title: 'Custom Agents\nOn Demand.',
      description: 'Spin up specialized agents for refactoring, testing, or architectural design. Each agent is isolated, stateful, and tuned to your codebase.',
      agentTypes: [
        { type: 'TYPE_A', label: 'Refactor Agent' },
        { type: 'TYPE_B', label: 'QA Bot' },
        { type: 'TYPE_C', label: 'SecOps' },
        { type: 'TYPE_D', label: 'DocGen' }
      ],
      canvasLabels: {
        agentId: 'AGENT_ID: 0X_ALPHA',
        status: 'STATUS: AUTONOMOUS'
      }
    },
    {
      id: 'guides',
      badge: {
        number: '[ 03 ]',
        label: 'KNOWLEDGE BASE'
      },
      title: 'Interactive\nGuides.',
      description: 'Transform static documentation into active, queryable guides. RIG parses your docs and serves them as context to agents in real-time.',
      button: 'Index Documentation',
      sourceLabel: 'SOURCE: REPO/DOCS'
    }
  ],
  footer: {
    title: 'Enter the Grid.',
    cta: 'Launch RIG Console',
    legal: 'Enterprise License Required\nv.2.0.4 (Stable)',
    copyright: '© 2024 RIG SYSTEMS',
    connectionStatus: '[ SECURE CONNECTION ]'
  }
} as const
