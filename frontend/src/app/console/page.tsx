'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

type Section = 'prompts' | 'agents' | 'guides' | 'rulesets';

interface DocItem {
  id: string;
  title: string;
  description: string;
  version?: string;
  status?: 'verified' | 'draft' | 'indexed' | 'updating';
  metadata?: string;
}

const mockDocs: Record<Section, DocItem[]> = {
  prompts: [
    {
      id: 'PROMPT_001',
      title: 'Refactor: Extract Component',
      description: 'Extract reusable component from selected code block with props interface',
      version: 'v2.3.1',
      status: 'verified',
    },
    {
      id: 'PROMPT_002',
      title: 'Test: Unit Coverage',
      description: 'Generate comprehensive unit tests with edge cases and mocks',
      version: 'v1.8.0',
      status: 'draft',
    },
    {
      id: 'PROMPT_003',
      title: 'Documentation: API Reference',
      description: 'Auto-generate API documentation from function signatures',
      version: 'v3.0.2',
      status: 'verified',
    },
  ],
  agents: [
    {
      id: 'AGENT_ALPHA',
      title: 'Refactor Bot',
      description: 'Analyzes code quality and suggests refactoring patterns',
      metadata: 'TEMP: 0.3 // TOKENS: 8K // UPTIME: 24H 12M',
      status: 'verified',
    },
    {
      id: 'AGENT_BETA',
      title: 'QA Specialist',
      description: 'Generates test suites and identifies edge cases',
      metadata: 'TEMP: 0.5 // TOKENS: 16K // UPTIME: IDLE',
    },
    {
      id: 'AGENT_GAMMA',
      title: 'SecOps Auditor',
      description: 'Scans for security vulnerabilities and compliance',
      metadata: 'TEMP: 0.2 // TOKENS: 32K // UPTIME: 6H 45M',
      status: 'verified',
    },
    {
      id: 'AGENT_DELTA',
      title: 'DocGen',
      description: 'Automated documentation generation and updates',
      metadata: 'TEMP: 0.7 // TOKENS: 16K // UPTIME: 2H 18M',
      status: 'verified',
    },
  ],
  guides: [
    {
      id: 'GUIDE_001',
      title: 'Architecture Guidelines',
      description: 'SOURCE: /docs/architecture',
      metadata: '142 pages // Last updated 2h ago',
      status: 'indexed',
    },
    {
      id: 'GUIDE_002',
      title: 'API Reference',
      description: 'SOURCE: /docs/api',
      metadata: '89 endpoints // Last updated 15m ago',
      status: 'updating',
    },
    {
      id: 'GUIDE_003',
      title: 'Security Policies',
      description: 'SOURCE: /docs/security',
      metadata: '28 policies // Last updated 1d ago',
      status: 'indexed',
    },
  ],
  rulesets: [
    {
      id: 'RULESET_001',
      title: 'TypeScript Conventions',
      description: 'Enforced code style and naming conventions',
      version: 'v1.0.0',
      status: 'verified',
    },
    {
      id: 'RULESET_002',
      title: 'API Design Standards',
      description: 'REST API endpoint patterns and response formats',
      version: 'v2.1.0',
      status: 'verified',
    },
  ],
};

export default function ConsolePage() {
  const [activeSection, setActiveSection] = useState<Section>('prompts');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'draft':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      case 'indexed':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'updating':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const renderDocList = () => {
    const docs = mockDocs[activeSection];

    if (activeSection === 'agents') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="border border-border-subtle p-6 hover:border-white/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="mono text-xs text-gray-500">{doc.id}</div>
                {doc.status === 'verified' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
                {!doc.status && <div className="w-2 h-2 bg-gray-600 rounded-full" />}
              </div>
              <h4 className="text-white text-lg mb-2">{doc.title}</h4>
              <p className="text-gray-500 text-xs mb-4">{doc.description}</p>
              {doc.metadata && (
                <div className="mono text-[10px] text-gray-600 space-y-1">
                  {doc.metadata.split(' // ').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (activeSection === 'guides') {
      return (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="border border-border-subtle p-4 hover:border-white/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-border-subtle flex items-center justify-center text-white text-xs">
                    {doc.id === 'GUIDE_001' ? '📚' : doc.id === 'GUIDE_002' ? '⚙️' : '🔒'}
                  </div>
                  <div>
                    <div className="text-white text-sm">{doc.title}</div>
                    <div className="mono text-[10px] text-gray-600">{doc.description}</div>
                  </div>
                </div>
                <div className={`mono text-[10px] ${getStatusColor(doc.status).split(' ')[0]}`}>
                  {doc.status?.toUpperCase()}
                </div>
              </div>
              {doc.metadata && (
                <div className="mono text-[10px] text-gray-600 mt-2">{doc.metadata}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Prompts and Rulesets default list view
    return (
      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="border border-border-subtle p-4 hover:border-white/20 transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-white text-sm mb-1">{doc.title}</div>
                <div className="mono text-[10px] text-gray-600">
                  ID: {doc.id}
                  {doc.version && ` // ${doc.version}`}
                </div>
              </div>
              {doc.status && (
                <div className={`mono text-[10px] px-2 py-1 border ${getStatusColor(doc.status)}`}>
                  {doc.status.toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-gray-500 text-xs">{doc.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="min-h-screen w-full bg-neural-bg border-t border-border-subtle p-6 md:p-12">
      <div className="w-full max-w-7xl mx-auto">
        {/* Console Header */}
        <div className="mb-12 pb-6 border-b border-border-subtle">
          <div className="mono text-xs text-gray-500 mb-4 flex items-center gap-2">
            <span>[ CONSOLE ]</span>
            <div className="h-[1px] w-12 bg-gray-800" />
            <span className="text-green-500">ACTIVE SESSION</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-normal text-white tracking-tight">
            RIG Console
          </h2>
        </div>

        {/* Console Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-3 bg-neural-surface border border-border-subtle md:sticky md:top-24 md:h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="p-6">
              <div className="mono text-xs text-gray-500 mb-6">DOCUMENTATION</div>

              {/* Git-like tree structure */}
              <nav className="space-y-1 text-sm">
                <div className="mb-4">
                  <div className="mono text-[10px] text-gray-600 mb-2">GETTING STARTED</div>
                  <button
                    onClick={() => setActiveSection('prompts')}
                    className={`w-full text-left px-3 py-2 border-l-2 mono text-xs transition-all ${
                      activeSection === 'prompts'
                        ? 'text-white bg-white/5 border-white'
                        : 'text-gray-500 hover:text-white hover:bg-white/5 border-transparent hover:border-gray-600'
                    }`}
                  >
                    ├─ Prompts
                  </button>
                  <button
                    onClick={() => setActiveSection('agents')}
                    className={`w-full text-left px-3 py-2 border-l-2 mono text-xs transition-all ${
                      activeSection === 'agents'
                        ? 'text-white bg-white/5 border-white'
                        : 'text-gray-500 hover:text-white hover:bg-white/5 border-transparent hover:border-gray-600'
                    }`}
                  >
                    ├─ Agents
                  </button>
                  <button
                    onClick={() => setActiveSection('guides')}
                    className={`w-full text-left px-3 py-2 border-l-2 mono text-xs transition-all ${
                      activeSection === 'guides'
                        ? 'text-white bg-white/5 border-white'
                        : 'text-gray-500 hover:text-white hover:bg-white/5 border-transparent hover:border-gray-600'
                    }`}
                  >
                    └─ Guides
                  </button>
                </div>

                <div className="mb-4">
                  <div className="mono text-[10px] text-gray-600 mb-2">CONFIGURATION</div>
                  <div className="w-full text-left px-3 py-2 text-gray-600 border-l-2 border-transparent mono text-xs">
                    ├─ Context Rules
                  </div>
                  <div className="w-full text-left px-3 py-2 text-gray-600 border-l-2 border-transparent mono text-xs">
                    ├─ Guardrails
                  </div>
                  <div className="w-full text-left px-3 py-2 text-gray-600 border-l-2 border-transparent mono text-xs">
                    └─ Variables
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mono text-[10px] text-gray-600 mb-2">DEPLOYMENT</div>
                  <div className="w-full text-left px-3 py-2 text-gray-600 border-l-2 border-transparent mono text-xs">
                    ├─ Local Setup
                  </div>
                  <div className="w-full text-left px-3 py-2 text-gray-600 border-l-2 border-transparent mono text-xs">
                    ├─ Docker
                  </div>
                  <div className="w-full text-left px-3 py-2 text-gray-600 border-l-2 border-transparent mono text-xs">
                    └─ Kubernetes
                  </div>
                </div>

                <div>
                  <div className="mono text-[10px] text-gray-600 mb-2">API REFERENCE</div>
                  <div className="w-full text-left px-3 py-2 text-gray-600 border-l-2 border-transparent mono text-xs">
                    ├─ REST Endpoints
                  </div>
                  <div className="w-full text-left px-3 py-2 text-gray-600 border-l-2 border-transparent mono text-xs">
                    ├─ WebSocket
                  </div>
                  <div className="w-full text-left px-3 py-2 text-gray-600 border-l-2 border-transparent mono text-xs">
                    └─ CLI Commands
                  </div>
                </div>
              </nav>

              <div className="mt-12 pt-6 border-t border-border-subtle">
                <div className="mono text-[10px] text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>VERSION</span>
                    <span className="text-white">2.0.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ACTIVE</span>
                    <span className="text-green-500">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IDLE</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ERRORS</span>
                    <span className="text-red-500">0</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-9 bg-neural-surface border border-border-subtle p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-normal text-white mb-2">
                  {activeSection === 'prompts' && 'Prompt Registry'}
                  {activeSection === 'agents' && 'Custom Agents'}
                  {activeSection === 'guides' && 'Interactive Guides'}
                  {activeSection === 'rulesets' && 'Ruleset Library'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {activeSection === 'prompts' &&
                    'Manage and version control your prompt templates'}
                  {activeSection === 'agents' && 'Deploy and configure specialized AI agents'}
                  {activeSection === 'guides' && 'Transform documentation into queryable context'}
                  {activeSection === 'rulesets' && 'Code standards and style enforcement'}
                </p>
              </div>
              <button className="btn-primary text-[10px] py-2 px-3">
                {activeSection === 'prompts' && '+ NEW PROMPT'}
                {activeSection === 'agents' && '+ DEPLOY AGENT'}
                {activeSection === 'guides' && '+ INDEX DOCS'}
                {activeSection === 'rulesets' && '+ NEW RULESET'}
              </button>
            </div>

            {selectedDoc ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {selectedDoc}
                </ReactMarkdown>
              </div>
            ) : (
              renderDocList()
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
