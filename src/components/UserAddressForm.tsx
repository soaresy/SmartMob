import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { getAddressPredictions, getPlaceDetails, loadGoogleMapsScript, PlacePrediction } from '../services/googlePlaces';

interface AddressData {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  complement: string;
  latitude: number;
  longitude: number;
}

interface UserAddressFormProps {
  initialData?: Partial<AddressData>;
  onSave: (data: AddressData) => Promise<void>;
  loading?: boolean;
}

export default function UserAddressForm({ initialData, onSave, loading: externalLoading }: UserAddressFormProps) {
  const [formData, setFormData] = useState<AddressData>({
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zip_code: initialData?.zip_code || '',
    complement: initialData?.complement || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
  });

  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const predictionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGoogleMapsScript().catch(() => {
      console.warn('Google Maps not available');
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (predictionsRef.current && !predictionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddressChange = async (value: string) => {
    setFormData(prev => ({ ...prev, address: value }));
    setError('');

    if (value.length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setLoading(true);
    try {
      const results = await getAddressPredictions(value);
      setPredictions(results);
      setShowPredictions(true);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    setLoading(true);
    try {
      const details = await getPlaceDetails(prediction.place_id);
      if (details) {
        setFormData(prev => ({
          ...prev,
          ...details,
          complement: prev.complement
        }));
        setShowPredictions(false);
      }
    } catch (err) {
      console.error('Error getting place details:', err);
      setError('Não foi possível obter detalhes do endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.address || !formData.city || !formData.state) {
      setError('Por favor, preencha os campos obrigatórios (endereço, cidade, estado)');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      setSuccess('Endereço salvo com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao salvar o endereço. Tente novamente.');
      console.error('Error saving address:', err);
    } finally {
      setSaving(false);
    }
  };

  const isLoading = externalLoading || saving;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Endereço Completo *
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={formData.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onFocus={() => predictions.length > 0 && setShowPredictions(true)}
            placeholder="Digite seu endereço (rua, número)"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
            disabled={isLoading}
          />
          {loading && (
            <Loader className="absolute right-3 top-3.5 h-5 w-5 text-[#1EB980] animate-spin" />
          )}
        </div>

        {showPredictions && predictions.length > 0 && (
          <div
            ref={predictionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                onClick={() => handleSelectPrediction(prediction)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition"
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-[#1EB980] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{prediction.main_text}</div>
                    {prediction.secondary_text && (
                      <div className="text-sm text-gray-600">{prediction.secondary_text}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cidade *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="Ex: São Paulo"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Estado (UF) *
          </label>
          <select
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
            disabled={isLoading}
          >
            <option value="">Selecione um estado</option>
            {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            CEP
          </label>
          <input
            type="text"
            value={formData.zip_code}
            onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
            placeholder="Ex: 01310-100"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Complemento (opcional)
          </label>
          <input
            type="text"
            value={formData.complement}
            onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
            placeholder="Ex: Apto 101"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
            disabled={isLoading}
          />
        </div>
      </div>

      {formData.latitude !== 0 && formData.longitude !== 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          <strong>Localização geográfica detectada:</strong> {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#1EB980] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#17a06d] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Salvando...</span>
          </>
        ) : (
          <>
            <MapPin className="h-5 w-5" />
            <span>Salvar Endereço</span>
          </>
        )}
      </button>
    </form>
  );
}
