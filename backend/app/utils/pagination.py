import math

from sqlalchemy.orm import Query


def paginate(query: Query, page: int = 1, limit: int = 20) -> dict:
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": math.ceil(total / limit) if limit > 0 else 0,
    }
