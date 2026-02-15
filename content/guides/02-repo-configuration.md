---
title: "Конфигурация Репозитория"
description: "Структура папок, конфигурация агентов и правила Cursor."
author: "Дмитрий С."
category: "CURSOR"
time: "10 МИН"
views: 2156
date: "12 ФЕВ"
status: published
---

Структура папок, конфигурация агентов и правила Cursor.

## 1. Структура Проекта

Правильная организация файлов критична для работы AI-ассистентов. Модели используют структуру директорий как контекст для генерации кода.

```
project/
├── .cursorrules          # Правила для Cursor AI
├── .cursor/
│   └── agents/           # Кастомные агенты
├── CLAUDE.md             # Контекст для Claude Code
├── src/
│   ├── app/              # Роуты и страницы
│   ├── components/       # UI-компоненты
│   ├── lib/              # Утилиты и хелперы
│   ├── types/            # TypeScript типы
│   └── data/             # Статические данные
├── tests/                # Тесты
└── docs/                 # Документация
```

## 2. Файл .cursorrules

Файл `.cursorrules` размещается в корне репозитория и задаёт стандарты для AI:

```
# Project Standards

## Tech Stack
- Next.js 15 with App Router
- React 19 with Server Components
- TypeScript strict mode
- Tailwind CSS v3

## Coding Conventions
- Functional components only, no class components
- Named exports for components
- Types in separate files under /types
- Use 'cn' utility for className merging

## File Naming
- Components: PascalCase (Button.tsx)
- Utilities: camelCase (formatDate.ts)
- Pages: lowercase (page.tsx)
```

## 3. Конфигурация Агентов

Агенты Cursor позволяют создавать специализированные AI-помощники:

```yaml
# .cursor/agents/reviewer.yaml
name: Code Reviewer
description: Reviews code for quality and security
instructions: |
  Review the code with focus on:
  - Security vulnerabilities
  - Performance issues
  - Code style consistency
  - Type safety
```

## 4. Интеграция с Git

Настройте git hooks для автоматической проверки:

```bash
# Установка husky
npm install -D husky lint-staged

# Настройка pre-commit
npx husky add .husky/pre-commit "npx lint-staged"
```

## 5. Рекомендации

- Держите `.cursorrules` актуальным -- обновляйте при смене стека
- Используйте `.cursorignore` для исключения ненужных файлов из контекста
- Разделяйте агентов по задачам: ревью, документация, тесты
- Синхронизируйте правила между `.cursorrules` и `CLAUDE.md`
