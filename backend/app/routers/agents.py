from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.exceptions import NotFoundError
from app.models.schemas import AgentCreate, AgentResponse, PaginatedAgents
from app.middleware.auth import get_current_user
from app.services.agent_service import agent_service
from app.utils.pagination import paginate

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("/", response_model=PaginatedAgents)
def list_agents(
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = agent_service.search(db, search)
    return paginate(query, page, limit)


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = agent_service.get(db, agent_id)
    if not agent:
        raise NotFoundError("Agent")
    return agent


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
def create_agent(
    data: AgentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return agent_service.create_agent(db, data.model_dump(), user)
