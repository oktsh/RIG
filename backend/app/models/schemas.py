from datetime import datetime
from pydantic import BaseModel, EmailStr


# Auth
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# User
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "USER"


class UserUpdate(BaseModel):
    role: str | None = None
    requires_approval: bool | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool
    requires_approval: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# Prompt
class PromptCreate(BaseModel):
    title: str
    desc: str | None = None
    tags: list[str] = []
    tech: str | None = None
    content: str | None = None


class PromptUpdate(BaseModel):
    title: str | None = None
    desc: str | None = None
    tags: list[str] | None = None
    tech: str | None = None
    content: str | None = None
    status: str | None = None


class PromptResponse(BaseModel):
    id: int
    title: str
    desc: str | None
    author_name: str | None
    copies: str
    tags: list[str]
    tech: str | None
    content: str | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Guide
class GuideCreate(BaseModel):
    title: str
    desc: str | None = None
    category: str | None = None
    time: str | None = None
    content: str | None = None


class GuideUpdate(BaseModel):
    title: str | None = None
    desc: str | None = None
    category: str | None = None
    time: str | None = None
    content: str | None = None
    status: str | None = None


class GuideResponse(BaseModel):
    id: int
    title: str
    desc: str | None
    author_name: str | None
    category: str | None
    time: str | None
    views: str
    date: str | None
    content: str | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Agent
class AgentCreate(BaseModel):
    title: str
    desc: str | None = None
    number: str | None = None
    status: str = "active"


class AgentResponse(BaseModel):
    id: int
    number: str | None
    title: str
    desc: str | None
    status: str
    content_status: str

    model_config = {"from_attributes": True}


# Ruleset
class RulesetCreate(BaseModel):
    title: str
    desc: str | None = None
    language: str | None = None
    content: str | None = None


class RulesetResponse(BaseModel):
    id: int
    title: str
    desc: str | None
    language: str | None
    content: str | None
    content_status: str

    model_config = {"from_attributes": True}


# Proposal
class ProposalCreate(BaseModel):
    type: str
    title: str
    description: str
    content: str
    email: str
    tags: list[str] = []


class ProposalResponse(BaseModel):
    id: int
    type: str
    title: str
    description: str | None
    content: str | None
    email: str
    tags: list[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Paginated responses
class PaginatedPrompts(BaseModel):
    items: list[PromptResponse]
    total: int
    page: int
    limit: int
    pages: int


class PaginatedGuides(BaseModel):
    items: list[GuideResponse]
    total: int
    page: int
    limit: int
    pages: int


class PaginatedAgents(BaseModel):
    items: list[AgentResponse]
    total: int
    page: int
    limit: int
    pages: int


class PaginatedRulesets(BaseModel):
    items: list[RulesetResponse]
    total: int
    page: int
    limit: int
    pages: int


class PaginatedProposals(BaseModel):
    items: list[ProposalResponse]
    total: int
    page: int
    limit: int
    pages: int


class PaginatedUsers(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    limit: int
    pages: int
