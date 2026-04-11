const statusConfig = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', emoji: '⏳' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700', emoji: '✅' },
  PREPARING: { bg: 'bg-purple-100', text: 'text-purple-700', emoji: '👨‍🍳' },
  READY: { bg: 'bg-indigo-100', text: 'text-indigo-700', emoji: '🎉' },
  PICKED_UP: { bg: 'bg-orange-100', text: 'text-orange-700', emoji: '🚗' },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-700', emoji: '✨' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', emoji: '❌' },
  ASSIGNED: { bg: 'bg-cyan-100', text: 'text-cyan-700', emoji: '📍' },
};

const OrderStatusBadge = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.PENDING;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1';

  return (
    <span className={`${config.bg} ${config.text} ${sizeClass} rounded-full font-medium inline-flex items-center gap-1`}>
      {config.emoji} {status}
    </span>
  );
};

export default OrderStatusBadge;
