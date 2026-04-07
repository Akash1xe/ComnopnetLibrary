from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password


def test_password_hashing_roundtrip():
    password = "StrongPass1"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True


def test_access_token_contains_type():
    token = create_access_token({"sub": "user-1", "tier": "free"})
    payload = decode_token(token)
    assert payload["sub"] == "user-1"
    assert payload["type"] == "access"


def test_refresh_token_contains_type():
    token = create_refresh_token({"sub": "user-1", "tier": "free"})
    payload = decode_token(token)
    assert payload["sub"] == "user-1"
    assert payload["type"] == "refresh"
