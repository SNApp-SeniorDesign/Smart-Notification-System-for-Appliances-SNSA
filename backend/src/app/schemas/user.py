from pydantic import BaseModel, EmailStr, Field
from pydantic import field_validator


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Password cannot be empty")
        return v


class UserDB(UserBase):
    hashed_password: str


class UserResponse(UserBase):
    id: int

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None


class Token(BaseModel):
    access_token: str
    token_type: str
