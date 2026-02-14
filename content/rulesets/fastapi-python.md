---
title: "Стандарты FastAPI"
description: "Pydantic v2, асинхронные паттерны и обработка ошибок."
language: "PYTHON"
status: published
---

Pydantic v2, асинхронные паттерны и обработка ошибок.

## Общие Принципы

- Строгая типизация через Pydantic v2
- Асинхронные эндпоинты по умолчанию
- Явная обработка всех ошибок
- Dependency Injection для общих зависимостей

## Структура Проекта

```
backend/
├── app/
│   ├── main.py           # Точка входа, CORS, роутеры
│   ├── config.py         # Настройки из переменных окружения
│   ├── database.py       # SQLAlchemy engine и session
│   ├── models/
│   │   ├── db.py         # ORM модели
│   │   └── schemas.py    # Pydantic схемы
│   ├── routers/          # Эндпоинты по доменам
│   ├── services/         # Бизнес-логика
│   └── middleware/        # Middleware (auth, logging)
├── tests/
├── requirements.txt
└── .env
```

## Pydantic Схемы

```python
from pydantic import BaseModel, Field, EmailStr

# Схема запроса
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)

# Схема ответа
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = {"from_attributes": True}
```

### Правила Pydantic

- Используйте `Field()` для валидации
- Разделяйте схемы запроса и ответа
- Включайте `model_config = {"from_attributes": True}` для ORM-совместимости
- Не возвращайте чувствительные данные (password_hash, tokens)

## Эндпоинты

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/", response_model=list[UserResponse])
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return db.query(User).filter(User.is_active).all()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    # ...
```

### Правила эндпоинтов

- Группируйте по доменам в отдельные роутеры
- Указывайте `response_model` для всех эндпоинтов
- Используйте правильные HTTP status codes
- Dependency Injection для auth, db и других зависимостей

## Обработка Ошибок

```python
from fastapi import HTTPException, status

# Стандартные ошибки
raise HTTPException(status_code=404, detail="Resource not found")
raise HTTPException(status_code=403, detail="Insufficient permissions")
raise HTTPException(status_code=409, detail="Resource already exists")

# Не используйте голые Exception -- всегда HTTPException с кодом
```

## Безопасность

- CORS настройки только для разрешённых доменов
- JWT токены с ограниченным временем жизни
- PBKDF2 для хеширования паролей
- Валидация всех входных данных через Pydantic
- Не логируйте чувствительные данные

## Запрещено

- `# type: ignore` без обоснования
- Синхронные вызовы в асинхронных эндпоинтах
- Прямые SQL-запросы (используйте ORM)
- Хардкод секретов в коде
- `*` импорты (`from module import *`)
