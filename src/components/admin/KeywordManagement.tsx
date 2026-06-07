import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Keyword {
  id: string;
  keyword_text: string;
  target_url: string;
  link_text?: string;
  priority: number;
  is_active: boolean;
  link_frequency: 'first' | 'all' | 'limited';
  max_links_per_page: number;
  category: string;
  case_sensitive: boolean;
}

export default function KeywordManagement() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emptyKeyword: Omit<Keyword, 'id'> = {
    keyword_text: '',
    target_url: '',
    link_text: '',
    priority: 80,
    is_active: true,
    link_frequency: 'first',
    max_links_per_page: 1,
    category: 'services',
    case_sensitive: false,
  };

  const [formData, setFormData] = useState<Omit<Keyword, 'id'>>(emptyKeyword);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .order('priority', { ascending: false });

    if (!error && data) {
      setKeywords(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!formData.keyword_text.trim()) {
      setError('Keyword text is required');
      return;
    }

    if (!formData.target_url.trim()) {
      setError('Target URL is required');
      return;
    }

    setSaving(true);

    try {
      if (editingKeyword) {
        const { error: updateError } = await supabase
          .from('keywords')
          .update(formData)
          .eq('id', editingKeyword.id);

        if (updateError) throw updateError;
        setSuccess('Keyword updated successfully!');
      } else {
        const { error: insertError } = await supabase
          .from('keywords')
          .insert([formData]);

        if (insertError) throw insertError;
        setSuccess('Keyword added successfully!');
      }

      await loadKeywords();
      setTimeout(() => resetForm(), 1500);
    } catch (err) {
      console.error('Error saving keyword:', err);
      setError(err instanceof Error ? err.message : 'Failed to save keyword');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this keyword?')) return;

    const { error } = await supabase
      .from('keywords')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadKeywords();
    }
  };

  const handleEdit = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setFormData({
      keyword_text: keyword.keyword_text,
      target_url: keyword.target_url,
      link_text: keyword.link_text || '',
      priority: keyword.priority || 80,
      is_active: keyword.is_active,
      link_frequency: keyword.link_frequency || 'first',
      max_links_per_page: keyword.max_links_per_page || 1,
      category: keyword.category || 'services',
      case_sensitive: keyword.case_sensitive || false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(emptyKeyword);
    setEditingKeyword(null);
    setShowForm(false);
    setError(null);
    setSuccess(null);
    setSaving(false);
  };

  const filteredKeywords = keywords.filter(
    (kw) =>
      kw.keyword_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kw.target_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kw.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C73532]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Keyword Management</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#C73532] text-white px-4 py-2 rounded-lg hover:bg-[#A92C2A] transition-colors"
          >
            <Plus size={20} />
            Add Keyword
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Multi-Page Auto-Linking</h3>
              <p className="text-sm text-blue-800">
                Keywords automatically link across <strong>all pages</strong> where they appear.
                Frequency settings like "first" or "Max 1/page" apply <strong>per page</strong>, not globally.
                This means the same keyword can appear on every page of your site, creating strong internal linking for SEO.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingKeyword ? 'Edit Keyword' : 'Add New Keyword'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Success</p>
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Keyword Text *
                </label>
                <input
                  type="text"
                  value={formData.keyword_text}
                  onChange={(e) => setFormData({ ...formData, keyword_text: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent text-base"
                  placeholder="e.g., house removals"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">The word or phrase to automatically link on all pages where it appears</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Target URL *
                </label>
                <input
                  type="text"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent text-base"
                  placeholder="e.g., /house-removals"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">The page this keyword should link to</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Link Frequency
                  </label>
                  <select
                    value={formData.link_frequency}
                    onChange={(e) => setFormData({ ...formData, link_frequency: e.target.value as 'first' | 'all' | 'limited' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent text-base"
                  >
                    <option value="first">First occurrence per page</option>
                    <option value="all">All occurrences per page</option>
                    <option value="limited">Limited per page</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    How often to link this keyword on each individual page
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Max Links Per Page
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.max_links_per_page}
                    onChange={(e) => setFormData({ ...formData, max_links_per_page: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent text-base"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum links on each page (applies to "limited" frequency)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent text-base"
                  >
                    <option value="services">Services</option>
                    <option value="company">Company</option>
                    <option value="cta">Call to Action</option>
                    <option value="general">General</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Group similar keywords together</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 80 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent text-base"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Higher priority keywords are processed first (0-200)
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Active Status
                    </label>
                    <p className="text-xs text-gray-500">Enable or disable this keyword across all pages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#C73532]"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {formData.is_active ? 'On' : 'Off'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#C73532] text-white px-4 py-2 rounded-lg hover:bg-[#A92C2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Keyword
                    </>
                  )}
                </button>
                <button
                  onClick={resetForm}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keyword
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKeywords.map((keyword) => (
                <tr key={keyword.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{keyword.keyword_text}</div>
                    <div className="text-xs text-gray-500">
                      {keyword.link_frequency === 'first' && 'First per page'}
                      {keyword.link_frequency === 'all' && 'All per page'}
                      {keyword.link_frequency === 'limited' && `Max ${keyword.max_links_per_page}/page`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{keyword.target_url}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {keyword.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {keyword.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        keyword.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {keyword.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(keyword)}
                        className="text-[#C73532] hover:text-[#A92C2A]"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(keyword.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredKeywords.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No keywords found. Add your first keyword to start auto-linking.
        </div>
      )}
    </div>
  );
}
