from pydantic import BaseModel, emailStr, Field
from pydantic import field_validator


class UserBase(BaseModel):
    username: emailStr
    email: emailStr


class UserCreate(UserBase):
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Password cannot be empty")
        return v
