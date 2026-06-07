import { useState } from 'react';
import { X, Package, Plus, Minus, ShoppingCart, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface PackagingOrderModalProps {
  onClose: () => void;
  onComplete: () => void;
}

interface PackagingItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

const PACKAGING_ITEMS = [
  { name: 'Small Cardboard Box', description: '18" x 12" x 12" - Books, small items', price: 2.50 },
  { name: 'Medium Cardboard Box', description: '20" x 15" x 15" - Kitchen, bathroom', price: 3.50 },
  { name: 'Large Cardboard Box', description: '24" x 18" x 18" - Clothes, bedding', price: 4.50 },
  { name: 'Extra Large Box', description: '28" x 20" x 20" - Bulky items', price: 5.50 },
  { name: 'Wardrobe Box', description: 'With hanging rail - Suits, dresses', price: 12.00 },
  { name: 'Picture/Mirror Box', description: 'Adjustable flat pack', price: 8.00 },
  { name: 'Bubble Wrap Roll', description: '50m x 50cm', price: 15.00 },
  { name: 'Packing Tape Roll', description: 'Heavy duty 50m', price: 3.00 },
  { name: 'Tissue Paper Pack', description: '100 sheets', price: 8.00 },
  { name: 'Furniture Covers', description: 'Pack of 5 large covers', price: 12.00 },
  { name: 'Marker Pens Set', description: 'Pack of 4 permanent markers', price: 4.00 }
];

export function PackagingOrderModal({ onClose, onComplete }: PackagingOrderModalProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<PackagingItem[]>(
    PACKAGING_ITEMS.map(item => ({ ...item, quantity: 0 }))
  );
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    postcode: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleQuantityChange = (index: number, delta: number) => {
    setItems(items.map((item, i) => {
      if (i === index) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getSelectedItems = () => {
    return items.filter(item => item.quantity > 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const handleSubmit = async () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postcode || !deliveryAddress.phone) {
      alert('Please fill in all delivery address fields');
      return;
    }

    setSubmitting(true);
    try {
      const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.city}`;

      const { error: insertError } = await supabase
        .from('packaging_orders')
        .insert({
          user_id: user?.id,
          customer_email: user?.email || '',
          delivery_address: fullAddress,
          delivery_postcode: deliveryAddress.postcode,
          contact_phone: deliveryAddress.phone,
          items: selectedItems,
          total_amount: calculateTotal(),
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      alert('Packaging order placed successfully! We\'ll contact you to arrange delivery.');
      onComplete();
      onClose();
    } catch (err) {
      console.error('[PackagingOrderModal] Error:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItemsCount = getSelectedItems().length;
  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Order Packaging Materials
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">
              📦 Order your packing materials and we'll deliver them to your door!
            </p>
            <p className="text-xs text-blue-700">
              Free delivery on orders over £50
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Select Items</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-lg font-bold text-orange-600 mt-1">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => handleQuantityChange(index, -1)}
                      disabled={item.quantity === 0}
                      className="w-10 h-10 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(index, 1)}
                      className="w-10 h-10 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedItemsCount > 0 && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Delivery Address
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="123 High Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Wolverhampton"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.postcode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, postcode: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="WV13 3YA"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={deliveryAddress.phone}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="01234 567890"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedItemsCount > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t space-y-4">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Total:</span>
              <span className="text-orange-600">{formatCurrency(total)}</span>
            </div>
            {total >= 50 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-green-800 font-semibold">🎉 Free Delivery Unlocked!</p>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Place Order - {formatCurrency(total)}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
