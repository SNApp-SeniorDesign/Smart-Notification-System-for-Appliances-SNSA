from pydantic import Field, BaseModel


class DeviceBase(BaseModel):
    user_id: int
    device_name: str = Field(min_lenght=3)
