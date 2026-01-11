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
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' or 'stats'
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
        showNotification('Failed to load cards', 'error');
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
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      await deleteCard(cardId);
      showNotification('Card deleted successfully', 'success');
      loadCards();
    } catch (err) {
      showNotification('Failed to delete card', 'error');
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
    showNotification('Link copied to clipboard!', 'success');
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Business Cards Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification && (
          <div className={`mb-4 p-4 rounded ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'cards'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Statistics
          </button>
        </div>

        {activeTab === 'cards' ? (
          <>
            <div className="mb-6">
              <button
                onClick={handleNewCard}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + New Business Card
              </button>
            </div>

            {cards.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 text-lg">
                  No business cards yet. Create your first one!
                </p>
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
