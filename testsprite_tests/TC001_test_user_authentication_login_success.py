import requests

BASE_URL = "http://localhost:4173"
TIMEOUT = 30

def test_user_authentication_login_success():
    """
    Verify that a user can successfully log in with valid email and password
    credentials using the supabase.auth.signInWithPassword API endpoint and is
    redirected to the client panel.
    """
    # Sample valid credentials - replace with valid test user credentials
    email = "testuser@example.com"
    password = "ValidPassword123!"

    login_url = f"{BASE_URL}/auth/v1/token?grant_type=password"
    # According to supabase docs, signInWithPassword is a POST to /auth/v1/token with JSON body
    headers = {
        "Content-Type": "application/json",
        "apikey": "public-anonymous-key"  # if required, else remove or add actual key
    }
    payload = {
        "email": email,
        "password": password
    }

    try:
        response = requests.post(login_url, json=payload, headers=headers, timeout=TIMEOUT)
        # Assert status code 200 OK for successful login
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        resp_json = response.json()

        # Check that an access token is returned
        assert "access_token" in resp_json and resp_json["access_token"], "No access_token in response"
        assert "refresh_token" in resp_json and resp_json["refresh_token"], "No refresh_token in response"

        # Check user info includes the email used to login
        user = resp_json.get("user")
        assert user is not None, "No user object in response"
        assert user.get("email") == email, "Logged in user email does not match"

        # Simulate redirect to client panel by accessing /client-panel route with the access token:
        client_panel_url = f"{BASE_URL}/client-panel"
        client_panel_headers = {
            "Authorization": f"Bearer {resp_json['access_token']}"
        }
        cp_response = requests.get(client_panel_url, headers=client_panel_headers, timeout=TIMEOUT)
        # Status 200 expected for authorized access
        assert cp_response.status_code == 200, f"Access to client panel failed with status {cp_response.status_code}"

    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Login test failed: {str(e)}")

test_user_authentication_login_success()