import { HeaderConfig } from "@/types";

export const headerConfigs: Record<string, HeaderConfig> = {
  "/": {
    title: "О Проекте",
    subtitle: "ДОБРО ПОЖАЛОВАТЬ В RIG",
    showSearch: false,
  },
  "/dashboard": {
    title: "Панель",
    subtitle: "ОБЗОР АКТИВНОСТИ / DASHBOARD",
    showSearch: false,
  },
  "/content": {
    title: "Управление Контентом",
    subtitle: "ВАШИ ПУБЛИКАЦИИ",
    showSearch: false,
  },
  "/prompts": {
    title: "Промпты",
    subtitle: "БИБЛИОТЕКА ПРОМПТОВ / PROMPTS",
    showSearch: true,
  },
  "/guides": {
    title: "Гайды",
    subtitle: "РУКОВОДСТВА И ИНСТРУКЦИИ / GUIDES",
    showSearch: true,
  },
  "/rules-agents": {
    title: "Правила и Агенты",
    subtitle: "НАСТРОЙКИ АССИСТЕНТОВ / RULES & AGENTS",
    showSearch: true,
  },
};

export interface NavItem {
  href: string;
  label: string;
  group: "platform" | "library";
}

export const navItems: NavItem[] = [
  { href: "/", label: "01 // О Проекте", group: "platform" },
  { href: "/dashboard", label: "02 // Панель", group: "platform" },
  { href: "/content", label: "03 // Публикации", group: "platform" },
  { href: "/prompts", label: "Промпты", group: "library" },
  { href: "/guides", label: "Гайды", group: "library" },
  { href: "/rules-agents", label: "Правила и Агенты", group: "library" },
];
