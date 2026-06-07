import { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Plus, Save, Trash2, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function JobAssignmentManager() {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: '',
    job_date: '',
    job_type: '',
    customer_name: '',
    pickup_address: '',
    pickup_postcode: '',
    delivery_address: '',
    delivery_postcode: '',
    start_time: '09:00',
    estimated_duration_hours: '8',
    special_instructions: '',
    team_members: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffData, assignmentsData] = await Promise.all([
        supabase
          .from('staff_profiles')
          .select('id, user_id, full_name, job_role, email')
          .eq('is_active', true)
          .order('full_name'),
        supabase
          .from('staff_job_assignments')
          .select(`
            id,
            staff_id,
            job_date,
            job_type,
            customer_name,
            pickup_postcode,
            delivery_postcode,
            start_time,
            status
          `)
          .gte('job_date', new Date().toISOString().split('T')[0])
          .order('job_date', { ascending: true })
          .order('start_time', { ascending: true })
      ]);

      setStaffList(staffData.data || []);
      setAssignments(assignmentsData.data || []);
    } catch (error) {
      console.error('[JobAssignmentManager] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staff_id) {
      alert('Please select a staff member');
      return;
    }

    setLoading(true);
    try {
      const teamMembersArray = formData.team_members
        .split(',')
        .map(m => m.trim())
        .filter(m => m.length > 0);

      const { error } = await supabase
        .from('staff_job_assignments')
        .insert({
          staff_id: formData.staff_id,
          job_date: formData.job_date,
          job_type: formData.job_type,
          customer_name: formData.customer_name,
          pickup_address: formData.pickup_address,
          pickup_postcode: formData.pickup_postcode,
          delivery_address: formData.delivery_address || null,
          delivery_postcode: formData.delivery_postcode || null,
          start_time: formData.start_time,
          estimated_duration_hours: parseInt(formData.estimated_duration_hours),
          special_instructions: formData.special_instructions || null,
          team_members: teamMembersArray.length > 0 ? teamMembersArray : null,
          status: 'scheduled'
        });

      if (error) throw error;

      alert('Job assigned successfully!');
      setShowCreateForm(false);
      setFormData({
        staff_id: '',
        job_date: '',
        job_type: '',
        customer_name: '',
        pickup_address: '',
        pickup_postcode: '',
        delivery_address: '',
        delivery_postcode: '',
        start_time: '09:00',
        estimated_duration_hours: '8',
        special_instructions: '',
        team_members: ''
      });
      loadData();
    } catch (error: any) {
      console.error('[JobAssignmentManager] Error creating assignment:', error);
      alert('Failed to assign job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this job assignment?')) return;

    try {
      const { error } = await supabase
        .from('staff_job_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      alert('Job assignment deleted');
      loadData();
    } catch (error: any) {
      console.error('[JobAssignmentManager] Error deleting:', error);
      alert('Failed to delete assignment');
    }
  };

  const jobTypes = [
    '1-Bed Flat Removal',
    '2-Bed House Removal',
    '3-Bed House Removal',
    '4-Bed House Removal',
    'Office Removal',
    'Single Item Delivery',
    'Furniture Delivery',
    'Storage Collection',
    'Storage Delivery',
    'Packing Service',
    'Clearance Service'
  ];

  const getStaffName = (staffId: string) => {
    const staff = staffList.find(s => s.user_id === staffId);
    return staff ? `${staff.full_name} (${staff.job_role})` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Assignment Manager</h2>
          <p className="text-gray-600 mt-1">Assign removal jobs to staff members</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-[#be0e0c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9f0b0a] transition-colors"
        >
          <Plus size={20} />
          {showCreateForm ? 'Cancel' : 'Assign New Job'}
        </button>
      </div>

      {/* Create Job Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Create Job Assignment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Staff Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Assign To Staff Member *
                </label>
                <select
                  required
                  value={formData.staff_id}
                  onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                >
                  <option value="">Select staff member...</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.user_id}>
                      {staff.full_name} - {staff.job_role} ({staff.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Job Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.job_date}
                  onChange={(e) => setFormData({ ...formData, job_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  required
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                >
                  <option value="">Select type...</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Duration (hours) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="24"
                  value={formData.estimated_duration_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_duration_hours: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                />
              </div>

              {/* Customer Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Mr. John Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                />
              </div>

              {/* Pickup Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1 text-green-600" />
                  Pickup Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pickup_address}
                  onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                  placeholder="123 High Street, Birmingham"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                />
              </div>

              {/* Pickup Postcode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pickup Postcode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pickup_postcode}
                  onChange={(e) => setFormData({ ...formData, pickup_postcode: e.target.value.toUpperCase() })}
                  placeholder="B1 1AA"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1 text-red-600" />
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder="456 Park Lane, London (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                />
              </div>

              {/* Delivery Postcode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Postcode
                </label>
                <input
                  type="text"
                  value={formData.delivery_postcode}
                  onChange={(e) => setFormData({ ...formData, delivery_postcode: e.target.value.toUpperCase() })}
                  placeholder="SW1A 1AA (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                />
              </div>

              {/* Team Members */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users size={16} className="inline mr-1" />
                  Team Members (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.team_members}
                  onChange={(e) => setFormData({ ...formData, team_members: e.target.value })}
                  placeholder="Mike Johnson (Porter), Sarah Williams (Porter)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Enter names of other team members who will work with this staff</p>
              </div>

              {/* Special Instructions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                  rows={3}
                  placeholder="Fragile items, stairs access, parking restrictions, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#be0e0c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9f0b0a] transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Assigning...' : 'Assign Job to Staff'}
            </button>
          </form>
        </div>
      )}

      {/* Assigned Jobs List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900">Assigned Jobs ({assignments.length})</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No job assignments yet</p>
            <p className="text-sm text-gray-500 mt-2">Click "Assign New Job" to create one</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                        {new Date(assignment.job_date).toLocaleDateString('en-GB')}
                      </span>
                      <span className={`px-3 py-1 text-xs font-bold rounded ${
                        assignment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        assignment.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {assignment.status.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">{assignment.job_type}</h4>
                    <p className="text-gray-600 mt-1">
                      <strong>Staff:</strong> {getStaffName(assignment.staff_id)}
                    </p>
                    <p className="text-gray-600">
                      <strong>Customer:</strong> {assignment.customer_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {assignment.pickup_postcode} → {assignment.delivery_postcode || 'Storage'} • {assignment.start_time}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(assignment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
