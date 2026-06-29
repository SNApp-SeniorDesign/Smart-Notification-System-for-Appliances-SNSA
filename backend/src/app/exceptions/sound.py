from fastapi import HTTPException, status


def sound_not_exist() -> None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Sound not found",
    )
