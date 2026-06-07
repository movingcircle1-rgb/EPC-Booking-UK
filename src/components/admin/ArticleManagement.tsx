import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Save, X, AlertCircle, CheckCircle, Eye, FileText, Calendar, Tag, ExternalLink, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import RichTextEditor from './RichTextEditor';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  meta_title: string | null;
  meta_description: string | null;
  author_id: string | null;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

const categories = [
  'Blog',
  'Location Guide',
  'Service Guide',
  'Moving Tips',
  'Company News',
  'Customer Stories',
  'General'
];

export default function ArticleManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const { user } = useAuth();

  const emptyArticle: Omit<Article, 'id' | 'view_count' | 'created_at' | 'updated_at'> = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: null,
    category: 'Blog',
    tags: [],
    status: 'draft',
    meta_title: null,
    meta_description: null,
    author_id: null,
    published_at: null,
  };

  const [formData, setFormData] = useState<Omit<Article, 'id' | 'view_count' | 'created_at' | 'updated_at'>>(emptyArticle);
  const [tagInput, setTagInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    } else if (error) {
      console.error('Error loading articles:', error);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `article-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setFormData({ ...formData, featured_image: publicUrl });
      setImagePreview(publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    const slug = formData.slug || generateSlug(formData.title);

    setSaving(true);

    try {
      const articleData = {
        ...formData,
        slug,
        author_id: user?.id || null,
        published_at: formData.status === 'published' && !formData.published_at ? new Date().toISOString() : formData.published_at,
      };

      if (editingArticle) {
        const { error: updateError } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (updateError) throw updateError;
        setSuccess('Article updated successfully!');
      } else {
        const { error: insertError } = await supabase
          .from('articles')
          .insert([articleData]);

        if (insertError) throw insertError;
        setSuccess('Article created successfully!');
      }

      await loadArticles();
      setTimeout(() => resetForm(), 1500);
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err instanceof Error ? err.message : 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadArticles();
    } else {
      console.error('Error deleting article:', error);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      featured_image: article.featured_image,
      category: article.category,
      tags: article.tags || [],
      status: article.status,
      meta_title: article.meta_title,
      meta_description: article.meta_description,
      author_id: article.author_id,
      published_at: article.published_at,
    });
    setImagePreview(article.featured_image);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(emptyArticle);
    setEditingArticle(null);
    setShowForm(false);
    setError(null);
    setSuccess(null);
    setSaving(false);
    setTagInput('');
    setImagePreview(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const getWordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const filteredArticles = articles.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e71c5e]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Article Management</h2>
          <p className="text-sm text-gray-600 mt-1">Create and manage blog posts and content articles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#e71c5e] text-white px-4 py-2 rounded-lg hover:bg-[#c91852] transition-colors"
        >
          <Plus size={20} />
          New Article
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'all' ? 'bg-[#e71c5e] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'draft' ? 'bg-[#e71c5e] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Drafts
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'published' ? 'bg-[#e71c5e] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Published
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingArticle ? 'Edit Article' : 'Create New Article'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (!editingArticle) {
                        setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent text-base"
                    placeholder="Enter article title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent text-base"
                    placeholder="auto-generated-from-title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent text-base"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Excerpt (Short Summary)
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                    placeholder="Brief summary of the article (150-200 characters)"
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length} / 300 characters</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Content * ({getWordCount(formData.content.replace(/<[^>]*>/g, ''))} words)
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Start writing your beautiful article..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 300 words recommended for SEO</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Featured Image
                  </label>

                  {(formData.featured_image || imagePreview) && (
                    <div className="mb-4 relative">
                      <img
                        src={imagePreview || formData.featured_image || ''}
                        alt="Preview"
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, featured_image: null });
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#e71c5e] hover:bg-gray-50 transition-colors">
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#e71c5e]"></div>
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                              {formData.featured_image ? 'Change Image' : 'Upload Image'}
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 1200x630px (16:9). Max 5MB. JPG, PNG, or WebP.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent text-base"
                      placeholder="Add tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        <Tag size={14} />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent text-base"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>SEO Management:</strong> To edit meta titles and descriptions for articles, go to <span className="font-semibold">SEO Management</span> tab → <span className="font-semibold">Article Pages</span> section.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#e71c5e] text-white px-4 py-2 rounded-lg hover:bg-[#c91852] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingArticle ? 'Update Article' : 'Create Article'}
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

      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  {article.featured_image && (
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FileText size={16} />
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(article.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={16} />
                    {article.view_count} views
                  </span>
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex lg:flex-col items-center gap-2">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                    article.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : article.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                </span>
                <div className="flex gap-2">
                  {article.status === 'published' && (
                    <a
                      href={`/articles/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                      title="View Article"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(article)}
                    className="p-2 text-[#e71c5e] hover:bg-[#e71c5e] hover:text-white rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg font-medium">No articles found</p>
          <p className="text-gray-500 text-sm mt-1">Create your first article to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 bg-[#e71c5e] text-white px-4 py-2 rounded-lg hover:bg-[#c91852] transition-colors"
          >
            <Plus size={20} />
            Create Article
          </button>
        </div>
      )}
    </div>
  );
}
