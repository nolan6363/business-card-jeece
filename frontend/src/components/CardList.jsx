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
        <div key={card.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              {card.photo_path ? (
                <img
                  src={`${API_URL}/api/photos/${card.photo_path}`}
                  alt={`${card.first_name} ${card.last_name}`}
                  className="w-16 h-16 object-cover rounded-xl"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg rounded-xl">
                  {card.first_name[0]}{card.last_name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {card.first_name} {card.last_name}
                </h3>
                <p className="text-sm text-gray-600 truncate font-medium">{card.position}</p>
                <p className="text-sm text-gray-500 truncate">{card.company}</p>
              </div>
            </div>

            <div className="space-y-2.5 mb-6 pb-6 border-b border-gray-100">
              <p className="text-sm text-gray-600 truncate">{card.email}</p>
              {card.phone && (
                <p className="text-sm text-gray-600 truncate">{card.phone}</p>
              )}
              {card.website && (
                <p className="text-sm text-gray-500 truncate">{card.website}</p>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-600 font-medium">{card.scan_count} scans</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  card.is_active ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {card.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => window.open(`/card/${card.id}`, '_blank')}
                className="px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Voir
              </button>
              <button
                onClick={() => copyToClipboard(card.id)}
                className="px-4 py-2.5 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all shadow-sm"
              >
                Copier
              </button>
              <button
                onClick={() => onEdit(card)}
                className="px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Modifier
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="px-4 py-2.5 text-sm font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all"
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
