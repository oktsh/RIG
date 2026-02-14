import { Agent } from "@/types";

export const agents: Agent[] = [
  {
    id: 1,
    number: "01",
    title: "Агент Код-Ревью",
    desc: "Автоматическое ревью с фокусом на безопасность и производительность.",
    status: "active",
  },
  {
    id: 2,
    number: "02",
    title: "Агент Документации",
    desc: "Генерация и поддержка документации.",
    status: "active",
  },
  {
    id: 3,
    number: "03",
    title: "Генератор Тестов",
    desc: "Создание юнит- и интеграционных тестов.",
    status: "beta",
  },
];
