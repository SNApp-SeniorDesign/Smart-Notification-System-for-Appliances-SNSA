from fastapi import HTTPException, status


def device_not_exist() -> None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Device not found",
    )


def device_key_already_claimed() -> None:
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Device key already claimed",
    )


def invalid_device_key() -> None:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid device key",
        headers={"WWW-Authenticate": "Bearer"},
    )
