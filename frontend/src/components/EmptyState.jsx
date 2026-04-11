const EmptyState = ({ icon = '📦', title = 'Nothing here yet', message = 'Come back soon!' }) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-lg font-semibold text-gray-800 mb-2">{title}</p>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default EmptyState;
