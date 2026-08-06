from app.repository.sound import SoundRepository
from app.models.sound import Sound
from app.schemas.sound import SoundUpdate
from app.exceptions.sound import sound_not_exist, sound_exist

from pathlib import Path
from uuid import uuid4
import shutil
from sqlalchemy.orm import Session
from fastapi import status, HTTPException, UploadFile

import os
import boto3

class SoundService:
    def __init__(self, upload_dir: Path | None = None) -> None:
        self.repository = SoundRepository
        self.upload_dir = upload_dir or Path("uploads/sounds")
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    #helper to know storage sound file locally or in soundflare
    def is_using_r2(self) -> bool:
        return os.getenv("STORAGE_BACKEND", "local").lower() == "r2"

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

    def get_all_unsynced_sound(self, db: Session, device_id: int) -> list[Sound] | None:
        device_sound = self.repository.get_all_unsynced_sound(db, device_id)
        return device_sound

    def get_sound_by_id(self, db: Session, sound_id: int) -> Sound | None:
        device_sound = self.repository.get_by_id(db, sound_id)
        if device_sound is None:
            sound_not_exist()
        return device_sound

    # Post

    def create_sound(
        self,
        db: Session,
        device_id: int,
        sound_name: str,
        file: UploadFile,
    ) -> Sound:
        if self.is_sound_name_taken(db, sound_name, device_id):
            sound_exist()

        sound_file_url = self.save_sound_file(file)

        sound = Sound(
            device_id=device_id,
            sound_name=sound_name,
            sound_file_url=sound_file_url,
            sound_status="monitoring",
            is_on=True,
            is_synced_to_device=False,
            profile_version=1,
        )

        return self.repository.create_sound(db, sound)

    # FIXME: For now only work locally, need to fix so it work at launch
    def save_sound_file(self, file: UploadFile) -> str:

        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Sound file is required"
            )

        file_ext = Path(file.filename).suffix
        stored_filename = f"{uuid4()}{file_ext}"

        #Soundflare storage
        if self.is_using_r2():
            return self.save_sound_file_to_r2(file, stored_file_name)


        #Local Storage
        file_path = self.upload_dir / stored_filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return f"/uploads/sounds/{stored_filename}"

    # Update

    def update_sound(
        self,
        db: Session,
        sound: Sound,
        sound_db: SoundUpdate,
        file: UploadFile | None = None,
    ) -> Sound:
        if sound_db.sound_name is not None:
            sound.sound_name = sound_db.sound_name

        if sound_db.sound_status is not None:
            sound.sound_status = sound_db.sound_status

        old_file_url = sound.sound_file_url

        if file is not None:
            sound.sound_file_url = self.save_sound_file(file)
            sound.profile_version += 1
            sound.is_synced_to_device = False

        updated_sound = self.repository.sound_update(
            db,
            sound,
        )

        if file is not None and old_file_url:
            self.delete_sound_file(old_file_url)

        return updated_sound

    # Delete

    # Delete old sound file helper
    def delete_sound_file(self, sound_file_url: str) -> None:

        if not sound_file_url:
            return

        filename = Path(sound_file_url).name
        file_path = self.upload_dir / filename

        if file_path.exists() and file_path.is_file():
            file_path.unlink()  # Delete the file

    def delete_sound(self, db: Session, db_sound: Sound) -> None:
        self.delete_sound_file(db_sound.sound_file_url)
        self.repository.delete_sound(db, db_sound)

    def delete_all_sound_files(self, sounds: list[Sound]) -> None:
        for sound in sounds:
            self.delete_sound_file(sound.sound_file_url)


sound_service = SoundService()
