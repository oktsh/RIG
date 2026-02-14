from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import Agent
from app.models.schemas import AgentCreate, AgentResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("/", response_model=list[AgentResponse])
def list_agents(db: Session = Depends(get_db)):
    return db.query(Agent).all()


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
