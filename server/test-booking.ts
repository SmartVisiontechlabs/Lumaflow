
import fetch from 'node-fetch';

async function testBooking() {
  const response = await fetch('http://localhost:3001/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      emotion: 'stressed',
      selectedSession: 'The Nervous System Reset',
      sessionFormat: 'Virtual',
      duration: 60,
      selectedDate: '2026-05-20',
      selectedTime: '10:00',
      timezone: 'America/New_York',
      fullName: 'Test User',
      email: 'ghanshyamsahu@gmail.com',
      intentions: 'Testing email delivery'
    }),
  });

  const data = await response.json();
  console.log('Booking Result:', data);
}

testBooking();
