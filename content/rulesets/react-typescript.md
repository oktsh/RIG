---
title: "React + TypeScript"
description: "Стандартные правила для функциональных компонентов и хуков."
language: "TYPESCRIPT"
status: published
---

Стандартные правила для функциональных компонентов и хуков.

## Общие Принципы

- Используйте только функциональные компоненты
- Строгий режим TypeScript (`strict: true`)
- Именованные экспорты для всех компонентов
- Композиция вместо наследования

## Компоненты

```typescript
// Правильно: функциональный компонент с типизацией
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  onClick: () => void;
}

export function Button({ label, variant = "primary", onClick }: ButtonProps) {
  return (
    <button className={cn("btn", variant)} onClick={onClick}>
      {label}
    </button>
  );
}
```

### Правила именования

- Компоненты: `PascalCase` (Button.tsx, UserCard.tsx)
- Хуки: `camelCase` с префиксом `use` (useAuth.ts, useFetch.ts)
- Утилиты: `camelCase` (formatDate.ts, cn.ts)
- Типы: `PascalCase` с суффиксом `Props`, `State`, и т.д.

## Хуки

```typescript
// Кастомный хук с типизацией
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}
```

### Правила хуков

- Не вызывайте хуки внутри условий или циклов
- Выносите сложную логику в кастомные хуки
- Типизируйте возвращаемые значения явно

## Стили

- Используйте Tailwind CSS для стилизации
- Утилита `cn()` для условных классов
- Избегайте inline-стилей

```typescript
import { cn } from "@/lib/utils";

export function Card({ active, className }: CardProps) {
  return (
    <div className={cn("border border-black p-4", active && "bg-yellow-400", className)}>
      {/* ... */}
    </div>
  );
}
```

## Обработка Ошибок

- Используйте Error Boundaries для UI-ошибок
- Типизируйте все API-ответы
- Обрабатывайте loading и error состояния явно

## Запрещено

- Класс-компоненты
- `any` тип (используйте `unknown` и type guards)
- Прямые мутации state
- `index` как key в списках с динамическим порядком
- CSS Modules или styled-components (используем Tailwind)
