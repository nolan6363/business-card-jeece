import { useState, useEffect } from 'react';
import { createCard, updateCard } from '../api';

export default function CardForm({ card, onClose, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    website: '',
    is_active: true
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (card) {
      setFormData({
        first_name: card.first_name,
        last_name: card.last_name,
        email: card.email,
        phone: card.phone || '',
        company: card.company,
        position: card.position,
        website: card.website || '',
        is_active: card.is_active
      });

      if (card.photo_path) {
        setPhotoPreview(`${API_URL}/api/photos/${card.photo_path}`);
      }
    }
  }, [card]);

  const capitalizeWords = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    if ((name === 'first_name' || name === 'last_name') && type !== 'checkbox') {
      finalValue = capitalizeWords(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      if (photo) {
        formDataToSend.append('photo', photo);
      }

      if (card) {
        await updateCard(card.id, formDataToSend);
        onSuccess('Carte mise à jour');
      } else {
        await createCard(formDataToSend);
        onSuccess('Carte créée');
      }
    } catch (err) {
      onError(err.response?.data?.error || 'Échec de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-light text-gray-900">
              {card ? 'Modifier la Carte' : 'Nouvelle Carte'}
            </h2>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entreprise *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poste *
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Web
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo / Logo
            </label>
            {photoPreview && (
              <div className="mb-4">
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  className="w-24 h-24 object-cover border border-gray-200"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handlePhotoChange}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-2">PNG, JPG, WEBP (max. 5MB)</p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Carte active
            </label>
          </div>

          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-300 transition-colors font-medium"
            >
              {loading ? 'Enregistrement...' : card ? 'Mettre à Jour' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
