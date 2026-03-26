import requests
import uuid
from datetime import datetime, timedelta

BASE_URL = "http://localhost:4173"
TIMEOUT = 30

def test_appointment_booking_success():
    appointment_date = (datetime.utcnow() + timedelta(days=1)).date().isoformat()
    appointment_time = "14:00"
    contact_info = {
        "name": "Test User",
        "email": f"testuser_{uuid.uuid4().hex[:8]}@example.com",
        "phone": "+1234567890"
    }

    # Construct payload for appointment insertion
    payload = [{
        "date": appointment_date,
        "time": appointment_time,
        "name": contact_info["name"],
        "email": contact_info["email"],
        "phone": contact_info["phone"]
    }]

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    appointment_id = None
    try:
        # Insert new appointment
        response = requests.post(
            f"{BASE_URL}/rest/v1/appointments",
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )

        # Check HTTP level success
        assert response.status_code == 201 or response.status_code == 200, f"Unexpected status code: {response.status_code}"

        response_data = response.json()
        # Supabase returns array of inserted rows
        assert isinstance(response_data, list), f"Unexpected response format: {response_data}"
        assert len(response_data) == 1, "No appointment record inserted"
        appointment = response_data[0]

        # Validate data integrity
        assert appointment["date"] == appointment_date, "Date mismatch in inserted record"
        assert appointment["time"] == appointment_time, "Time mismatch in inserted record"
        assert appointment["name"] == contact_info["name"], "Name mismatch in inserted record"
        assert appointment["email"] == contact_info["email"], "Email mismatch in inserted record"
        assert appointment["phone"] == contact_info["phone"], "Phone mismatch in inserted record"

        appointment_id = appointment.get("id")
        assert appointment_id is not None, "Inserted record missing ID"

    finally:
        # Cleanup - delete the appointment record if created
        if appointment_id:
            delete_response = requests.delete(
                f"{BASE_URL}/rest/v1/appointments?id=eq.{appointment_id}",
                headers=headers,
                timeout=TIMEOUT
            )
            # Accept 204 No Content or 200 OK on delete
            assert delete_response.status_code in (200, 204), f"Failed to delete test appointment, status code: {delete_response.status_code}"

test_appointment_booking_success()