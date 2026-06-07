import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function CompanyPolicies() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<any[]>([]);
  const [acknowledgments, setAcknowledgments] = useState<any[]>([]);

  useEffect(() => {
    loadPolicies();
  }, [user]);

  const loadPolicies = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [policiesData, acknowledgementsData] = await Promise.all([
        supabase
          .from('company_policies')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('policy_acknowledgments')
          .select('*')
          .eq('user_id', user.id)
      ]);

      setPolicies(policiesData.data || []);
      setAcknowledgments(acknowledgementsData.data || []);
    } catch (error) {
      console.error('[CompanyPolicies] Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (policyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('policy_acknowledgments')
        .insert({
          user_id: user.id,
          policy_id: policyId,
          acknowledged_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Policy acknowledged successfully!');
      loadPolicies();
    } catch (error: any) {
      console.error('[CompanyPolicies] Error acknowledging policy:', error);
      alert('Failed to acknowledge policy. Please try again.');
    }
  };

  const isAcknowledged = (policyId: string) => {
    return acknowledgments.some(a => a.policy_id === policyId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Loading policies...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText size={24} className="text-[#be0e0c]" />
          Company Policies & Procedures
        </h2>
        <p className="text-sm text-gray-600 mt-1">Review and acknowledge company policies</p>
      </div>

      <div className="p-6">
        {policies.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No policies available at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => {
              const acknowledged = isAcknowledged(policy.id);

              return (
                <div
                  key={policy.id}
                  className={`border-2 rounded-lg p-6 transition-all ${
                    acknowledged
                      ? 'border-green-300 bg-green-50'
                      : policy.requires_acknowledgment
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{policy.title}</h3>
                        {acknowledged && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            <CheckCircle size={14} />
                            Acknowledged
                          </span>
                        )}
                        {!acknowledged && policy.requires_acknowledgment && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                            <Clock size={14} />
                            Action Required
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3">{policy.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Version {policy.version}</span>
                        <span>•</span>
                        <span>Effective: {new Date(policy.effective_date).toLocaleDateString()}</span>
                        {policy.category && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">
                              {policy.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {policy.document_url && (
                        <a
                          href={policy.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap"
                        >
                          <Download size={16} />
                          Download PDF
                        </a>
                      )}

                      {!acknowledged && policy.requires_acknowledgment && (
                        <button
                          onClick={() => handleAcknowledge(policy.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#be0e0c] text-white rounded-lg hover:bg-[#9f0b0a] transition-colors text-sm font-semibold whitespace-nowrap"
                        >
                          <CheckCircle size={16} />
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
