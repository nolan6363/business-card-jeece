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
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-light text-gray-900">Tableau de Bord</h1>
              <p className="text-sm text-gray-500 mt-1">Gestion des cartes de visite</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 text-sm text-gray-700 border border-gray-300 hover:border-gray-400 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {notification && (
          <div className={`mb-6 border-l-4 p-4 ${
            notification.type === 'success'
              ? 'border-primary-500 bg-primary-50 text-primary-800'
              : 'border-red-500 bg-red-50 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('cards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cards'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cartes ({cards.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'stats'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Statistiques
            </button>
          </nav>
        </div>

        {activeTab === 'cards' ? (
          <>
            <div className="mb-8">
              <button
                onClick={handleNewCard}
                className="px-6 py-3 bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium"
              >
                Nouvelle Carte
              </button>
            </div>

            {cards.length === 0 ? (
              <div className="bg-white border border-gray-200 p-16 text-center">
                <p className="text-gray-600 mb-6">Aucune carte de visite</p>
                <button
                  onClick={handleNewCard}
                  className="px-6 py-3 bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium"
                >
                  Créer une Carte
                </button>
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
