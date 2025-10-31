import { useState } from 'react';
import { Leaf, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function EmissionsPage() {
  const { user } = useAuth();
  const [distance, setDistance] = useState('');
  const [mode, setMode] = useState('bus');
  const [result, setResult] = useState<any>(null);

  const modes = [
    { id: 'bus', label: 'Ônibus', factor: 0.089 },
    { id: 'metro', label: 'Metrô', factor: 0.041 },
    { id: 'bike', label: 'Bicicleta', factor: 0 },
    { id: 'walking', label: 'Caminhada', factor: 0 },
    { id: 'car', label: 'Carro', factor: 0.192 },
  ];

  const calculateEmissions = async () => {
    const dist = parseFloat(distance);
    if (isNaN(dist)) return;

    const selectedMode = modes.find(m => m.id === mode);
    if (!selectedMode) return;

    const co2Generated = dist * selectedMode.factor;
    const carEmissions = dist * 0.192;
    const co2Avoided = Math.max(0, carEmissions - co2Generated);

    setResult({
      co2Generated: co2Generated.toFixed(2),
      co2Avoided: co2Avoided.toFixed(2)
    });

    if (user) {
      await supabase.from('emissions_history').insert([
        {
          user_id: user.id,
          distance: dist,
          transport_mode: mode,
          co2_generated: co2Generated,
          co2_avoided: co2Avoided
        }
      ]);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Calculadora de Emissões</h1>
        <p className="text-gray-600 mb-8">Entenda o impacto ambiental das suas escolhas de mobilidade</p>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Distância (km)</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
                placeholder="Ex: 10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Meio de Transporte</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
              >
                {modes.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={calculateEmissions}
            className="w-full bg-[#1EB980] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#17a06d] transition"
          >
            Calcular
          </button>
        </div>

        {result && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-200">
              <Leaf className="h-12 w-12 text-red-600 mb-4" />
              <div className="text-4xl font-bold text-red-600 mb-2">{result.co2Generated} kg</div>
              <div className="text-gray-700">CO₂ Gerado</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border-2 border-green-200">
              <TrendingDown className="h-12 w-12 text-green-600 mb-4" />
              <div className="text-4xl font-bold text-green-600 mb-2">{result.co2Avoided} kg</div>
              <div className="text-gray-700">CO₂ Evitado vs. Carro</div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Comparação por Modal</h3>
            <div className="space-y-4">
              {modes.map(m => {
                const emissions = parseFloat(distance) * m.factor;
                const maxEmissions = parseFloat(distance) * 0.192;
                const percentage = maxEmissions > 0 ? (emissions / maxEmissions) * 100 : 0;

                return (
                  <div key={m.id}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-700">{m.label}</span>
                      <span className="font-bold text-gray-900">{emissions.toFixed(2)} kg CO₂</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1EB980] to-[#17a06d]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
