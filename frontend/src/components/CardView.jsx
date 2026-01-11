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
      await recordScan(id);
    } catch (err) {
      setError(err.response?.data?.error || 'Carte non trouvée');
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <p className="text-gray-900 text-lg mb-2">Erreur</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {card.photo_path && (
          <div className="mb-12">
            <img
              src={`${API_URL}/api/photos/${card.photo_path}`}
              alt={`${card.first_name} ${card.last_name}`}
              className="w-32 h-32 mx-auto object-cover"
            />
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-gray-900 mb-4">
            {card.first_name} {card.last_name}
          </h1>
          <p className="text-lg text-primary-600 mb-2">{card.position}</p>
          <p className="text-gray-600">{card.company}</p>
        </div>

        <div className="space-y-6 mb-12">
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <a href={`mailto:${card.email}`} className="text-gray-900">
              {card.email}
            </a>
          </div>

          {card.website && (
            <div className="border-b border-gray-200 pb-4">
              <p className="text-sm text-gray-500 mb-1">Site Web</p>
              <a href={card.website} target="_blank" rel="noopener noreferrer" className="text-gray-900">
                {card.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {card.website && (
            <button
              onClick={handleVisitWebsite}
              className="w-full py-4 text-center border border-gray-300 text-gray-900 hover:border-gray-400 transition-colors font-medium"
            >
              Visiter le Site Web
            </button>
          )}

          <button
            onClick={handleDownloadVCard}
            className="w-full py-4 text-center bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium"
          >
            Ajouter aux Contacts
          </button>
        </div>
      </div>
    </div>
  );
}
