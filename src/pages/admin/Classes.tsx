import { Plus, Users } from 'lucide-react';

export default function AdminClasses() {
  const classes = [
    { id: 1, name: "Breathwork Immersion", date: "Oct 24, 6:00 PM", booked: 6, capacity: 6, status: "Full" },
    { id: 2, name: "Somatic Healing", date: "Oct 25, 10:00 AM", booked: 2, capacity: 6, status: "Open" },
    { id: 3, name: "Sacred Body Flow", date: "Oct 26, 7:00 PM", booked: 4, capacity: 6, status: "Filling" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-text-dark">Manage Classes</h2>
          <p className="text-sm text-text-dark/60">Schedule and monitor class capacities.</p>
        </div>
        <button className="bg-text-dark text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-gold transition-colors shadow-md flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Class
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-cream shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/50 text-xs uppercase tracking-wider text-text-dark/50 border-b border-cream">
              <th className="p-4 font-semibold">Class Name</th>
              <th className="p-4 font-semibold">Date & Time</th>
              <th className="p-4 font-semibold">Capacity</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {classes.map((cls) => (
              <tr key={cls.id} className="border-b border-cream hover:bg-cream/30 transition-colors">
                <td className="p-4 font-medium text-text-dark">{cls.name}</td>
                <td className="p-4 text-text-dark/70">{cls.date}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold" />
                    <span>{cls.booked} / {cls.capacity}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    cls.status === 'Full' ? 'bg-red-100 text-red-700' : 
                    cls.status === 'Open' ? 'bg-green-100 text-green-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {cls.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-gold hover:text-text-dark text-xs font-semibold uppercase tracking-wider transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
