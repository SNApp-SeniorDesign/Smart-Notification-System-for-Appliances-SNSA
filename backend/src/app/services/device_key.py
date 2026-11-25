import hmac
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.device_auth import (
    generate_device_key,
    hash_device_key,
    normalize_serial,
)
from app.core.settings import settings
from app.exceptions.device import (
    device_key_already_claimed,
    device_not_exist,
    invalid_device_key,
)
from app.repository.device import DeviceRepository
from app.repository.device_key import DeviceKeyRepository
from app.schemas.device import DeviceClaimResponse
from app.schemas.event import EventMessage

# auto_error=False so a missing header can be allowed while enforcement is off
device_key_scheme = HTTPBearer(auto_error=False)


class DeviceKeyService:
    def __init__(self) -> None:
        self.repository = DeviceKeyRepository
        self.device_repository = DeviceRepository

    # Post
    def claim_device_key(self, db: Session, serial_number: str) -> DeviceClaimResponse:
        device = self.device_repository.get_by_serial_number(
            db, normalize_serial(serial_number)
        )
        if device is None:
            device_not_exist()

        if self.repository.get_by_device_id(db, device.id) is not None:
            device_key_already_claimed()

        device_key = generate_device_key()
        try:
            self.repository.create_device_key(
                db, device.id, hash_device_key(device_key)
            )
        except IntegrityError:
            # Another claim for the same device won the race
            db.rollback()
            device_key_already_claimed()

        # The plaintext key is only ever returned here
        return DeviceClaimResponse(device_id=device.id, device_key=device_key)

    # Dependency for POST /event
    def verify_device_key(
        self,
        event_message: EventMessage,
        db: Annotated[Session, Depends(get_db)],
        credentials: Annotated[
            HTTPAuthorizationCredentials | None, Depends(device_key_scheme)
        ],
    ) -> EventMessage:
        if credentials is None:
            if settings.require_device_key:
                invalid_device_key()
            return event_message

        # A key that was sent is always checked, even while enforcement is off
        device = self.device_repository.get_by_serial_number(
            db, normalize_serial(event_message.deviceID)
        )
        stored_key = self.repository.get_by_device_id(db, device.id) if device else None
        if stored_key is None or not hmac.compare_digest(
            hash_device_key(credentials.credentials), stored_key.key_hash
        ):
            invalid_device_key()

        return event_message


device_key_service = DeviceKeyService()
