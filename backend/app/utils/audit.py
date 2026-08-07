from typing import Optional
from sqlalchemy.orm import Session
from app.database.crud import log_audit
from app.utils.logger import logger


def record_audit_log(
    db: Session,
    action: str,
    resource: str,
    status: str,
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
):
    """
    Helper function to safely record audit events.
    """
    try:
        log_audit(
            db=db,
            action=action,
            resource=resource,
            status=status,
            user_id=user_id,
            ip_address=ip_address,
        )
        logger.info(f"Audit Log recorded: [{action}] resource={resource} status={status} user={user_id}")
    except Exception as exc:
        logger.error(f"Failed to record audit log: {exc}")
