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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-gray-600 font-medium">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-900 text-lg font-semibold mb-2">Erreur</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header avec photo */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 py-10 sm:py-14 px-4 sm:px-8 text-center relative flex items-center justify-center">
            {card.photo_path ? (
              <img
                src={`${API_URL}/api/photos/${card.photo_path}`}
                alt={`${card.first_name} ${card.last_name}`}
                className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-white"
              />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white/90 backdrop-blur flex items-center justify-center text-primary-600 font-bold text-4xl sm:text-5xl rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-white">
                {card.first_name[0]}{card.last_name[0]}
              </div>
            )}
          </div>

          {/* Informations principales */}
          <div className="px-5 py-8 sm:px-8 sm:py-10">
            <div className="text-center mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 sm:mb-3 px-2">
                {card.first_name} {card.last_name}
              </h1>
              <p className="text-base sm:text-lg text-primary-600 font-semibold mb-1 sm:mb-2 px-2">{card.position}</p>
              <p className="text-sm sm:text-base text-gray-600 font-medium px-2">{card.company}</p>
            </div>

            {/* Coordonnées */}
            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-all">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Email</p>
                  <a
                    href={`mailto:${card.email}`}
                    className="text-sm sm:text-base text-gray-900 hover:text-primary-600 font-medium transition-colors break-all"
                  >
                    {card.email}
                  </a>
                </div>
              </div>

              {card.phone && (
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-all">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Téléphone</p>
                    <a
                      href={`tel:${card.phone}`}
                      className="text-sm sm:text-base text-gray-900 hover:text-primary-600 font-medium transition-colors break-all"
                    >
                      {card.phone}
                    </a>
                  </div>
                </div>
              )}

              {card.website && (
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-all">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Site Web</p>
                    <a
                      href={card.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base text-gray-900 hover:text-primary-600 font-medium transition-colors break-all"
                    >
                      {card.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="space-y-2.5 sm:space-y-3">
              {card.website && (
                <button
                  onClick={handleVisitWebsite}
                  className="w-full py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base text-center border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold shadow-sm hover:shadow flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Visiter le Site Web</span>
                </button>
              )}

              <button
                onClick={handleDownloadVCard}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base text-center bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-semibold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" />
                </svg>
                <span>Ajouter aux Contacts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer discret */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-gray-500">
            Carte de visite digitale
          </p>
        </div>
      </div>
    </div>
  );
}
