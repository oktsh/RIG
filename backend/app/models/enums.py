from enum import Enum


class UserRole(str, Enum):
    """User role enumeration"""

    USER = "USER"
    MODERATOR = "MODERATOR"
    ADMIN = "ADMIN"


class ContentStatus(str, Enum):
    """Content status enumeration (for Prompts, Guides)"""

    DRAFT = "draft"
    PENDING = "pending"
    PUBLISHED = "published"
    REJECTED = "rejected"


class AgentStatus(str, Enum):
    """Agent status enumeration"""

    ACTIVE = "active"
    BETA = "beta"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"


class ProposalStatus(str, Enum):
    """Proposal status enumeration"""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
