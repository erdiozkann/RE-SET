import requests

def test_user_authentication_login_failure():
    base_url = "http://localhost:4173"
    endpoint = f"{base_url}/auth/v1/token"
    headers = {
        "Content-Type": "application/json",
        "apikey": "public-anon-key",
        "Authorization": "Bearer public-anon-key"
    }
    payload = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword",
        "grant_type": "password"
    }

    try:
        response = requests.post(
            endpoint,
            json=payload,
            headers=headers,
            timeout=30
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 400 or response.status_code == 401, \
        f"Expected status 400 or 401, got {response.status_code}"

    try:
        response_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    error_message_candidates = [
        response_json.get("error_description"),
        response_json.get("error"),
        response_json.get("message"),
    ]
    error_message = next((msg for msg in error_message_candidates if msg), "")

    assert "invalid credentials" in error_message.lower() or "invalid login credentials" in error_message.lower() or "invalid password" in error_message.lower(), \
        f"Expected 'Invalid credentials' error message in response, got: {error_message}"

test_user_authentication_login_failure()