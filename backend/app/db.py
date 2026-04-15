from typing import Any, Dict

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.core.config import get_settings

settings = get_settings()

engine: AsyncEngine = create_async_engine(
    settings.supabase_db_url,
    pool_pre_ping=True,
    pool_recycle=1800,
    future=True,
)


async def run_healthcheck() -> Dict[str, Any]:
    async with engine.connect() as connection:
        result = await connection.execute(
            text(
                """
                select
                  current_database() as database_name,
                  current_schema() as schema_name,
                  timezone('utc', now()) as server_time,
                  (select count(*) from public.deals) as deals_count,
                  (select count(*) from public.documents) as documents_count
                """
            )
        )
        row = result.mappings().one()

    return {
        "ok": True,
        "database": row["database_name"],
        "schema": row["schema_name"],
        "server_time": row["server_time"].isoformat() if row["server_time"] else None,
        "deals_count": row["deals_count"],
        "documents_count": row["documents_count"],
    }