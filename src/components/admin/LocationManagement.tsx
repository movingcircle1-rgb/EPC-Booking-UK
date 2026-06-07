import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Save, X, Upload, MapPin, ExternalLink, Zap, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import QuickAddLocation from './QuickAddLocation';
import BulkLocationImport from './BulkLocationImport';
import CityContentEditor from './CityContentEditor';

interface City {
  id: string;
  name: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_description: string;
  region?: string;
  county?: string;
  areas_covered?: string[];
  is_featured: boolean;
  page_views: number;
  content_blocks_count?: number;
  map_embed_url?: string;
}

export default function LocationManagement() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [editingContentCity, setEditingContentCity] = useState<{ id: string; name: string } | null>(null);

  const emptyCity: Omit<City, 'id' | 'page_views'> = {
    name: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    region: '',
    county: '',
    areas_covered: [],
    is_featured: false,
    map_embed_url: '',
  };

  const [formData, setFormData] = useState<Omit<City, 'id' | 'page_views'>>(emptyCity);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');

    if (!error && data) {
      const cityIds = data.map(city => city.id);

      const { data: blocksData } = await supabase
        .from('city_content_blocks')
        .select('city_id')
        .in('city_id', cityIds);

      const blocksCounts = blocksData?.reduce((acc, block) => {
        acc[block.city_id] = (acc[block.city_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const citiesWithCount = data.map(city => ({
        ...city,
        content_blocks_count: blocksCounts[city.id] || 0
      }));

      setCities(citiesWithCount);
    } else if (error) {
      console.error('Error loading cities:', error);
    }

    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.name.trim()) {
      alert('City name is required');
      return;
    }

    if (!formData.description || !formData.description.trim()) {
      alert('Description is required');
      return;
    }

    const slug = formData.slug || generateSlug(formData.name);

    // Check for duplicate slug (only when creating new or changing slug)
    if (!editingCity || slug !== editingCity.slug) {
      const { data: existing } = await supabase
        .from('cities')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        alert(`A location with slug "${slug}" already exists. Please use a different name.`);
        return;
      }
    }

    // Prepare data with proper types
    const dataToSave = {
      name: formData.name.trim(),
      slug: slug,
      description: formData.description.trim(),
      region: formData.region?.trim() || '',
      county: formData.county?.trim() || '',
      areas_covered: Array.isArray(formData.areas_covered) ? formData.areas_covered : [],
      is_featured: formData.is_featured || false,
      map_embed_url: formData.map_embed_url?.trim() || null,
    };

    try {
      if (editingCity) {
        const { error } = await supabase
          .from('cities')
          .update(dataToSave)
          .eq('id', editingCity.id);

        if (error) {
          console.error('Error updating location:', error);
          alert(`Failed to update location: ${error.message}`);
          return;
        }

        alert('Location updated successfully!');
      } else {
        const { error } = await supabase
          .from('cities')
          .insert([dataToSave]);

        if (error) {
          console.error('Error creating location:', error);
          alert(`Failed to create location: ${error.message}`);
          return;
        }

        alert('Location created successfully! The page will be available at /removals-' + slug);
      }

      await loadCities();
      resetForm();
    } catch (err) {
      console.error('Unexpected error saving location:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location? This will also delete all associated location services.')) return;

    try {
      // Get the city details first to find matching entry in locations table
      const { data: city } = await supabase
        .from('cities')
        .select('slug, name')
        .eq('id', id)
        .maybeSingle();

      // Delete from cities table
      const { error: citiesError } = await supabase
        .from('cities')
        .delete()
        .eq('id', id);

      if (citiesError) {
        console.error('Error deleting from cities:', citiesError);
        alert(`Failed to delete: ${citiesError.message}`);
        return;
      }

      // Also delete from locations table if matching entry exists
      if (city) {
        await supabase
          .from('locations')
          .delete()
          .or(`city_slug.ilike.${city.slug},city.ilike.${city.name}`);
      }

      alert('Location deleted successfully from all tables!');
      await loadCities();
    } catch (err) {
      console.error('Error during deletion:', err);
      alert('Failed to delete location. Please try again.');
    }
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      slug: city.slug,
      description: city.description,
      meta_title: city.meta_title,
      meta_description: city.meta_description,
      region: city.region || '',
      county: city.county || '',
      areas_covered: city.areas_covered || [],
      is_featured: city.is_featured,
      map_embed_url: city.map_embed_url || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(emptyCity);
    setEditingCity(null);
    setShowForm(false);
  };

  const handleBulkImport = async () => {
    const lines = bulkData.trim().split('\n');
    const citiesToImport = lines.map(line => {
      const [name, region, county, ...areas] = line.split(',').map(s => s.trim());
      const slug = generateSlug(name);
      return {
        name,
        slug,
        description: `Professional removal and storage services in ${name}`,
        meta_title: `Removals ${name} | National Removals and Storage`,
        meta_description: `Expert house and office removals in ${name}. Professional moving services with secure storage solutions.`,
        region: region || '',
        county: county || '',
        areas_covered: areas.length > 0 ? areas : [`${name} City Centre`, `${name} North`, `${name} South`, `${name} East`, `${name} West`],
        is_featured: false,
      };
    });

    for (const city of citiesToImport) {
      await supabase.from('cities').insert([city]);
    }

    await loadCities();
    setShowBulkImport(false);
    setBulkData('');
  };

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e71c5e]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Location Management</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
          >
            <Zap size={20} />
            Quick Add
          </button>
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Upload size={20} />
            Bulk Import
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#e71c5e] text-white px-4 py-2 rounded-lg hover:bg-[#c91852] transition-colors"
          >
            <Plus size={20} />
            Manual Add
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Total Locations:</strong> {cities.length} •
          <strong className="ml-3">Featured:</strong> {cities.filter(c => c.is_featured).length} •
          <strong className="ml-3">Generated Pages:</strong> {cities.length * 4} (each location has 4 service pages)
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
        />
      </div>

      {showBulkImport && (
        <BulkLocationImport
          onClose={() => setShowBulkImport(false)}
          onSuccess={() => {
            loadCities();
            setShowBulkImport(false);
          }}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCity ? 'Edit Location' : 'Add New Location'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: generateSlug(name),
                      meta_title: `Removals ${name} | National Removals and Storage`,
                      description: `Professional removal and storage services in ${name}`
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                  placeholder="e.g., Bristol"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                  placeholder="Auto-generated from name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                    placeholder="e.g., South West"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County
                  </label>
                  <input
                    type="text"
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                    placeholder="e.g., Bristol"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                  placeholder="Brief description of services in this location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas Covered (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.areas_covered?.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    areas_covered: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                  placeholder="City Centre, North Area, South Area"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Maps Embed URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.map_embed_url}
                  onChange={(e) => setFormData({ ...formData, map_embed_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get embed URL from Google Maps: Share → Embed a map → Copy the src URL from the iframe code
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>SEO Management:</strong> To edit meta titles and descriptions for locations, go to <span className="font-semibold">SEO Management</span> tab → <span className="font-semibold">Location Pages</span> section.
                </p>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-[#e71c5e] rounded focus:ring-[#e71c5e]"
                />
                <span className="text-sm text-gray-700">Feature this location on homepage</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#e71c5e] text-white px-4 py-2 rounded-lg hover:bg-[#c91852] transition-colors"
                >
                  <Save size={20} />
                  Save Location
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCities.map((city) => (
          <div key={city.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-[#e71c5e]" />
                <h3 className="text-lg font-bold text-gray-900">{city.name}</h3>
              </div>
              {city.is_featured && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {city.region && (
                <p className="text-sm text-gray-600">
                  <strong>Region:</strong> {city.region}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <strong>URL:</strong> /locations/{city.slug}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Areas:</strong> {city.areas_covered?.length || 0} covered
              </p>
              <div className="flex items-center gap-2 mt-3">
                {city.content_blocks_count && city.content_blocks_count > 0 ? (
                  <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle2 size={14} />
                    <span>SEO Content: {city.content_blocks_count}/3</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                    <AlertCircle size={14} />
                    <span>No SEO Content</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <a href={`/locations/${city.slug}`}
                className="flex-1 flex items-center justify-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
              >
                <ExternalLink size={16} />
                View Page
              </a>
              <button
                onClick={() => setEditingContentCity({ id: city.id, name: city.name })}
                className="flex-1 flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                title="Edit SEO Content"
              >
                <FileText size={16} />
                SEO Content
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(city)}
                className="flex-1 flex items-center justify-center gap-2 text-sm bg-[#e71c5e] hover:bg-[#c91852] text-white px-3 py-2 rounded-lg transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(city.id)}
                className="flex items-center justify-center text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No locations found. Add your first location to start generating pages.
        </div>
      )}

      {showQuickAdd && (
        <QuickAddLocation
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => {
            loadCities();
            setShowQuickAdd(false);
          }}
        />
      )}

      {editingContentCity && (
        <CityContentEditor
          cityId={editingContentCity.id}
          cityName={editingContentCity.name}
          onClose={() => setEditingContentCity(null)}
          onSuccess={() => {
            loadCities();
            setEditingContentCity(null);
          }}
        />
      )}
    </div>
  );
}
