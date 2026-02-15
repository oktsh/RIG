import ActionCard from "@/components/dashboard/ActionCard";
import TeamTaskCard from "@/components/dashboard/TeamTaskCard";
import EventCard from "@/components/dashboard/EventCard";
import { events } from "@/data/events";

const teamTasks = [
  {
    title: "Анализ Процессов",
    description: "Структурирование и анализ рабочих процессов.",
    badge: "3 ИНСТРУМЕНТА",
  },
  {
    title: "Сегментация",
    description: "Разбивка задач через AI.",
    badge: "НАБОР ПРОМПТОВ",
  },
  {
    title: "Журнал Решений",
    description: "Отслеживание истории архитектуры.",
    badge: "ШАБЛОН",
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-12">
      <div className="flex items-end justify-between mb-10 pb-4 border-b-2 border-black">
        <div>
          <h2 className="text-4xl font-display font-bold text-black mb-2 uppercase tracking-tight">
            Initiate Task
          </h2>
          <p className="text-[#555] font-mono text-sm uppercase tracking-wide">
            Select a module to begin operation
          </p>
        </div>
        <div className="font-display text-6xl font-bold text-[#E0E0E0]">
          02
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <ActionCard
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          badge="НАСТРОЙКА"
          title="Настройка Окружения"
          description="Полное развертывание. Репозиторий, агенты, конфигурация CI/CD пайплайна."
          buttons={[
            { label: "Начать Гайд", variant: "primary" },
            { label: "Доки", variant: "outline" },
          ]}
        />
        <ActionCard
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          }
          badge="РАЗРАБОТКА"
          title="Вайб-Кодинг"
          description="AI-ассистированный процесс разработки. Рефакторинг, ревью, генерация."
          buttons={[
            {
              label: "Смотреть Промпты",
              href: "/prompts",
              variant: "primary",
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <h3 className="font-display text-xl font-bold text-black mb-6 uppercase border-b-2 border-black inline-block pb-1">
            Командные Задачи
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {teamTasks.map((task) => (
              <TeamTaskCard
                key={task.title}
                title={task.title}
                description={task.description}
                badge={task.badge}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl font-bold text-black mb-6 uppercase border-b-2 border-black inline-block pb-1">
            События
          </h3>
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
