from sqlalchemy.orm import Session

from app.models.sound import Sound

from app.schemas.sound import SoundDB


class SoundRepository:
    # Post
    def create_sound(
        db: Session,
        sound_data: SoundDB,
    ) -> Sound:

        db_sound = Sound(
            device_id=sound_data.device_id,
            sound_name=sound_data.sound_name,
            is_synced_to_device=sound_data.is_synced_to_device,
            sound_status=sound_data.sound_status,
            profile_version=sound_data.profile_version,
            sound_file_url=sound_data.sound_file_url,
        )
        db.add(db_sound)
        db.commit()
        db.refresh(db_sound)
        return db_sound

    # Get
    def get_by_id(db: Session, sound_id: int, device_id: int) -> Sound | None:
        return (
            db.query(Sound)
            .filter(Sound.id == sound_id, Sound.device_id == device_id)
            .first()
        )

    # Update
    def sound_update(db: Session, sound_db: Sound) -> Sound | None:
        db.commit()
        db.refresh(sound_db)
        return sound_db

    # Delete
    def delete_sound(db: Session, sound_db: Sound) -> None:
        db.delete(sound_db)
        db.commit()
