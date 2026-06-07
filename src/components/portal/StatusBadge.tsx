interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export default function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusVariant = (status: string): StatusBadgeProps['variant'] => {
    const lowerStatus = status.toLowerCase();
    if (['completed', 'paid', 'accepted', 'approved', 'active'].includes(lowerStatus)) {
      return 'success';
    }
    if (['pending', 'sent', 'processing'].includes(lowerStatus)) {
      return 'warning';
    }
    if (['cancelled', 'rejected', 'failed', 'expired'].includes(lowerStatus)) {
      return 'error';
    }
    if (['confirmed', 'booked', 'scheduled'].includes(lowerStatus)) {
      return 'info';
    }
    return 'default';
  };

  const finalVariant = variant === 'default' ? getStatusVariant(status) : variant;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getVariantClasses()}`}
    >
      {status}
    </span>
  );
}
