from sqlalchemy.orm import Session

from app.models.db import User, Prompt, Guide, Agent, Ruleset
from app.models.enums import UserRole, ContentStatus, AgentStatus
from app.services.auth import hash_password
from app.config import settings


def seed_database(db: Session):
    """Seed database with initial data on first run. Idempotent."""

    # Seed admin user
    admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            name=settings.ADMIN_NAME,
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            requires_approval=False,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"Seeded admin user: {settings.ADMIN_EMAIL}")

    # Seed prompts
    if db.query(Prompt).count() == 0:
        prompts = [
            Prompt(
                title="Анализ Конкурентов",
                desc="Фреймворк глубокого анализа конкурентной среды с фокусом на ценностные предложения и рост.",
                author_name="Алекс М.",
                copies="1,837",
                tags=["ИССЛЕДОВАНИЕ", "СТРАТЕГИЯ"],
                tech="GPT-4 / CLAUDE",
                content="Проведите комплексный анализ конкурентов: изучите их ценностные предложения, стратегии роста, позиционирование на рынке и ключевые преимущества. Определите возможности для дифференциации.",
                status=ContentStatus.PUBLISHED,
            ),
            Prompt(
                title="Агент Код-Ревью",
                desc="Автоматическое ревью с фокусом на безопасность, производительность и стандарты команды.",
                author_name="Дмитрий С.",
                copies="1,481",
                tags=["РАЗРАБОТКА", "КАЧЕСТВО"],
                tech="CURSOR / COPILOT",
                content="Проанализируйте код на предмет безопасности, производительности, соответствия стандартам команды и лучшим практикам. Предложите конкретные улучшения с примерами.",
                status=ContentStatus.PUBLISHED,
            ),
            Prompt(
                title="Сегментация Пользователей",
                desc="Паттерны сегментации поведенческих данных для продуктового анализа.",
                author_name="Мария К.",
                copies="982",
                tags=["ПРОДУКТ", "АНАЛИТИКА"],
                tech="PYTHON / SQL",
                content="Разработайте модель сегментации пользователей на основе поведенческих данных. Определите ключевые сегменты, их характеристики и потребности для оптимизации продукта.",
                status=ContentStatus.PUBLISHED,
            ),
            Prompt(
                title="Архитектура Микросервисов",
                desc="Архитектурные паттерны для масштабируемых распределённых систем.",
                author_name="Игорь В.",
                copies="456",
                tags=["СИСТЕМА", "АРХИТЕКТУРА"],
                tech="K8S / DOCKER",
                content="Спроектируйте архитектуру микросервисов с учетом масштабируемости, отказоустойчивости и независимого развертывания. Определите границы сервисов и коммуникационные паттерны.",
                status=ContentStatus.PUBLISHED,
            ),
        ]
        db.add_all(prompts)
        db.commit()
        print("Seeded 4 prompts")

    # Seed guides
    if db.query(Guide).count() == 0:
        guides = [
            Guide(
                title="Развертывание RIG с Нуля",
                desc="Полное руководство по настройке окружения для вайб-кодинга.",
                author_name="Алекс М.",
                category="CLAUDE CODE",
                time="15 МИН",
                views="3,245",
                date="10 ФЕВ",
                status=ContentStatus.PUBLISHED,
            ),
            Guide(
                title="Конфигурация Репозитория",
                desc="Структура папок, конфигурация агентов и правила Cursor.",
                author_name="Дмитрий С.",
                category="CURSOR",
                time="10 МИН",
                views="2,156",
                date="12 ФЕВ",
                status=ContentStatus.PUBLISHED,
            ),
            Guide(
                title="Единый Журнал Решений",
                desc="Контекстно-зависимые записи архитектурных решений.",
                author_name="Елена П.",
                category="ОСНОВЫ",
                time="8 МИН",
                views="1,834",
                date="14 ФЕВ",
                status=ContentStatus.PUBLISHED,
            ),
            Guide(
                title="Продвинутые Агенты",
                desc="Кастомные агенты, MCP серверы, оркестрация рабочих процессов.",
                author_name="Игорь В.",
                category="АГЕНТЫ",
                time="20 МИН",
                views="1,245",
                date="15 ФЕВ",
                status=ContentStatus.PUBLISHED,
            ),
        ]
        db.add_all(guides)
        db.commit()
        print("Seeded 4 guides")

    # Seed agents
    if db.query(Agent).count() == 0:
        agents_data = [
            Agent(number="01", title="Агент Код-Ревью", desc="Автоматическое ревью с фокусом на безопасность и производительность.", status=AgentStatus.ACTIVE, content_status=ContentStatus.PUBLISHED),
            Agent(number="02", title="Агент Документации", desc="Генерация и поддержка документации.", status=AgentStatus.ACTIVE, content_status=ContentStatus.PUBLISHED),
            Agent(number="03", title="Генератор Тестов", desc="Создание юнит- и интеграционных тестов.", status=AgentStatus.BETA, content_status=ContentStatus.PUBLISHED),
        ]
        db.add_all(agents_data)
        db.commit()
        print("Seeded 3 agents")

    # Seed rulesets
    if db.query(Ruleset).count() == 0:
        rulesets = [
            Ruleset(title="React + TypeScript", desc="Стандартные правила для функциональных компонентов и хуков.", language="TYPESCRIPT", content_status=ContentStatus.PUBLISHED),
            Ruleset(title="Стандарты FastAPI", desc="Pydantic v2, асинхронные паттерны и обработка ошибок.", language="PYTHON", content_status=ContentStatus.PUBLISHED),
        ]
        db.add_all(rulesets)
        db.commit()
        print("Seeded 2 rulesets")
