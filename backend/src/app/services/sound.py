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

    #service to get the url to sound file save on Cloudflare
    def get_sound_file_url(self, sound_file_url: str) -> str:
        if not sound_file_url:
            return ""
        
        if not self.is_using_r2():
            return sound_file_url
        
        account_id = os.getenv("R2_ACCOUNT_ID")
        access_key_id = os.getenv("R2_ACCESS_KEY_ID")
        secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
        bucket_name = os.getenv("R2_BUCKET_NAME")

        if not all(
            [
                account_id,
                access_key_id,
                secret_access_key,
                bucket_name,
            ]
        ):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="R2 storage is not configured correctly",
            )
        r2_client = boto3.client(
            "s3",
            endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name="auto",
        )

        return r2_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": bucket_name,
                "Key": sound_file_url,
            },
            ExpiresIn=3600,
        )

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

    
    #function helper to save sound file to Cloudflare
    def save_sound_file_to_r2(
        self,
        file: UploadFile,
        stored_filename: str
    ) -> str:
        account_id = os.getenv("R2_ACCOUNT_ID")
        access_key_id = os.getenv("R2_ACCESS_KEY_ID")
        secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
        bucket_name = os.getenv("R2_BUCKET_NAME")

        if not all (
            [
                account_id,
                access_key_id,
                secret_access_key,
                bucket_name,
            ]
        ):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="R2 storage is not configured correctly",
            )
        r2_client = boto3.client(
            "s3",
            endpoint_url = (
                f"https:/{account_id}.r2.cloudflarestorage.com"
            ),
            aws_access_key_id=access_key_id,
            aws_secret_access=secret_access_key,
            region_name="auto"
        )

        object_key = f"sounds/{stored_filename}"

        file.file.seek(0)

        r2_client.upload_fileobj(
            file.file,
            bucket_name,
            object_key,
            ExtraArgs={
                "Contenttype": (
                    file.content_type
                    or "application/octet-stream"
                )
            },
        )

        return object_key

    def save_sound_file(self, file: UploadFile) -> str:

        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Sound file is required"
            )

        file_ext = Path(file.filename).suffix
        stored_file_name = f"{uuid4()}{file_ext}"

        #Soundflare storage
        if self.is_using_r2():
            return self.save_sound_file_to_r2(file, stored_file_name)


        #Local Storage
        file_path = self.upload_dir / stored_file_name

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return f"/uploads/sounds/{stored_file_name}"

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

        if self.is_using_r2():
            account_id = os.getenv("R2_AC")

        if not sound_file_url:
            return

        if self.is_using_r2():
            account_id = os.getenv("R2_ACCOUNT_ID")
            access_key_id = os.getenv("R2_ACCESS_KEY_ID")
            secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
            bucket_name = os.getenv("R2_BUCKET_NAME")

            if not all(
                [
                    account_id,
                    access_key_id,
                    secret_access_key,
                    bucket_name,
                ]
            ):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="R2 storage is not configured correctly",
                )

            r2_client = boto3.client(
                "s3",
                endpoint_url=(
                    f"https://{account_id}.r2.cloudflarestorage.com"
                ),
                aws_access_key_id=access_key_id,
                aws_secret_access_key=secret_access_key,
                region_name="auto",
            )

            r2_client.delete_object(
                Bucket=bucket_name,
                Key=sound_file_url,
            )
            return


        #Local Storage
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
