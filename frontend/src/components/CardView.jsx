import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCard, recordScan, getVCardUrl } from '../api';

export default function CardView() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadCard();
  }, [id]);

  const loadCard = async () => {
    try {
      const response = await getCard(id);
      setCard(response.data);

      // Record scan
      await recordScan(id);
    } catch (err) {
      setError(err.response?.data?.error || 'Card not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadVCard = () => {
    window.location.href = getVCardUrl(id);
  };

  const handleVisitWebsite = () => {
    if (card.website) {
      window.open(card.website, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {card.photo_path && (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <img
              src={`${API_URL}/api/photos/${card.photo_path}`}
              alt={`${card.first_name} ${card.last_name}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {card.first_name} {card.last_name}
            </h1>
            <p className="text-xl text-gray-600 mb-1">{card.position}</p>
            <p className="text-lg text-gray-500">{card.company}</p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center space-x-3 text-gray-700">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${card.email}`} className="hover:text-blue-600">
                {card.email}
              </a>
            </div>

            {card.website && (
              <div className="flex items-center space-x-3 text-gray-700">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <a href={card.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate">
                  {card.website}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {card.website && (
              <button
                onClick={handleVisitWebsite}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Visit Website
              </button>
            )}

            <button
              onClick={handleDownloadVCard}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add to Contacts</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Digital Business Card
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
