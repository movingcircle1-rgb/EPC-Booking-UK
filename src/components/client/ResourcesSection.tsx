import { Download, Phone, Mail, MapPin, FileText, CheckSquare, User } from 'lucide-react';
import { resourcesGenerator } from '../../lib/resources-generator';
import { brandConfig } from '../../config/branding';

export function ResourcesSection() {
  const handleDownload = (resource: string) => {
    switch (resource) {
      case 'Packing Guide':
        resourcesGenerator.generatePackingGuide();
        break;
      case 'Moving Checklist':
        resourcesGenerator.generateMovingChecklist();
        break;
      case 'Preparation Guide':
        resourcesGenerator.generatePreparationGuide();
        break;
      case 'New Home Essentials':
        resourcesGenerator.generateNewHomeEssentials();
        break;
      default:
        alert(`Resource not available: ${resource}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Resources & Support</h2>
        <p className="text-gray-600">
          Everything you need for a successful move
        </p>
      </div>

      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg p-6 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-300 flex-shrink-0" />
            <span className="text-lg font-semibold">Your Move Manager</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">{brandConfig.contact.moveManager.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-300 flex-shrink-0" />
            <a
              href={brandConfig.contact.moveManager.phoneHref}
              className="text-base hover:text-gray-200 transition-colors"
            >
              {brandConfig.contact.moveManager.phone}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-300 flex-shrink-0" />
            <a
              href={brandConfig.contact.moveManager.emailHref}
              className="text-base hover:text-gray-200 transition-colors break-all"
            >
              {brandConfig.contact.moveManager.email}
            </a>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => handleDownload('Packing Guide')}
          className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Packing Guide</h3>
              <p className="text-sm text-gray-600 mb-3">
                Complete guide to packing your belongings safely and efficiently
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                <Download className="h-4 w-4" />
                Download PDF
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleDownload('Moving Checklist')}
          className="bg-white border-2 border-green-200 rounded-lg p-6 hover:border-green-400 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Moving Checklist</h3>
              <p className="text-sm text-gray-600 mb-3">
                Step-by-step checklist to ensure nothing is forgotten
              </p>
              <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                <Download className="h-4 w-4" />
                Download PDF
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleDownload('Preparation Guide')}
          className="bg-white border-2 border-orange-200 rounded-lg p-6 hover:border-orange-400 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Preparation Tips</h3>
              <p className="text-sm text-gray-600 mb-3">
                Expert tips for preparing your home for moving day
              </p>
              <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                <Download className="h-4 w-4" />
                Download PDF
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleDownload('New Home Essentials')}
          className="bg-white border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
              <CheckSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">New Home Essentials</h3>
              <p className="text-sm text-gray-600 mb-3">
                What to have ready on your first day in your new home
              </p>
              <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm">
                <Download className="h-4 w-4" />
                Download PDF
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <MapPin className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 mb-3">Our Office</h3>
            <p className="text-blue-600 font-semibold leading-relaxed">
              {brandConfig.contact.address.street}<br />
              {brandConfig.contact.address.city}, {brandConfig.contact.address.country}<br />
              {brandConfig.contact.address.postcode}
            </p>
            <div className="mt-4 pt-4 border-t border-blue-300">
              <p className="text-blue-800">
                <strong>Office Hours:</strong><br />
                {brandConfig.contact.officeHours.weekdays}<br />
                {brandConfig.contact.officeHours.saturday}<br />
                {brandConfig.contact.officeHours.sunday}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Quick Tips for Moving Day</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Keep important documents and valuables with you</li>
          <li>Have refreshments ready for the moving team</li>
          <li>Take meter readings at both properties</li>
          <li>Keep your phone charged for updates</li>
          <li>Have cash available for tips if you wish</li>
        </ul>
      </div>
    </div>
  );
}
