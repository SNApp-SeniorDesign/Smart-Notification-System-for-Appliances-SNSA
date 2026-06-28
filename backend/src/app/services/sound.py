from app.repository.sound import SoundRepository

from sqlalchemy.orm import Session


class SoundService:
    def __init__(self) -> None:
        self.repository = SoundRepository

    def is_sound_name_taken(self, db: Session, sound_name: str, device_id: int) -> bool:
        return self.repository.get_by_sound_name(db, sound_name, device_id) is not None
