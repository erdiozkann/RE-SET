import requests
import uuid
import datetime

BASE_URL = "http://localhost:4173"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_appointment_booking_time_slot_unavailable():
    # Step 1: Create an initial appointment for a specific date and time
    appointment_date = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
    appointment_time = "10:00"
    contact_info = {
        "name": "Test User",
        "email": f"testuser_{uuid.uuid4()}@example.com",
        "phone": "+900000000000"
    }

    initial_payload = {
        "date": appointment_date,
        "time": appointment_time,
        "contact_name": contact_info["name"],
        "contact_email": contact_info["email"],
        "contact_phone": contact_info["phone"]
    }

    try:
        # Insert initial appointment
        response = requests.post(
            f"{BASE_URL}/booking",
            headers=HEADERS,
            json=initial_payload,
            timeout=TIMEOUT,
        )
        assert response.status_code == 201 or response.status_code == 200, f"Unexpected status code for initial appointment creation: {response.status_code}"
        data = response.json()
        # Expecting the created appointment ID in response e.g. {'id': 123, ...}
        assert "id" in data, "Response does not contain appointment ID"

        # Step 2: Try to book the same date and time slot again with different contact info
        new_contact_info = {
            "name": "Conflict User",
            "email": f"conflict_{uuid.uuid4()}@example.com",
            "phone": "+900000000001"
        }
        conflict_payload = {
            "date": appointment_date,
            "time": appointment_time,
            "contact_name": new_contact_info["name"],
            "contact_email": new_contact_info["email"],
            "contact_phone": new_contact_info["phone"]
        }

        conflict_response = requests.post(
            f"{BASE_URL}/booking",
            headers=HEADERS,
            json=conflict_payload,
            timeout=TIMEOUT,
        )

        # Expecting an error status such as 409 Conflict or 400 Bad Request
        # And a message about time slot unavailable
        assert conflict_response.status_code in (400, 409), f"Expected error status for time slot conflict but got {conflict_response.status_code}"
        error_data = conflict_response.json()
        assert "error" in error_data or "message" in error_data, "Expected error message in response"
        error_message = error_data.get("error") or error_data.get("message")
        assert "time slot unavailable" in error_message.lower(), f"Expected 'time slot unavailable' error but got: {error_message}"

        # Step 3: Verify no additional appointment was added with the same time slot
        # Fetch appointments for that date and time and ensure count is 1
        fetch_response = requests.get(
            f"{BASE_URL}/booking",
            headers=HEADERS,
            params={"date": appointment_date, "time": appointment_time},
            timeout=TIMEOUT,
        )
        assert fetch_response.status_code == 200, f"Failed to fetch appointments, status: {fetch_response.status_code}"
        appointments = fetch_response.json()
        assert isinstance(appointments, list), "Expected a list of appointments"
        # Only one appointment should exist for that date/time
        assert len([appt for appt in appointments if appt.get("time") == appointment_time]) == 1, "More than one appointment found for the same time slot"

    finally:
        # Cleanup skipped (no public API for deleting appointment)
        pass

test_appointment_booking_time_slot_unavailable()
