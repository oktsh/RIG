from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


# Auth
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# User
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    role: str = "USER"

    @field_validator('name', 'email', mode='before')
    @classmethod
    def strip_whitespace(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not v.strip():
            raise ValueError('Cannot be empty or whitespace')
        return v.strip()


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
    title: str = Field(..., min_length=3, max_length=200)
    desc: str | None = Field(default=None, max_length=500)
    tags: list[str] = Field(default=[], max_items=10)
    tech: str | None = None
    content: str | None = None

    @field_validator('title', mode='before')
    @classmethod
    def strip_title(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()

    @field_validator('content', mode='before')
    @classmethod
    def validate_content(cls, v: str | None) -> str | None:
        if v is None:
            return v
        stripped = v.strip()
        if len(stripped) < 10:
            raise ValueError('Content must be at least 10 characters')
        if len(stripped) > 50000:
            raise ValueError('Content must be at most 50000 characters')
        return stripped


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
    title: str = Field(..., min_length=3, max_length=200)
    desc: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=50)
    time: str | None = Field(default=None, max_length=20)
    content: str | None = None

    @field_validator('title', mode='before')
    @classmethod
    def strip_title(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()

    @field_validator('content', mode='before')
    @classmethod
    def validate_content(cls, v: str | None) -> str | None:
        if v is None:
            return v
        stripped = v.strip()
        if len(stripped) < 10:
            raise ValueError('Content must be at least 10 characters')
        if len(stripped) > 100000:
            raise ValueError('Content must be at most 100000 characters')
        return stripped


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
    title: str = Field(..., min_length=3, max_length=200)
    desc: str | None = Field(default=None, max_length=500)
    number: str | None = Field(default=None, max_length=10)
    status: str = "active"

    @field_validator('title', mode='before')
    @classmethod
    def strip_title(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()


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
    title: str = Field(..., min_length=3, max_length=200)
    desc: str | None = Field(default=None, max_length=500)
    language: str | None = Field(default=None, max_length=50)
    content: str | None = None

    @field_validator('title', mode='before')
    @classmethod
    def strip_title(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()

    @field_validator('content', mode='before')
    @classmethod
    def validate_content(cls, v: str | None) -> str | None:
        if v is None:
            return v
        stripped = v.strip()
        if len(stripped) < 10:
            raise ValueError('Content must be at least 10 characters')
        if len(stripped) > 100000:
            raise ValueError('Content must be at most 100000 characters')
        return stripped


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
    type: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    content: str = Field(..., min_length=10, max_length=50000)
    email: EmailStr
    tags: list[str] = Field(default=[], max_items=10)

    @field_validator('title', mode='before')
    @classmethod
    def strip_title(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()


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
