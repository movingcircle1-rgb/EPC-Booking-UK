import { useState, useEffect } from 'react';
import { X, CreditCard, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentModalProps {
  quotationId: string;
  amount: number;
  onClose: () => void;
}

interface PaymentLink {
  id: string;
  payment_url: string;
  amount: number;
  status: string;
  expires_at: string;
}

export function PaymentModal({ quotationId, amount, onClose }: PaymentModalProps) {
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrCreatePaymentLink();
  }, [quotationId]);

  async function fetchOrCreatePaymentLink() {
    try {
      setLoading(true);

      const { data: existing, error: fetchError } = await supabase
        .from('payment_links')
        .select('*')
        .eq('quotation_id', quotationId)
        .eq('status', 'pending')
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        setPaymentLink(existing);
      } else {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const paymentUrl = `https://pay.nationalremovals.co.uk/payment/${quotationId}`;

        const { data: newLink, error: createError } = await supabase
          .from('payment_links')
          .insert({
            quotation_id: quotationId,
            payment_url: paymentUrl,
            amount: amount,
            status: 'pending',
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;

        setPaymentLink(newLink);
      }
    } catch (err) {
      console.error('[PaymentModal] Error with payment link:', err);
      alert('Failed to generate payment link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amt);
  };

  const handleCopyLink = async () => {
    if (paymentLink) {
      try {
        await navigator.clipboard.writeText(paymentLink.payment_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleProceedToPayment = () => {
    if (paymentLink) {
      window.open(paymentLink.payment_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating secure payment link...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Secure Payment
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total Amount Due:</span>
              <span className="text-3xl font-bold text-gray-900">{formatCurrency(amount)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-blue-600" />
              Your Secure Payment Link
            </h3>
            <p className="text-sm text-gray-600">
              This secure payment link is valid for 7 days. You can copy it and return to make payment at any time.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={paymentLink?.payment_url || ''}
                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Secure Payment Process</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ 256-bit SSL encryption</li>
              <li>✓ PCI DSS compliant</li>
              <li>✓ Multiple payment methods accepted</li>
              <li>✓ Instant confirmation email</li>
            </ul>
          </div>

          <button
            onClick={handleProceedToPayment}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:from-pink-700 hover:to-red-700 transition-colors font-bold text-lg shadow-lg"
          >
            <CreditCard className="h-6 w-6" />
            Proceed to Secure Payment
          </button>

          <p className="text-xs text-gray-500 text-center">
            By proceeding, you agree to our Terms & Conditions and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
