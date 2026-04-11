const MenuItem = ({ item, onAdd, added, disabled }) => {
  return (
    <div className={`bg-white rounded-xl p-4 flex justify-between items-center shadow-sm ${
      disabled ? 'opacity-60' : ''
    }`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center text-xs ${
            item.veg
              ? 'border-green-500 text-green-500'
              : 'border-red-500 text-red-500'
          }`}>
            ●
          </span>
          <h3 className="font-semibold text-gray-800">{item.name}</h3>
        </div>
        {item.description && (
          <p className="text-gray-500 text-sm mb-2">{item.description}</p>
        )}
        <p className="font-bold text-gray-800">₹{item.price}</p>
      </div>

      <button
        onClick={onAdd}
        disabled={disabled}
        className={`ml-4 px-6 py-2 rounded-lg font-semibold transition-all ${
          disabled
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : added
            ? 'bg-green-500 text-white'
            : 'bg-primary text-white hover:bg-orange-600'
        }`}
      >
        {disabled ? 'Closed' : added ? '✓ Added' : 'ADD'}
      </button>
    </div>
  );
};

export default MenuItem;