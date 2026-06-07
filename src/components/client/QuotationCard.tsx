import { FileText, Download, Share2, Check, X, Calendar, Plus } from 'lucide-react';
import { Quotation } from '../../hooks/useQuotations';
import StatusBadge from '../portal/StatusBadge';
import { pdfGenerator } from '../../lib/pdf-generator';

interface QuotationCardProps {
  quotation: Quotation;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
  onAddServices: (id: string) => void;
  onSelectMoveDate: (id: string) => void;
  onViewPayment: (id: string) => void;
}

export function QuotationCard({
  quotation,
  onAccept,
  onDecline,
  onAddServices,
  onSelectMoveDate,
  onViewPayment
}: QuotationCardProps) {
  const isExpired = new Date(quotation.valid_until) < new Date();
  const isPending = quotation.status === 'pending' || quotation.status === 'sent';
  const isAccepted = quotation.status === 'accepted';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDownload = () => {
    pdfGenerator.generateQuotationPDF(quotation);
  };

  const handleShare = async () => {
    const shareText = `Check out my moving quotation from National Removals and Storage\n\nQuote Number: ${quotation.quotation_number}\nFrom: ${quotation.move_from}\nTo: ${quotation.move_to}\nTotal: ${formatCurrency(quotation.total_amount)}`;

    const shareData = {
      title: `Quotation ${quotation.quotation_number}`,
      text: shareText,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText + '\n' + window.location.href);
        alert('Quotation details copied to clipboard!');
      } catch (err) {
        const email = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareText + '\n\n' + window.location.href)}`;
        window.location.href = email;
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Quote {quotation.quotation_number}</h3>
            <p className="text-gray-200 text-sm mt-1">
              Created {formatDate(quotation.created_at)}
            </p>
          </div>
          <StatusBadge status={quotation.status} />
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 font-medium">From</p>
            <p className="text-gray-900">{quotation.move_from}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">To</p>
            <p className="text-gray-900">{quotation.move_to}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 font-medium">Service Type</p>
            <p className="text-gray-900">{quotation.service_type}</p>
          </div>
        </div>

        {quotation.move_date && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-medium">Move Date Selected</p>
            <p className="text-blue-900 font-semibold">{formatDate(quotation.move_date)}</p>
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Base Price</span>
            <span className="font-semibold">{formatCurrency(quotation.base_amount)}</span>
          </div>
          {quotation.additional_services_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-700">Additional Services</span>
              <span className="font-semibold">{formatCurrency(quotation.additional_services_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total Price</span>
            <span className="text-gray-800">{formatCurrency(quotation.total_amount)}</span>
          </div>
        </div>

        {quotation.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 font-medium">Notes</p>
            <p className="text-yellow-900 text-sm mt-1">{quotation.notes}</p>
          </div>
        )}

        {isExpired && isPending && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800 font-medium">
              This quotation expired on {formatDate(quotation.valid_until)}
            </p>
            <p className="text-red-700 text-sm mt-1">Please contact us for an updated quote</p>
          </div>
        )}

        {!isExpired && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              Valid until {formatDate(quotation.valid_until)}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={() => pdfGenerator.downloadTermsAndConditions()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Terms & Conditions
          </button>
        </div>

        {isPending && !isExpired && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={() => onAccept(quotation.id)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <Check className="h-5 w-5" />
              Accept Quotation
            </button>
            <button
              onClick={() => onDecline(quotation.id)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <X className="h-5 w-5" />
              Decline
            </button>
          </div>
        )}

        {isAccepted && (
          <div className="space-y-3 pt-4 border-t">
            <button
              onClick={() => onAddServices(quotation.id)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus className="h-5 w-5" />
              Add Optional Services
            </button>
            {!quotation.move_date && (
              <button
                onClick={() => onSelectMoveDate(quotation.id)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                <Calendar className="h-5 w-5" />
                Choose Move Date
              </button>
            )}
            <button
              onClick={() => onViewPayment(quotation.id)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:from-pink-700 hover:to-red-700 transition-colors font-semibold shadow-lg"
            >
              Make Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
