import requests

def test_password_reset_unregistered_email():
    base_url = "http://localhost:4173"
    endpoint = "/supabase.auth.resetPasswordForEmail"
    url = f"{base_url}{endpoint}"
    headers = {
        "Content-Type": "application/json"
    }
    # Use an email that is assumed not to be registered
    payload = {
        "email": "unregistered_email_for_test@example.com"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        # Assuming API returns JSON with error message on failure
        response_json = response.json()
    
        # Validate status code indicates failure (commonly 4xx)
        assert response.status_code != 200, "Expected non-200 status for unregistered email"
        # Validate error message content
        error_message = response_json.get("error") or response_json.get("message") or ""
        assert "Email not found" in error_message, f"Expected 'Email not found' error message but got: {error_message}"
    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_password_reset_unregistered_email()