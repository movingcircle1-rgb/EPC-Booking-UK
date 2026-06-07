import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Save,
  X,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Download,
  Zap
} from 'lucide-react';
import QuickAddLocation from './QuickAddLocation';
import BulkLocationImport from './BulkLocationImport';

interface Location {
  id: string;
  domain: string;
  city: string;
  city_slug: string;
  nearest_1: string | null;
  nearest_2: string | null;
  nearest_3: string | null;
  nearest_areas: string | null;
  county: string | null;
  postcode: string | null;
  phone: string;
  email: string;
  address1: string | null;
  address2: string | null;
  reviews_platform: string;
  reviews_score: string | null;
  accredited: string;
  nearby_areas: string | null;
  area_links: string | null;
  hero_image: string | null;
  map_embed: string | null;
  map_link: string | null;
  opening_hours: string;
  created_at: string;
  updated_at: string;
}

const emptyLocation: Partial<Location> = {
  domain: 'https://nationalremovalsandstorage.co.uk/',
  city: '',
  city_slug: '',
  phone: '(0800) 0472607',
  email: 'sales@nationalremovalsandstorage.co.uk',
  reviews_platform: 'Google',
  accredited: 'Yes',
  opening_hours: 'Mon–Sat 08:00–18:00; Sun Closed'
};

export default function DynamicLocationManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLocation, setEditingLocation] = useState<Partial<Location> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(loc =>
        loc.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.city_slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loc.county && loc.county.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredLocations(filtered);
    }
  }, [searchTerm, locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('city', { ascending: true });

      if (error) throw error;
      setLocations(data || []);
      setFilteredLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      showMessage('error', 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLocation(emptyLocation);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, cityName: string) => {
    if (!confirm(`Are you sure you want to delete the location for ${cityName}? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showMessage('success', `Location ${cityName} deleted successfully`);
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      showMessage('error', 'Failed to delete location');
    }
  };

  const handleSave = async () => {
    if (!editingLocation) return;

    if (!editingLocation.city || !editingLocation.city_slug) {
      showMessage('error', 'City and City Slug are required');
      return;
    }

    try {
      if (editingLocation.id) {
        const { error } = await supabase
          .from('locations')
          .update(editingLocation)
          .eq('id', editingLocation.id);

        if (error) throw error;
        showMessage('success', 'Location updated successfully');
      } else {
        const { error } = await supabase
          .from('locations')
          .insert([editingLocation]);

        if (error) throw error;
        showMessage('success', 'Location created successfully');
      }

      setIsModalOpen(false);
      setEditingLocation(null);
      fetchLocations();
    } catch (error: any) {
      console.error('Error saving location:', error);
      if (error.code === '23505') {
        showMessage('error', `A location with city slug "${editingLocation.city_slug}" already exists in the Locations table. Use Cities Management instead to manage city SEO.`);
      } else {
        showMessage('error', `Failed to save location: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleInputChange = (field: keyof Location, value: string) => {
    setEditingLocation(prev => ({ ...prev, [field]: value }));

    if (field === 'city' && editingLocation && !editingLocation.id) {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setEditingLocation(prev => ({ ...prev, city_slug: slug }));
    }
  };

  const generateMapUrls = () => {
    if (!editingLocation?.city) return;

    const encodedCity = encodeURIComponent(editingLocation.city + ' United Kingdom');
    const mapEmbed = `https://www.google.com/maps?q=${encodedCity}&output=embed`;
    const mapLink = `https://www.google.com/maps?q=${encodedCity}`;

    setEditingLocation(prev => ({ ...prev, map_embed: mapEmbed, map_link: mapLink }));
    showMessage('success', 'Map URLs generated');
  };

  const exportToCSV = () => {
    const headers = [
      'DOMAIN', 'CITY', 'Nearest_1', 'Nearest_2', 'Nearest_3', 'Nearest_Areas',
      'CITY_SLUG', 'COUNTY', 'POSTCODE', 'PHONE', 'EMAIL', 'ADDRESS1', 'ADDRESS2',
      'REVIEWS_PLATFORM', 'REVIEWS_SCORE', 'ACCREDITED', 'NEARBY_AREAS', 'AREA_LINKS',
      'HERO_IMAGE', 'MAP_EMBED', 'MAP_LINK', 'OPENING_HOURS'
    ];

    const rows = locations.map(loc => [
      loc.domain,
      loc.city,
      loc.nearest_1 || '',
      loc.nearest_2 || '',
      loc.nearest_3 || '',
      loc.nearest_areas || '',
      loc.city_slug,
      loc.county || '',
      loc.postcode || '',
      loc.phone,
      loc.email,
      loc.address1 || '',
      loc.address2 || '',
      loc.reviews_platform,
      loc.reviews_score || '',
      loc.accredited,
      loc.nearby_areas || '',
      loc.area_links || '',
      loc.hero_image || '',
      loc.map_embed || '',
      loc.map_link || '',
      loc.opening_hours
    ]);

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `locations-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showMessage('success', `Exported ${locations.length} locations to CSV`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading locations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search locations by city, slug, or county..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <Zap className="w-5 h-5" />
            Quick Add
          </button>
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            <Download className="w-5 h-5" />
            Bulk Import
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Manual Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  County
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nearby Areas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No locations found matching your search' : 'No locations yet'}
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-900 font-medium">{location.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600 font-mono text-sm">{location.city_slug}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600">{location.county || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">
                        {location.nearby_areas ?
                          location.nearby_areas.split(',').slice(0, 2).join(', ') +
                          (location.nearby_areas.split(',').length > 2 ? '...' : '')
                          : '-'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/removals-${location.city_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(location)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit location"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(location.id, location.city)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Delete location"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredLocations.length} of {locations.length} locations
      </div>

      {isModalOpen && editingLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-4xl my-8 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingLocation.id ? 'Edit Location' : 'Add New Location'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingLocation(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingLocation.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="Birmingham"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingLocation.city_slug || ''}
                    onChange={(e) => handleInputChange('city_slug', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="birmingham"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used in URL: /removals-{editingLocation.city_slug || 'slug'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                  <input
                    type="text"
                    value={editingLocation.county || ''}
                    onChange={(e) => handleInputChange('county', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="West Midlands"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                  <input
                    type="text"
                    value={editingLocation.postcode || ''}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="B1 1AA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    value={editingLocation.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="(0800) 0472607"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingLocation.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="sales@nationalremovalsandstorage.co.uk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                  <input
                    type="text"
                    value={editingLocation.address1 || ''}
                    onChange={(e) => handleInputChange('address1', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="Unit 4, Birmingham Business Centre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={editingLocation.address2 || ''}
                    onChange={(e) => handleInputChange('address2', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="City Centre"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nearest 1</label>
                  <input
                    type="text"
                    value={editingLocation.nearest_1 || ''}
                    onChange={(e) => handleInputChange('nearest_1', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="Smethwick"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nearest 2</label>
                  <input
                    type="text"
                    value={editingLocation.nearest_2 || ''}
                    onChange={(e) => handleInputChange('nearest_2', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="West Bromwich"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nearest 3</label>
                  <input
                    type="text"
                    value={editingLocation.nearest_3 || ''}
                    onChange={(e) => handleInputChange('nearest_3', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="Sutton Coldfield"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nearby Areas (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingLocation.nearby_areas || ''}
                  onChange={(e) => handleInputChange('nearby_areas', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                  placeholder="Walsall, Wolverhampton, Redditch"
                />
                <p className="text-xs text-gray-500 mt-1">Displayed in "Areas We Cover" section</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area Links (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingLocation.area_links || ''}
                  onChange={(e) => handleInputChange('area_links', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                  placeholder="/removals-walsall, /removals-wolverhampton, /removals-redditch"
                />
                <p className="text-xs text-gray-500 mt-1">Used for footer contextual links</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Google Maps URLs</label>
                  <button
                    onClick={generateMapUrls}
                    className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition"
                  >
                    Auto-Generate
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Map Embed URL</label>
                    <input
                      type="text"
                      value={editingLocation.map_embed || ''}
                      onChange={(e) => handleInputChange('map_embed', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="https://www.google.com/maps?q=Birmingham+United+Kingdom&output=embed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Map Link URL</label>
                    <input
                      type="text"
                      value={editingLocation.map_link || ''}
                      onChange={(e) => handleInputChange('map_link', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="https://www.google.com/maps?q=Birmingham+United+Kingdom"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reviews Platform</label>
                  <input
                    type="text"
                    value={editingLocation.reviews_platform || ''}
                    onChange={(e) => handleInputChange('reviews_platform', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="Google"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reviews Score</label>
                  <input
                    type="text"
                    value={editingLocation.reviews_score || ''}
                    onChange={(e) => handleInputChange('reviews_score', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="5.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accredited</label>
                  <select
                    value={editingLocation.accredited || 'Yes'}
                    onChange={(e) => handleInputChange('accredited', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours</label>
                  <input
                    type="text"
                    value={editingLocation.opening_hours || ''}
                    onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                    placeholder="Mon–Sat 08:00–18:00; Sun Closed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image URL</label>
                <input
                  type="text"
                  value={editingLocation.hero_image || ''}
                  onChange={(e) => handleInputChange('hero_image', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
                  placeholder="https://nationalremovalsandstorage.co.uk/images/birmingham-hero.jpg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingLocation(null);
                }}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <Save className="w-4 h-4" />
                {editingLocation.id ? 'Update' : 'Create'} Location
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuickAdd && (
        <QuickAddLocation
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => {
            fetchLocations();
            setShowQuickAdd(false);
          }}
        />
      )}

      {showBulkImport && (
        <BulkLocationImport
          onClose={() => setShowBulkImport(false)}
          onSuccess={() => {
            fetchLocations();
            setShowBulkImport(false);
          }}
        />
      )}
    </div>
  );
}
