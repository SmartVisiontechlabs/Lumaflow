export default function AdminBookings() {
  const bookings = [
    { id: "B-1029", user: "Sarah Jenkins", class: "Breathwork Immersion", amount: "$45.00", status: "Paid" },
    { id: "B-1030", user: "Michael Chen", class: "Somatic Healing", amount: "$30.00", status: "Paid" },
    { id: "B-1031", user: "Emma Watson", class: "10-Class Package", amount: "$350.00", status: "Paid" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-text-dark">Recent Bookings</h2>
        <p className="text-sm text-text-dark/60">View latest payments and class registrations.</p>
      </div>

      <div className="bg-white rounded-2xl border border-cream shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/50 text-xs uppercase tracking-wider text-text-dark/50 border-b border-cream">
              <th className="p-4 font-semibold">Booking ID</th>
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Item</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Payment Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-cream hover:bg-cream/30 transition-colors">
                <td className="p-4 font-mono text-xs text-text-dark/60">{booking.id}</td>
                <td className="p-4 font-medium text-text-dark">{booking.user}</td>
                <td className="p-4 text-text-dark/70">{booking.class}</td>
                <td className="p-4 font-medium">{booking.amount}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700">
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
