import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCards, deleteCard } from '../api';
import CardList from './CardList';
import CardForm from './CardForm';
import Stats from './Stats';

export default function Dashboard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('cards');
  const navigate = useNavigate();

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await getCards();
      setCards(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        showNotification('Échec du chargement des cartes', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNewCard = () => {
    setEditingCard(null);
    setShowForm(true);
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      return;
    }

    try {
      await deleteCard(cardId);
      showNotification('Carte supprimée', 'success');
      loadCards();
    } catch (err) {
      showNotification('Échec de la suppression', 'error');
    }
  };

  const handleFormClose = (shouldReload) => {
    setShowForm(false);
    setEditingCard(null);
    if (shouldReload) {
      loadCards();
    }
  };

  const handleCopyLink = (cardId) => {
    showNotification('Lien copié', 'success');
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 font-medium">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tableau de Bord</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Gestion des cartes de visite digitales</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {notification && (
          <div className={`mb-6 p-4 rounded-xl border ${
            notification.type === 'success'
              ? 'bg-primary-50 border-primary-200 text-primary-800'
              : 'bg-red-50 border-red-200 text-red-800'
          } shadow-sm font-medium`}>
            {notification.message}
          </div>
        )}

        <div className="mb-8">
          <div className="flex space-x-2 bg-white p-1.5 rounded-xl border border-gray-200 inline-flex shadow-sm">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'cards'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Mes Cartes {cards.length > 0 && `(${cards.length})`}
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'stats'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Statistiques
            </button>
          </div>
        </div>

        {activeTab === 'cards' ? (
          <>
            <div className="mb-8">
              <button
                onClick={handleNewCard}
                className="px-6 py-3.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-semibold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
              >
                + Nouvelle Carte
              </button>
            </div>

            {cards.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune carte de visite</h3>
                  <p className="text-gray-500 mb-6">Créez votre première carte de visite digitale</p>
                  <button
                    onClick={handleNewCard}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-semibold shadow-lg shadow-primary-500/20"
                  >
                    Créer une Carte
                  </button>
                </div>
              </div>
            ) : (
              <CardList
                cards={cards}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopyLink={handleCopyLink}
              />
            )}
          </>
        ) : (
          <Stats />
        )}
      </main>

      {showForm && (
        <CardForm
          card={editingCard}
          onClose={handleFormClose}
          onSuccess={(message) => {
            showNotification(message, 'success');
            handleFormClose(true);
          }}
          onError={(message) => showNotification(message, 'error')}
        />
      )}
    </div>
  );
}
