from app.repository.sound import SoundRepository
from app.models.sound import Sound
from app.exceptions.sound import sound_not_exist

from sqlalchemy.orm import Session


class SoundService:
    def __init__(self) -> None:
        self.repository = SoundRepository

    def is_sound_name_taken(self, db: Session, sound_name: str, device_id: int) -> bool:
        return self.repository.get_by_sound_name(db, sound_name, device_id) is not None

    def get_by_sound_name(
        self, db: Session, sound_name: str, device_id: int
    ) -> Sound | None:
        sound = self.repository.get_by_sound_name(db, sound_name, device_id)
        if sound is None:
            sound_not_exist()
        return sound

    def get_all_sound(self, db: Session, device_id: int) -> list[Sound] | None:
        device_sound = self.repository.get_all_sound(db, device_id)
        return device_sound

    def get_sound_by_id(self, db: Session, sound_id: int) -> Sound | None:
        device_sound = self.repository.get_by_id(db, sound_id)
        if device_sound is None:
            sound_not_exist()
        return device_sound
