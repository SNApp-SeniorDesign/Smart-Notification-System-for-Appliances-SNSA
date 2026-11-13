import hashlib
import re
import secrets

# 12 hex digits once separators (":", "-", ".", spaces) are removed
MAC_HEX = re.compile(r"[0-9a-f]{12}")
MAC_SEPARATORS = re.compile(r"[:\-.\s]")


def normalize_serial(serial_number: str) -> str:
    """
    Normalize a device serial number so the user's registration and the
    device's own requests always match.

    MAC addresses in any common format (AA:BB:CC:DD:EE:FF, aa-bb-cc-dd-ee-ff,
    aabb.ccdd.eeff, AABBCCDDEEFF) become lowercase and colon-separated.
    Anything else is only trimmed.

    Args:
        serial_number: The serial number or MAC address to normalize

    Returns:
        str: The normalized serial number
    """
    value = serial_number.strip()
    hex_only = MAC_SEPARATORS.sub("", value.lower())
    if MAC_HEX.fullmatch(hex_only):
        return ":".join(hex_only[i : i + 2] for i in range(0, 12, 2))
    return value


def generate_device_key() -> str:
    """
    Generate a new random device key.

    Returns:
        str: A URL-safe key with 256 bits of randomness
    """
    return secrets.token_urlsafe(32)


def hash_device_key(device_key: str) -> str:
    """
    Hash a device key for storage and comparison.

    Args:
        device_key: The plaintext device key

    Returns:
        str: The SHA-256 hex digest of the key
    """
    return hashlib.sha256(device_key.encode()).hexdigest()
