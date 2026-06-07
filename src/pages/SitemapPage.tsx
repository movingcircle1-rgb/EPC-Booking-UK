import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import AutoLinkedContent from '../components/AutoLinkedContent';
import { useSEO } from '../hooks/useSEO';

export default function SitemapPage() {
  const { seoData, loading: seoLoading } = useSEO('/sitemap');
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = async () => {
    try {
      setLoading(true);
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sitemap`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate sitemap');
      }

      const xml = await response.text();
      setSitemapXml(xml);
      setLoading(false);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sitemapXml && !loading) {
      const blob = new Blob([sitemapXml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [sitemapXml, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#C73532] mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating sitemap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#293132]">Sitemap Generated</h1>
            <button
              onClick={generateSitemap}
              className="bg-[#C73532] text-white px-6 py-2 rounded-lg hover:bg-[#A92C2A] transition-colors"
            >
              Regenerate
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2 text-[#293132]">Sitemap Statistics</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total URLs:</span>
                <span className="ml-2 font-semibold">{(sitemapXml.match(/<url>/g) || []).length}</span>
              </div>
              <div>
                <span className="text-gray-600">File Size:</span>
                <span className="ml-2 font-semibold">{(sitemapXml.length / 1024).toFixed(2)} KB</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
            <pre className="text-xs font-mono">{sitemapXml}</pre>
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Sitemap has been downloaded!</h3>
              <p className="text-sm text-blue-800">
                The sitemap is also available at:
              </p>
              <p className="mt-2 font-mono text-sm bg-blue-100 p-2 rounded">
                {import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sitemap
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Submit this URL to search engines for automatic updates.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Next Steps</h3>
              <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                <li>Submit sitemap URL to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-600">Google Search Console</a></li>
                <li>Add to <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-600">Bing Webmaster Tools</a></li>
                <li>Sitemap updates automatically when you add new content</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
