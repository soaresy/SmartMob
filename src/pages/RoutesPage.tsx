import { useState } from 'react';
import { Bus, Train, Bike, Users, MapPin, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateMultimodalRoute, calculateEstimatedCost } from '../services/googleMaps';

type Modal = 'bus' | 'metro' | 'bike' | 'walking' | 'carpool';

export default function RoutesPage() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedModals, setSelectedModals] = useState<Modal[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modals = [
    { id: 'bus' as Modal, icon: Bus, label: 'Ônibus', color: 'text-orange-600' },
    { id: 'metro' as Modal, icon: Train, label: 'Metrô', color: 'text-blue-600' },
    { id: 'bike' as Modal, icon: Bike, label: 'Bicicleta', color: 'text-green-600' },
    { id: 'walking' as Modal, icon: MapPin, label: 'Caminhada', color: 'text-teal-600' },
    { id: 'carpool' as Modal, icon: Users, label: 'Carona', color: 'text-purple-600' },
  ];

  const toggleModal = (modalId: Modal) => {
    setSelectedModals(prev =>
      prev.includes(modalId) ? prev.filter(m => m !== modalId) : [...prev, modalId]
    );
  };

  const calculateRoute = async (isSustainable: boolean) => {
    if (!origin || !destination || selectedModals.length === 0) {
      setError('Por favor, preencha origem, destino e selecione pelo menos um meio de transporte.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const routeData = await calculateMultimodalRoute(origin, destination, selectedModals);

      if (!routeData) {
        setError('Não foi possível calcular a rota. Verifique os endereços e tente novamente.');
        setLoading(false);
        return;
      }

      let totalTime = routeData.totalDuration;
      let totalDistance = routeData.totalDistance;

      if (isSustainable) {
        totalTime = totalTime * 1.15;
        const sustainableModals = selectedModals.filter(m => m === 'bike' || m === 'walking');
        if (sustainableModals.length === 0 && selectedModals.includes('bus')) {
          totalTime = totalTime * 1.05;
        }
      } else {
        if (selectedModals.includes('metro')) {
          totalTime = totalTime * 0.85;
        }
      }

      const estimatedCost = calculateEstimatedCost(totalDistance, selectedModals);

      const calculatedRoutes = [
        {
          modals: selectedModals,
          totalTime: Math.round(totalTime),
          totalDistance: parseFloat(totalDistance.toFixed(1)),
          estimatedCost: parseFloat(estimatedCost.toFixed(2)),
          isSustainable
        }
      ];

      setRoutes(calculatedRoutes);

      if (user) {
        await supabase.from('routes').insert([
          {
            user_id: user.id,
            origin,
            destination,
            modals: selectedModals,
            total_time: calculatedRoutes[0].totalTime,
            total_distance: calculatedRoutes[0].totalDistance,
            estimated_cost: calculatedRoutes[0].estimatedCost,
            is_sustainable: isSustainable
          }
        ]);
      }
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Ocorreu um erro ao calcular a rota. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Rotas Inteligentes</h1>
        <p className="text-gray-600 mb-8">Planeje sua viagem combinando múltiplos meios de transporte</p>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Origem</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
                placeholder="Ex: Avenida Paulista, São Paulo, SP"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Destino</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
                placeholder="Ex: Aeroporto de Guarulhos, São Paulo, SP"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4">Meios de Transporte</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {modals.map((modal) => {
                const Icon = modal.icon;
                const isSelected = selectedModals.includes(modal.id);
                return (
                  <button
                    key={modal.id}
                    onClick={() => toggleModal(modal.id)}
                    className={`p-4 rounded-xl border-2 transition ${
                      isSelected
                        ? 'border-[#1EB980] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${isSelected ? 'text-[#1EB980]' : modal.color}`} />
                    <span className="text-sm font-medium text-gray-700">{modal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => calculateRoute(false)}
              disabled={loading}
              className="flex-1 bg-[#007BFF] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0056b3] transition disabled:opacity-50"
            >
              {loading ? 'Calculando...' : 'Rota Mais Rápida'}
            </button>
            <button
              onClick={() => calculateRoute(true)}
              disabled={loading}
              className="flex-1 bg-[#1EB980] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#17a06d] transition disabled:opacity-50"
            >
              {loading ? 'Calculando...' : 'Mais Sustentável'}
            </button>
          </div>

          {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
            <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Para usar rotas reais do Google Maps, configure a variável de ambiente{' '}
                <code className="bg-blue-100 px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> no arquivo .env
              </p>
            </div>
          )}
        </div>

        {routes.length > 0 && (
          <div className="space-y-4">
            {routes.map((route, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {route.isSustainable ? 'Rota Sustentável' : 'Rota Rápida'}
                  </h3>
                  {route.isSustainable && (
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                      Eco-Friendly
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mb-6">
                  {route.modals.map((modalId: Modal, idx: number) => {
                    const modal = modals.find(m => m.id === modalId);
                    if (!modal) return null;
                    const Icon = modal.icon;
                    return (
                      <div key={idx} className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                        <Icon className={`h-5 w-5 ${modal.color} mr-2`} />
                        <span className="text-sm font-medium text-gray-700">{modal.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Clock className="h-6 w-6 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{route.totalTime} min</div>
                    <div className="text-sm text-gray-600">Tempo Total</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <MapPin className="h-6 w-6 text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{route.totalDistance} km</div>
                    <div className="text-sm text-gray-600">Distância</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <DollarSign className="h-6 w-6 text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">R$ {route.estimatedCost.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Custo Estimado</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
