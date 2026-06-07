import { useEffect, useState } from 'react';
import { Calendar, Eye, Tag, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { useSEO } from '../hooks/useSEO';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  category: string;
  tags: string[];
  published_at: string;
  view_count: number;
}

export default function ArticlesPage() {
  // 🔑 IMPORTANT: must match Supabase page_path exactly
  const { seoData } = useSEO('/articles');

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    } else {
      console.error('Error loading articles:', error);
    }

    setLoading(false);
  };

  const categories = ['all', ...Array.from(new Set(articles.map((a) => a.category)))];

  const filteredArticles =
    selectedCategory === 'all'
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ SEO ALWAYS RENDERED */}
      <SEO
        title={
          seoData?.meta_title ||
          'Blog & Articles | Moving Tips & Guides | National Removals and Storage'
        }
        description={
          seoData?.meta_description ||
          'Read our latest articles, moving tips, packing guides, and industry insights. Expert advice from National Removals and Storage.'
        }
        keywords={
          seoData?.meta_keywords ||
          'removals blog, moving tips, storage advice, relocation guides, packing tips'
        }
        canonicalUrl={
          seoData?.canonical_url ||
          'https://nationalremovalsandstorage.co.uk/articles/'
        }
      />

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#293132] to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blog & Articles
            </h1>
            <p className="text-xl text-gray-300">
              Expert advice, moving tips, and industry insights to help make your
              move easier
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-[#be0e0c] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category === 'all' ? 'All Articles' : category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#be0e0c]"></div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              No articles found in this category.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredArticles.map((article) => (
              <a
                key={article.id}
                href={`/articles/${article.slug}/`}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow overflow-hidden group"
              >
                {article.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-[#be0e0c] text-white text-sm font-medium rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#be0e0c] transition-colors line-clamp-2">
                    {article.title}
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formatDate(article.published_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={16} />
                      {article.view_count} views
                    </span>
                  </div>

                  {article.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center text-[#be0e0c] font-medium">
                    Read More
                    <ArrowRight size={18} className="ml-2" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
