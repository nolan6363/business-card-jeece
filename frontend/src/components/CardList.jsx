export default function CardList({ cards, onEdit, onDelete, onCopyLink }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const copyToClipboard = (cardId) => {
    const url = `${window.location.origin}/card/${cardId}`;
    navigator.clipboard.writeText(url);
    onCopyLink(cardId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.id} className="bg-white border border-gray-200">
          <div className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              {card.photo_path ? (
                <img
                  src={`${API_URL}/api/photos/${card.photo_path}`}
                  alt={`${card.first_name} ${card.last_name}`}
                  className="w-16 h-16 object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                  {card.first_name[0]}{card.last_name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {card.first_name} {card.last_name}
                </h3>
                <p className="text-sm text-gray-600 truncate">{card.position}</p>
                <p className="text-sm text-gray-500 truncate">{card.company}</p>
              </div>
            </div>

            <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 truncate">{card.email}</p>
              {card.website && (
                <p className="text-sm text-gray-500 truncate">{card.website}</p>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-600">{card.scan_count} scans</span>
                <span className={`text-xs font-medium ${
                  card.is_active ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  {card.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.open(`/card/${card.id}`, '_blank')}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
              >
                Voir
              </button>
              <button
                onClick={() => copyToClipboard(card.id)}
                className="px-4 py-2 text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Copier
              </button>
              <button
                onClick={() => onEdit(card)}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="px-4 py-2 text-sm border border-red-300 text-red-600 hover:border-red-400 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
