import { useState } from 'react';

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
        <div key={card.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              {card.photo_path ? (
                <img
                  src={`${API_URL}/api/photos/${card.photo_path}`}
                  alt={`${card.first_name} ${card.last_name}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
                  {card.first_name[0]}{card.last_name[0]}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">
                  {card.first_name} {card.last_name}
                </h3>
                <p className="text-sm text-gray-600">{card.position}</p>
                <p className="text-sm text-gray-500">{card.company}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {card.email}
              </p>
              {card.website && (
                <p className="text-sm text-gray-600 truncate">
                  <span className="font-medium">Website:</span> {card.website}
                </p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Scans:</span> {card.scan_count}
                </p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  card.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {card.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.open(`/card/${card.id}`, '_blank')}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                View
              </button>
              <button
                onClick={() => copyToClipboard(card.id)}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Copy Link
              </button>
              <button
                onClick={() => onEdit(card)}
                className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
