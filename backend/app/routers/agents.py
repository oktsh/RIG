from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import Agent
from app.models.schemas import AgentCreate, AgentResponse, PaginatedAgents
from app.middleware.auth import get_current_user
from app.utils.pagination import paginate

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("/", response_model=PaginatedAgents)
def list_agents(
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Agent)
    if search:
        term = f"%{search}%"
        query = query.filter(Agent.title.ilike(term) | Agent.desc.ilike(term))
    return paginate(query, page, limit)


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
def create_agent(
    data: AgentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    agent = Agent(
        title=data.title,
        desc=data.desc,
        number=data.number,
        status=data.status,
        author_id=user.id,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent
