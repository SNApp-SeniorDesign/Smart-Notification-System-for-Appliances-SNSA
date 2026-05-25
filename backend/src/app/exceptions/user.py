from fastapi import HTTPException, status


def user_not_exist() -> None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found",
    )


def unauthorized() -> None:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"},
    )
