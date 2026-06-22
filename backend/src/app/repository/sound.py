from sqlalchemy.orm import Session
from app.exceptions.device import device_not_exist

from app.models.sound import Sound
from app.models.device import Device

from app.schemas.sound import SoundDB


class SoundRepository:
    # Post
    def create_sound(
        db: Session,
        sound_data: SoundDB,
    ) -> Sound:

        device = db.query(Device).filter(Device.id == sound_data.device_id).first()

        if not device:
            device_not_exist()

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
