---
title: "Развертывание RIG с Нуля"
description: "Полное руководство по настройке окружения для вайб-кодинга."
author: "Алекс М."
category: "CLAUDE CODE"
time: "15 МИН"
views: 3245
date: "10 ФЕВ"
status: published
---

Полное руководство по настройке окружения для вайб-кодинга.

Правильная настройка окружения -- это 80% успеха при работе с LLM. Этот гайд покрывает подготовку IDE, линтеры и интеграцию AI-ассистентов.

## 1. Установка и Конфигурация

Сначала установите `Cursor` или плагин VS Code. Рекомендуем выделенный форк для лучшей интеграции.

```bash
# Установка через brew
brew install --cask cursor

# Клонирование стартер-кита
git clone https://github.com/rig/starter-kit.git
```

## 2. Контекстные Правила (.cursorrules)

Файл `.cursorrules` определяет поведение AI. Критично для консистентности кода команды.

> "Хороший промпт в .cursorrules экономит часы PR-ревью."

### Базовая структура файла

```
# Project Context
- Project type: [web app / API / library]
- Language: [TypeScript / Python / etc.]
- Framework: [Next.js / FastAPI / etc.]

# Code Style
- Use functional components
- Prefer composition over inheritance
- Always handle errors explicitly
```

## 3. Интеграция AI-Ассистентов

### Claude Code

Установите CLI и настройте CLAUDE.md в корне проекта:

```bash
# Установка Claude Code
npm install -g @anthropic-ai/claude-code

# Инициализация проекта
claude init
```

### Настройка CLAUDE.md

Файл `CLAUDE.md` содержит контекст проекта для Claude Code:

- Описание проекта и стек технологий
- Структура директорий
- Команды для запуска, сборки и тестирования
- Правила оформления кода

## 4. Линтеры и Форматирование

Настройте ESLint и Prettier для автоматического контроля качества:

```bash
# Установка зависимостей
npm install -D eslint prettier eslint-config-prettier

# Создание конфигурации
npx eslint --init
```

## 5. Проверка Окружения

После настройки убедитесь, что всё работает:

1. IDE корректно подсвечивает код
2. AI-ассистент отвечает с учётом контекста проекта
3. Линтеры проверяют код при сохранении
4. Git hooks запускают проверки перед коммитом
