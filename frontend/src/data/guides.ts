import { Guide } from "@/types";

export const guides: Guide[] = [
  {
    id: 1,
    title: "Развертывание RIG с Нуля",
    desc: "Полное руководство по настройке окружения для вайб-кодинга.",
    author: "Алекс М.",
    category: "CLAUDE CODE",
    time: "15 МИН",
    views: "3,245",
    date: "10 ФЕВ",
  },
  {
    id: 2,
    title: "Конфигурация Репозитория",
    desc: "Структура папок, конфигурация агентов и правила Cursor.",
    author: "Дмитрий С.",
    category: "CURSOR",
    time: "10 МИН",
    views: "2,156",
    date: "12 ФЕВ",
  },
  {
    id: 3,
    title: "Единый Журнал Решений",
    desc: "Контекстно-зависимые записи архитектурных решений.",
    author: "Елена П.",
    category: "ОСНОВЫ",
    time: "8 МИН",
    views: "1,834",
    date: "14 ФЕВ",
  },
  {
    id: 4,
    title: "Продвинутые Агенты",
    desc: "Кастомные агенты, MCP серверы, оркестрация рабочих процессов.",
    author: "Игорь В.",
    category: "АГЕНТЫ",
    time: "20 МИН",
    views: "1,245",
    date: "15 ФЕВ",
  },
];

export const guideContent: Record<number, string> = {
  1: `<p class="lead text-xl text-black font-medium mb-8">Правильная настройка окружения — это 80% успеха при работе с LLM. Этот гайд покрывает подготовку IDE, линтеры и интеграцию AI-ассистентов.</p>

<h2 class="text-3xl mt-12 mb-6 text-black font-bold uppercase">1. Установка и Конфигурация</h2>
<p class="mb-4">Сначала установите <code class="text-sm font-bold">Cursor</code> или плагин VS Code. Рекомендуем выделенный форк для лучшей интеграции.</p>

<div class="bg-[#F0F0F0] border border-black p-6 my-8 font-mono text-sm relative">
  <div class="absolute top-0 right-0 bg-black text-white text-[9px] px-2 py-1 font-bold uppercase">ТЕРМИНАЛ</div>
  <div class="text-[#666] mb-2 font-bold"># Установка через brew</div>
  <div class="text-black font-bold mb-4">&gt; brew install --cask cursor</div>
  <div class="text-[#666] mb-2 font-bold"># Клонирование стартер-кита</div>
  <div class="text-black font-bold">&gt; git clone https://github.com/rig/starter-kit.git</div>
</div>

<h2 class="text-3xl mt-12 mb-6 text-black font-bold uppercase">2. Контекстные Правила (.cursorrules)</h2>
<p class="mb-6">Файл <code class="text-sm font-bold">.cursorrules</code> определяет поведение AI. Критично для консистентности кода команды.</p>

<blockquote class="border-l-4 border-[#FFE600] pl-6 my-8 text-xl font-display font-bold text-black not-italic bg-white p-4 shadow-[4px_4px_0px_#000] border border-black">
  "Хороший промпт в .cursorrules экономит часы PR-ревью."
</blockquote>`,
};
