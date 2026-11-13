from sqlalchemy.orm import Session

from app.models.device_key import DeviceKey


class DeviceKeyRepository:
    # Get

    @staticmethod
    def get_by_device_id(db: Session, device_id: int) -> DeviceKey | None:
        return db.query(DeviceKey).filter(DeviceKey.device_id == device_id).first()

    # Post

    @staticmethod
    def create_device_key(db: Session, device_id: int, key_hash: str) -> DeviceKey:
        db_device_key = DeviceKey(device_id=device_id, key_hash=key_hash)
        db.add(db_device_key)
        db.commit()
        db.refresh(db_device_key)
        return db_device_key
