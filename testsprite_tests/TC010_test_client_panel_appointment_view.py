import requests
import time

# Use the actual Supabase project Auth base URL for auth
supabase_auth_url = "https://xyz.supabase.co/auth/v1/token"

# Base URL for the REST API requests (frontend or supabase REST endpoint)
base_url = "http://localhost:4173"
timeout = 30

# Credentials for the authenticated client (replace with valid test credentials)
test_email = "testclient@example.com"
test_password = "TestClientPass123!"

# Supabase anon key for auth and authorization
supabase_anon_key = "anon_key"

def test_client_panel_appointment_view():
    session = requests.Session()
    try:
        # 1. Authenticate the client via Supabase Auth REST API
        auth_url = f"{supabase_auth_url}?grant_type=password"
        auth_headers = {
            "Content-Type": "application/json",
            "apikey": supabase_anon_key
        }
        auth_payload = {
            "email": test_email,
            "password": test_password
        }
        auth_response = session.post(auth_url, json=auth_payload, headers=auth_headers, timeout=timeout)
        assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"
        auth_data = auth_response.json()
        access_token = auth_data.get("access_token")
        assert access_token, "access_token missing in auth response"

        # 2. Use access_token to query appointments table for upcoming appointments
        appointments_url = f"{base_url}/rest/v1/appointments"

        today_iso = time.strftime("%Y-%m-%d")
        headers = {
            "Authorization": f"Bearer {access_token}",
            "apikey": supabase_anon_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Prefer": "return=representation"
        }
        params = {
            "client_email": f"eq.{test_email}",
            "appointment_date": f"gte.{today_iso}",
            "select": "*"
        }

        response = session.get(appointments_url, headers=headers, params=params, timeout=timeout)
        assert response.status_code == 200, f"Failed to fetch appointments: {response.text}"
        appointments = response.json()

        # 3. Verify response contains appointment data (list) and data integrity
        assert isinstance(appointments, list), "Appointments response is not a list"
        for appt in appointments:
            assert "id" in appt, "Appointment missing id"
            assert "client_email" in appt, "Appointment missing client_email"
            assert appt["client_email"] == test_email, "Appointment client_email mismatch"
            assert "appointment_date" in appt, "Appointment missing appointment_date"
            assert "appointment_time" in appt or "appointment_start" in appt, "Appointment missing time info"

    except requests.RequestException as e:
        assert False, f"RequestException occurred: {str(e)}"
    finally:
        session.close()

test_client_panel_appointment_view()
