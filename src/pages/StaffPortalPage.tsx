import { useEffect, useState } from 'react';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { hardNavigate } from '../lib/nav'
import {
  LayoutDashboard, Calendar, FileText, Users, Bell, User, ClipboardCheck, Clock, Briefcase, AlertCircle, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEnsurePortalRecord } from '../hooks/useEnsurePortalRecord';
import SEO from '../components/SEO';
import PortalHeader from '../components/PortalHeader';
import LoadingSpinner from '../components/portal/LoadingSpinner';
import ProfileManagement from '../components/staff/ProfileManagement';
import AvailabilityManagement from '../components/staff/AvailabilityManagement';
import CompanyPolicies from '../components/staff/CompanyPolicies';
import TeamContacts from '../components/staff/TeamContacts';
import JobAssignments from '../components/staff/JobAssignments';

type TabType = 'jobs' | 'profile' | 'availability' | 'policies' | 'contacts';

export default function StaffPortalPage() {
  useRequireAuth();
  const { user, userRole, loading: authLoading } = useAuth();
  const { isVerifying, hasRecord, error: portalError } = useEnsurePortalRecord();
  const [activeTab, setActiveTab] = useState<TabType>('jobs');

  useEffect(() => {
    if (!authLoading && !user) {
      hardNavigate('/portal/login');
      return;
    }

    if (!authLoading && user && userRole) {
      if (userRole.role !== 'staff' && userRole.role !== 'admin' && userRole.role !== 'admin-2') {
        const correctPath = userRole.role === 'client' ? '/client-portal' :
                          userRole.role === 'partner' ? '/partner-portal' :
                          userRole.role === 'trade' ? '/trade-portal' : '/';
        hardNavigate(correctPath, { replace: true });
      }
    }
  }, [user, userRole, authLoading]);

  if (authLoading || !user || isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (portalError || !hasRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <AlertCircle size={32} className="text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setting Up Your Portal</h2>
          <p className="text-gray-600 mb-6">
            {portalError || 'Your staff profile is being configured. Please refresh the page in a moment.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#be0e0c] hover:bg-[#9f0b0a] text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'jobs', label: 'My Jobs', icon: Briefcase },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'policies', label: 'Policies', icon: FileText },
    { id: 'contacts', label: 'Team Contacts', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader title="Staff Portal" />
      <SEO
        title="Staff Portal - My Dashboard"
        description="Access your schedule, tasks, and staff resources"
        canonicalUrl="https://nationalremovalsandstorage.co.uk/staff-portal"
        noindex={true}
      />

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {userRole?.full_name || 'Team Member'}</h1>
              <p className="text-gray-100">Manage your work schedule and access company resources</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all">
                <Bell size={24} />
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
              >
                <Settings size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                  activeTab === id
                    ? 'text-[#be0e0c] border-[#be0e0c] bg-pink-50'
                    : 'text-gray-600 border-transparent hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'jobs' && <JobAssignments />}
        {activeTab === 'profile' && <ProfileManagement />}
        {activeTab === 'availability' && <AvailabilityManagement />}
        {activeTab === 'policies' && <CompanyPolicies />}
        {activeTab === 'contacts' && <TeamContacts />}
      </div>
    </div>
  );
}
