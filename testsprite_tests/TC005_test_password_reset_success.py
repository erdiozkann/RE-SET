import requests

def test_password_reset_success():
    base_url = "http://localhost:4173"
    endpoint = "/auth/v1/reset-password"
    url = base_url + endpoint
    # Use a registered email known to exist in the supabase auth users
    # For testing purposes, use a placeholder registered email; in live test replace with actual
    registered_email = "registered_user@example.com"

    headers = {
        "Content-Type": "application/json",
        "apikey": "public-anonymous-key",  # Replace with actual anon/public key if required
        "Authorization": "Bearer public-anonymous-key"
    }
    payload = {
        "email": registered_email
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to resetPasswordForEmail failed: {e}"

    # Supabase typically returns status 200 with JSON { "data": {...}, "error": null }
    # or just status 200 with empty body if successful
    assert response.status_code == 200, f"Unexpected status code: {response.status_code}"

    # Validate that response content indicates email sent
    # Supabase password reset API usually gives no error field on success
    try:
        resp_json = response.json()
    except ValueError:
        resp_json = {}

    # Check for no error in response
    assert 'error' not in resp_json or resp_json['error'] is None, f"API error returned: {resp_json.get('error')}"

    # Optionally check for message or other indicators if present
    # If Supabase doesn't send message, status code 200 is sufficient

test_password_reset_success()