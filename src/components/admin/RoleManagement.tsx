import { useState, useEffect } from 'react';
import { Users, Briefcase, Package, UserCog, Eye, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type RoleFilter = 'all' | 'client' | 'partner' | 'trade' | 'staff';

export default function RoleManagement() {
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleData, setRoleData] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    loadRoleData();
  }, [roleFilter]);

  const loadRoleData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRoleData(data || []);
    } catch (error) {
      console.error('Error loading role data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client': return <Users size={20} className="text-blue-600" />;
      case 'partner': return <Briefcase size={20} className="text-purple-600" />;
      case 'trade': return <Package size={20} className="text-green-600" />;
      case 'staff': return <UserCog size={20} className="text-orange-600" />;
      default: return <Users size={20} className="text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'trade': return 'bg-green-100 text-green-800 border-green-200';
      case 'staff': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredData = roleData.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleCounts = {
    all: roleData.length,
    client: roleData.filter(u => u.role === 'client').length,
    partner: roleData.filter(u => u.role === 'partner').length,
    trade: roleData.filter(u => u.role === 'trade').length,
    staff: roleData.filter(u => u.role === 'staff').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e71c5e]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Role Management</h2>

        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setRoleFilter('all')}
            className={`p-4 rounded-lg border-2 transition-all ${
              roleFilter === 'all'
                ? 'border-[#e71c5e] bg-[#e71c5e] bg-opacity-10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600">All Users</p>
            <p className="text-2xl font-bold text-gray-900">{roleCounts.all}</p>
          </button>

          <button
            onClick={() => setRoleFilter('client')}
            className={`p-4 rounded-lg border-2 transition-all ${
              roleFilter === 'client'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-blue-600" />
              <p className="text-sm text-gray-600">Clients</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{roleCounts.client}</p>
          </button>

          <button
            onClick={() => setRoleFilter('partner')}
            className={`p-4 rounded-lg border-2 transition-all ${
              roleFilter === 'partner'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={16} className="text-purple-600" />
              <p className="text-sm text-gray-600">Partners</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{roleCounts.partner}</p>
          </button>

          <button
            onClick={() => setRoleFilter('trade')}
            className={`p-4 rounded-lg border-2 transition-all ${
              roleFilter === 'trade'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-green-600" />
              <p className="text-sm text-gray-600">Trade</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{roleCounts.trade}</p>
          </button>

          <button
            onClick={() => setRoleFilter('staff')}
            className={`p-4 rounded-lg border-2 transition-all ${
              roleFilter === 'staff'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <UserCog size={16} className="text-orange-600" />
              <p className="text-sm text-gray-600">Staff</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{roleCounts.staff}</p>
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e71c5e] to-[#c91852] flex items-center justify-center text-white font-bold">
                        {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.full_name || 'No Name'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{user.email}</td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">User Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">{selectedUser.full_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getRoleBadgeColor(selectedUser.role)}`}>
                  {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-semibold text-gray-900">{new Date(selectedUser.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
