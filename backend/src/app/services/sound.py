from app.repository.sound import SoundRepository
from app.models.sound import Sound
from app.exceptions.sound import sound_not_exist

from pathlib import Path
from uuid import uuid4
import shutil
from sqlalchemy.orm import Session
from fastapi import status, HTTPException, UploadFile

UPLOAD_DIR = Path("uploads/sounds")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class SoundService:
    def __init__(self) -> None:
        self.repository = SoundRepository

    # Get

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

    # Post

    # FIXME: For now only work locally, need to fix so it work at launch
    def create_sound(
        self, db: Session, device_id: int, sound_name: str, file: UploadFile
    ) -> Sound:

        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Sound file is required"
            )

        file_ext = Path(file.filename).suffix
        stored_filename = f"{uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / stored_filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        sound = Sound(
            device_id=device_id,
            sound_name=sound_name,
            sound_file_url=f"/uploads/sounds/{stored_filename}",
            sound_status="monitoring",
            is_on=True,
            is_synced_to_device=False,
            profile_version=1,
        )

        return self.repository.create_sound(db, sound)
