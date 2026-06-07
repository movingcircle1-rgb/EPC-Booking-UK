import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function JobAssignments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    loadAssignments();
  }, [user]);

  const loadAssignments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_job_assignments')
        .select('*')
        .eq('staff_id', user.id)
        .gte('job_date', new Date().toISOString().split('T')[0])
        .order('job_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('[JobAssignments] Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async (assignmentId: string) => {
    try {
      // Update job status
      const { error: updateError } = await supabase
        .from('staff_job_assignments')
        .update({ status: 'in_progress' })
        .eq('id', assignmentId);

      if (updateError) throw updateError;

      // Create timesheet entry (clock in)
      const { error: timesheetError } = await supabase
        .from('staff_timesheets')
        .insert({
          staff_id: user?.id,
          assignment_id: assignmentId,
          clock_in_time: new Date().toISOString()
        });

      if (timesheetError) throw timesheetError;

      alert('Job started! Clock in recorded.');
      loadAssignments();
    } catch (error: any) {
      console.error('[JobAssignments] Error starting job:', error);
      alert('Failed to start job. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock size={16} />;
      case 'in_progress': return <Play size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Loading your job assignments...</p>
      </div>
    );
  }

  const todayJobs = assignments.filter(a => a.job_date === new Date().toISOString().split('T')[0]);
  const upcomingJobs = assignments.filter(a => a.job_date > new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      {/* Today's Jobs */}
      {todayJobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={24} className="text-[#e71c5e]" />
              Today's Jobs
            </h2>
            <p className="text-sm text-gray-600 mt-1">You have {todayJobs.length} job{todayJobs.length !== 1 ? 's' : ''} scheduled today</p>
          </div>

          <div className="p-6 space-y-4">
            {todayJobs.map((job) => (
              <div
                key={job.id}
                className="border-2 border-[#e71c5e] bg-pink-50 rounded-lg p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{job.job_type}</h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        {job.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mb-3">Customer: {job.customer_name}</p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-600">PICKUP</p>
                            <p className="text-sm text-gray-900">{job.pickup_address}</p>
                            <p className="text-sm font-bold text-green-600">{job.pickup_postcode}</p>
                          </div>
                        </div>
                      </div>

                      {job.delivery_address && (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin size={16} className="text-red-600 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-gray-600">DELIVERY</p>
                              <p className="text-sm text-gray-900">{job.delivery_address}</p>
                              <p className="text-sm font-bold text-red-600">{job.delivery_postcode}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Start: {job.start_time}
                      </span>
                      <span>•</span>
                      <span>Duration: ~{job.estimated_duration_hours}h</span>
                    </div>

                    {job.team_members && job.team_members.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                          <Users size={14} />
                          YOUR TEAM
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {job.team_members.map((member: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {job.special_instructions && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs font-semibold text-yellow-900 mb-1">⚠️ SPECIAL INSTRUCTIONS</p>
                        <p className="text-sm text-yellow-800">{job.special_instructions}</p>
                      </div>
                    )}
                  </div>
                </div>

                {job.status === 'scheduled' && (
                  <button
                    onClick={() => handleStartJob(job.id)}
                    className="w-full flex items-center justify-center gap-2 bg-[#e71c5e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c91852] transition-colors"
                  >
                    <Play size={20} />
                    Start Job & Clock In
                  </button>
                )}

                {job.status === 'in_progress' && (
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      <CheckCircle size={20} />
                      Complete Job & Clock Out
                    </button>
                    <button className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                      Report Issue
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Jobs */}
      {upcomingJobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Jobs</h2>
            <p className="text-sm text-gray-600 mt-1">{upcomingJobs.length} job{upcomingJobs.length !== 1 ? 's' : ''} scheduled</p>
          </div>

          <div className="p-6 space-y-3">
            {upcomingJobs.map((job) => (
              <div
                key={job.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                        {new Date(job.job_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <h3 className="font-bold text-gray-900">{job.job_type}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{job.customer_name} • {job.pickup_postcode} → {job.delivery_postcode}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-500">{job.start_time}</span>
                </div>

                {selectedJob?.id === job.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
                    <p><strong>Pickup:</strong> {job.pickup_address}, {job.pickup_postcode}</p>
                    {job.delivery_address && <p><strong>Delivery:</strong> {job.delivery_address}, {job.delivery_postcode}</p>}
                    <p><strong>Duration:</strong> ~{job.estimated_duration_hours} hours</p>
                    {job.team_members && <p><strong>Team:</strong> {job.team_members.join(', ')}</p>}
                    {job.special_instructions && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs font-semibold text-yellow-900">Special Instructions:</p>
                        <p className="text-yellow-800">{job.special_instructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs Assigned</h3>
          <p className="text-gray-600">You don't have any job assignments at the moment.</p>
          <p className="text-sm text-gray-500 mt-2">Check back later or contact your manager.</p>
        </div>
      )}
    </div>
  );
}
