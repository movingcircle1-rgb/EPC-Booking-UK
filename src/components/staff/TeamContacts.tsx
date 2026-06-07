import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Star, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function TeamContacts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [manager, setManager] = useState<any>(null);
  const [colleagues, setColleagues] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);

  useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setMyProfile(profile);

      if (profile?.manager_id) {
        const { data: managerData } = await supabase
          .from('staff_profiles')
          .select('*')
          .eq('user_id', profile.manager_id)
          .maybeSingle();

        setManager(managerData);
      }

      const { data: colleaguesData } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('department', profile?.department)
        .eq('is_active', true)
        .neq('user_id', user.id)
        .order('full_name');

      setColleagues(colleaguesData || []);
    } catch (error) {
      console.error('[TeamContacts] Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const ContactCard = ({ person, isManager = false }: { person: any; isManager?: boolean }) => (
    <div className={`border-2 rounded-lg p-4 ${
      isManager ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#C73532] to-[#A92C2A] rounded-full flex items-center justify-center text-white text-xl font-bold">
          {person.full_name?.charAt(0) || <User size={24} />}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900">{person.full_name || 'Staff Member'}</h3>
            {isManager && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                <Star size={12} />
                Manager
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{person.job_role}</p>

          <div className="space-y-1">
            {person.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail size={14} className="text-gray-400" />
                <a href={`mailto:${person.email}`} className="hover:text-[#C73532] transition-colors">
                  {person.email}
                </a>
              </div>
            )}
            {person.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone size={14} className="text-gray-400" />
                <a href={`tel:${person.phone}`} className="hover:text-[#C73532] transition-colors">
                  {person.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={24} className="text-[#C73532]" />
          Team Contacts
        </h2>
        <p className="text-sm text-gray-600 mt-1">Contact your manager and colleagues</p>
      </div>

      <div className="p-6 space-y-6">
        {manager && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Your Manager</h3>
            <ContactCard person={manager} isManager={true} />
          </div>
        )}

        {colleagues.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              {myProfile?.department || 'Department'} Team ({colleagues.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {colleagues.map((colleague) => (
                <ContactCard key={colleague.id} person={colleague} />
              ))}
            </div>
          </div>
        )}

        {!manager && colleagues.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No team contacts available yet.</p>
            <p className="text-sm text-gray-400 mt-2">Contact HR to be assigned to a team.</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
            <p className="text-sm text-blue-800 mb-3">
              For general inquiries or urgent matters, contact:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-blue-800">
                <Mail size={14} />
                <a href="mailto:hr@nationalremovalsandstorage.co.uk" className="hover:underline">
                  hr@nationalremovalsandstorage.co.uk
                </a>
              </div>
              <div className="flex items-center gap-2 text-blue-800">
                <Phone size={14} />
                <a href="tel:08000472607" className="hover:underline">
                  0800 0472607
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
