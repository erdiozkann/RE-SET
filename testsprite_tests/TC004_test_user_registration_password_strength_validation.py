import requests

def test_user_registration_password_strength_validation():
    base_url = "http://localhost:4173"
    endpoint = "/auth/v1/signup"
    url = base_url + endpoint

    # Weak password to trigger validation error
    payload = {
        "email": "testuser_pwweak@example.com",
        "password": "123",
    }

    headers = {
        "Content-Type": "application/json",
        "apikey": "public-anon-key"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        # Supabase returns 400 status code for weak password
        assert response.status_code == 400

        data = response.json()
        # Check that response indicates weak password error
        error_message = ""
        if 'error' in data and data['error'] is not None:
            error_message = str(data['error']).lower()
        elif 'message' in data:
            error_message = str(data['message']).lower()
        assert 'password' in error_message and ('weak' in error_message or 'too weak' in error_message)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"


test_user_registration_password_strength_validation()
