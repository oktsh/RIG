from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="USER")  # ADMIN, MODERATOR, USER
    requires_approval = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    prompts = relationship("Prompt", back_populates="author_rel")
    guides = relationship("Guide", back_populates="author_rel")
    agents = relationship("Agent", back_populates="author_rel")
    rulesets = relationship("Ruleset", back_populates="author_rel")


class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    desc = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    author_name = Column(String(255))
    copies = Column(String(20), default="0")
    tags = Column(JSON, default=list)
    tech = Column(String(255))
    content = Column(Text)
    status = Column(String(20), default="draft")  # draft, pending, published, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author_rel = relationship("User", back_populates="prompts")


class Guide(Base):
    __tablename__ = "guides"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    desc = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    author_name = Column(String(255))
    category = Column(String(100))
    time = Column(String(50))
    views = Column(String(20), default="0")
    date = Column(String(50))
    content = Column(Text)
    status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author_rel = relationship("User", back_populates="guides")


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(10))
    title = Column(String(255), nullable=False)
    desc = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(20), default="active")  # active, beta, inactive
    content_status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author_rel = relationship("User", back_populates="agents")


class Ruleset(Base):
    __tablename__ = "rulesets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    desc = Column(Text)
    language = Column(String(100))
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content = Column(Text)
    content_status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author_rel = relationship("User", back_populates="rulesets")


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    content = Column(Text)
    email = Column(String(255), nullable=False)
    tags = Column(JSON, default=list)
    status = Column(String(20), default="pending")  # pending, approved, rejected
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
