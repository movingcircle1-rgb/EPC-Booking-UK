import { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { useAdditionalServices } from '../../hooks/useQuotations';

interface AddServicesModalProps {
  quotationId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface SelectedService {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function AddServicesModal({ quotationId, onClose, onComplete }: AddServicesModalProps) {
  const { services, loading, addServiceToQuotation } = useAdditionalServices();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

  const handleAddService = (serviceId: string, name: string, price: number) => {
    const existing = selectedServices.find(s => s.id === serviceId);
    if (existing) {
      setSelectedServices(
        selectedServices.map(s =>
          s.id === serviceId ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setSelectedServices([...selectedServices, { id: serviceId, name, price, quantity: 1 }]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    const existing = selectedServices.find(s => s.id === serviceId);
    if (existing && existing.quantity > 1) {
      setSelectedServices(
        selectedServices.map(s =>
          s.id === serviceId ? { ...s, quantity: s.quantity - 1 } : s
        )
      );
    } else {
      setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
    }
  };

  const getServiceQuantity = (serviceId: string) => {
    return selectedServices.find(s => s.id === serviceId)?.quantity || 0;
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + (service.price * service.quantity);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    setSubmitting(true);
    try {
      for (const service of selectedServices) {
        const result = await addServiceToQuotation(quotationId, service.id, service.quantity);
        if (!result.success) {
          throw new Error(result.error || 'Failed to add service');
        }
      }
      onComplete();
      onClose();
    } catch (err) {
      console.error('[AddServicesModal] Error submitting services:', err);
      alert('Failed to add services. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold">Add Optional Services</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b">
                {category}
              </h3>
              <div className="space-y-3">
                {categoryServices.map(service => {
                  const quantity = getServiceQuantity(service.id);
                  return (
                    <div
                      key={service.id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          {formatCurrency(service.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {quantity > 0 ? (
                          <>
                            <button
                              onClick={() => handleRemoveService(service.id)}
                              className="w-10 h-10 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center"
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                            <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                            <button
                              onClick={() => handleAddService(service.id, service.name, service.price)}
                              className="w-10 h-10 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleAddService(service.id, service.name, service.price)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selectedServices.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="space-y-2 mb-4">
              <h4 className="font-semibold text-gray-800">Selected Services:</h4>
              {selectedServices.map(service => (
                <div key={service.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {service.name} x {service.quantity}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(service.price * service.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Additional Services Total:</span>
                <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding Services...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Confirm & Add Services
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
