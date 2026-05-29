from typing import Any, List, Optional
from services.agent.schemas import BotRuntimeContext

def assert_runtime_scope(runtime: BotRuntimeContext):
    """Ensure runtime has required scope identifiers"""
    if not runtime.tenant_id:
        raise ValueError("tenant_id is required in runtime context")
    if not runtime.site_id:
        raise ValueError("site_id is required in runtime context")
    if not runtime.bot_id:
        raise ValueError("bot_id is required in runtime context")

def assert_record_scope(runtime: BotRuntimeContext, record: Any):
    """Ensure record matches the runtime scope"""
    # record can be a dict or an object with tenant_id, site_id, bot_id
    r_tenant = getattr(record, "tenant_id", None) or record.get("tenant_id")
    r_site = getattr(record, "site_id", None) or record.get("site_id")
    r_bot = getattr(record, "bot_id", None) or record.get("bot_id")
    
    if r_tenant != runtime.tenant_id:
        raise PermissionError(f"Tenant mismatch: {r_tenant} != {runtime.tenant_id}")
    if r_site != runtime.site_id:
        raise PermissionError(f"Site mismatch: {r_site} != {runtime.site_id}")
    if r_bot != runtime.bot_id:
        raise PermissionError(f"Bot mismatch: {r_bot} != {runtime.bot_id}")

def filter_records_for_runtime(runtime: BotRuntimeContext, records: List[Any]) -> List[Any]:
    """Filters a list of records to only those matching runtime scope"""
    return [
        r for r in records 
        if (getattr(r, "tenant_id", None) or r.get("tenant_id")) == runtime.tenant_id
        and (getattr(r, "site_id", None) or r.get("site_id")) == runtime.site_id
        and (getattr(r, "bot_id", None) or r.get("bot_id")) == runtime.bot_id
    ]

def reject_cross_tenant(record: Any, runtime: BotRuntimeContext):
    """Explictly reject if record doesn't belong to tenant"""
    try:
        assert_record_scope(runtime, record)
    except (PermissionError, ValueError):
        return True
    return False
