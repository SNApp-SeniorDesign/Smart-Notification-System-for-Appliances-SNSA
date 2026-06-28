from app.repository.device import SoundRepository


class SoundService:
    def __init__(self) -> None:
        self.repository = SoundRepository

    # def is_sound_name_taken(self, db: Session, sound_name: str, device_id: int) -> bool:
