```
███████╗  ██╗  ██████╗
██╔═══██╗ ██║ ██╔════╝
███████╔╝ ██║ ██║  ███╗
██╔══██╗  ██║ ██║   ██║
██║  ██║  ██║ ╚██████╔╝
╚═╝  ╚═╝  ╚═╝  ╚═════╝
```

**`// PART KNOWLEDGE BASE / PART MAGIC WAND`**

---

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                              ┃
┃  🟨 **RIG** — Единая оснастка для вайб-кодинга                              ┃
┃                                                                              ┃
┃  AI-assisted development knowledge base: промпты, гайды, правила            ┃
┃  для AI-ассистентов, шаблоны проектов и командные инструменты.              ┃
┃                                                                              ┃
┃  🚧 **Status:** IN PLANNING — Project structure initialized                  ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

> **EN:** The ultimate rig for vibe-coding: ready-to-use prompts, step-by-step guides, context rules for AI assistants, and team collaboration tools.

---

## ⚡ FEATURES

<table>
<tr>
<td width="50%">

### 🎯 ПРОМПТЫ
**Ready-to-use AI Prompts**

Коллекция проверенных промптов для:
- 📊 Research & Analysis
- 💻 Code Review & Refactoring
- 🏗️ Architecture Design
- 🧪 Testing Strategies

</td>
<td width="50%">

### 📖 ГАЙДЫ
**Step-by-Step Guides**

Пошаговые инструкции:
- 🛠️ Environment Setup
- ⚙️ Configuration Best Practices
- 🤖 Advanced Agents Usage
- 📦 Project Templates

</td>
</tr>
<tr>
<td width="50%">

### 🎛️ ПРАВИЛА & АГЕНТЫ
**Context Rules & Custom Agents**

AI-ассистенты для команд:
- 📝 `.cursorrules` templates
- 🔧 Claude Code agents config
- 🎨 Custom agent definitions
- 🔄 Workflow orchestration

</td>
<td width="50%">

### 🛠️ ИНСТРУМЕНТЫ
**CLI Tools & Templates**

Утилиты разработки:
- 🚀 Project starters (Next.js, FastAPI)
- 📋 Spec templates (TDD workflow)
- 🔍 Code search utilities
- 📊 Decision logs & tracking

</td>
</tr>
</table>

---

## ⚡ QUICK START

### 📋 Prerequisites

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ • **Claude Code** or **Cursor** IDE              ┃
┃ • **Git** (latest version)                       ┃
┃ • **Node.js 18+** (for project templates)        ┃
┃ • **Python 3.10+** (optional, for scripts)       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

### 🟨 Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/oktsh/RIG.git
cd RIG

# 2️⃣ Browse prompts library
ls prompts/

# 3️⃣ Browse guides
ls guides/

# 4️⃣ Check project templates
ls templates/
```

### ⚙️ Configuration

**For Claude Code:**
```bash
# Copy agent definitions to your workspace
cp -r .claude/agents/ ~/.claude/agents/

# Link CLAUDE.md rules
ln -s $(pwd)/CLAUDE.md .cursorrules
```

**For Cursor:**
```bash
# Copy context rules
cp CLAUDE.md .cursorrules

# Configure workspace settings
code --install-extension cursor.cursor-vscode
```

---

## 🛠️ STACK

| Component        | Technology                    | Status   |
|------------------|-------------------------------|----------|
| **Framework**    | 🟨 TBD (Next.js / FastAPI)    | Planning |
| **Language**     | TypeScript / Python           | Planning |
| **Database**     | 🟨 TBD (PostgreSQL / SQLite)  | Planning |
| **Infrastructure** | Docker + Git                | Planning |
| **AI Tools**     | Claude Code, Cursor, OpenAI   | ✅ Active |

---

## 📦 PROJECT STRUCTURE

```
RIG/
├── 🟨 CLAUDE.md              # AI agent configuration
├── 📋 specs/                 # Feature specifications
├── 📚 docs/                  # Documentation (guides, references)
├── 🎯 prompts/               # Prompt library
│   ├── research/             # Analysis & investigation prompts
│   ├── code-review/          # Review & refactor prompts
│   ├── architecture/         # Design & planning prompts
│   └── testing/              # QA & test generation prompts
├── 🛠️ tools/                 # CLI utilities & scripts
│   ├── setup/                # Environment setup scripts
│   └── templates/            # Project boilerplates
└── .claude/                  # Claude Code agents
    └── agents/               # Custom agent definitions
```

---

## 🚀 ROADMAP

- [x] ✅ Project initialization
- [x] ✅ CLAUDE.md configuration template
- [ ] 🟨 Prompt library (Phase 1)
- [ ] 🟨 Setup guides collection
- [ ] 🟨 Agent definitions catalog
- [ ] 🟨 Project templates (Next.js, FastAPI)
- [ ] 🟨 Web platform (HTML prototype → production)

---

## 📖 DOCUMENTATION

Detailed docs coming soon. For now:

- **[CLAUDE.md](./CLAUDE.md)** — AI assistant configuration & development workflow
- **Prototype:** [HTML Design](./design-dba9cd8e-a1a3-4697-acea-1fbae73adfab.html) (brutalist UI reference)

---

## 🤝 CONTRIBUTING

Хотите добавить свой промпт, гайд или агента?

1. Fork this repository
2. Create feature branch: `git checkout -b feature/my-awesome-prompt`
3. Add your content to appropriate directory
4. Commit changes: `git commit -m "feat: add awesome prompt"`
5. Push to branch: `git push origin feature/my-awesome-prompt`
6. Open Pull Request

**Contribution Guidelines:**
- Промпты должны быть протестированы на реальных задачах
- Гайды должны быть воспроизводимы (step-by-step)
- Код должен соответствовать стилю проекта
- Все материалы на русском + английском (bilingual)

---

## 📄 LICENSE

🟨 **TBD** — License will be added soon.

---

## 🔗 LINKS

- **GitHub:** [github.com/oktsh/RIG](https://github.com/oktsh/RIG)
- **Issues:** [github.com/oktsh/RIG/issues](https://github.com/oktsh/RIG/issues)
- **Discussions:** [github.com/oktsh/RIG/discussions](https://github.com/oktsh/RIG/discussions)

---

<div align="center">

**⚡ BUILT FOR THE VIBE ERA ⚡**

`// RIG YOUR ENV`

---

🟨 **2025** • Powered by Claude Code & Cursor

</div>
