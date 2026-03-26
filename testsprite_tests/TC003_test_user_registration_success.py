import requests
import uuid

BASE_URL = "http://localhost:4173"
TIMEOUT = 30

def test_user_registration_success():
    url = f"{BASE_URL}/auth/v1/signup"
    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    password = "StrongPassw0rd!"
    payload = {
        "email": unique_email,
        "password": password
    }
    headers = {
        "Content-Type": "application/json"
    }
    # Supabase default headers might require apikey - normally required but not provided in PRD
    # So sending minimal headers as per standard Supabase auth REST interface.

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()

        # Check that user data and session info are returned or at least email confirmation info
        assert "user" in data, "Response missing 'user' field"
        assert data["user"]["email"] == unique_email, "Registered email does not match"
        # Supabase usually returns confirmation sent message or confirmation_required flag
        # Email verification confirmation is typically indicated by user.confirmation_sent_at or similar
        # We'll check that confirmation_sent_at field exists and is not null or empty
        assert "confirmation_sent_at" in data["user"], "Email verification confirmation not sent"
        assert data["user"]["confirmation_sent_at"] is not None, "Email verification confirmation time is None"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {str(e)}"
    except AssertionError:
        raise

test_user_registration_success()