import { useState, useEffect } from 'react';
import { Bus, Train, Star, Bell, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, TransportLine } from '../lib/supabase';
import { getUserLocation, UserLocation } from '../services/userLocation';

export default function RealTimePage() {
  const { user } = useAuth();
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    fetchLines();
    if (user) {
      fetchUserLocation();
    }
  }, [user]);

  const fetchLines = async () => {
    const { data } = await supabase
      .from('transport_lines')
      .select('*')
      .order('name');

    if (data) setLines(data);
  };

  const fetchUserLocation = async () => {
    if (!user) return;
    const location = await getUserLocation(user.id);
    setUserLocation(location);
  };

  const toggleFavorite = async (lineId: string) => {
    if (!user) return;

    const line = lines.find(l => l.id === lineId);
    if (!line) return;

    const isFavorited = line.favorited_by.includes(user.id);
    const newFavorites = isFavorited
      ? line.favorited_by.filter(id => id !== user.id)
      : [...line.favorited_by, user.id];

    await supabase
      .from('transport_lines')
      .update({ favorited_by: newFavorites })
      .eq('id', lineId);

    fetchLines();
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tempo Real</h1>
        <p className="text-gray-600 mb-8">Acompanhe o status do transporte público em tempo real</p>

        {userLocation && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Sua Localização</p>
              <p className="text-sm text-blue-700">{userLocation.address}, {userLocation.city} - {userLocation.state}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Linha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Próxima Chegada</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lines.map((line) => {
                const Icon = line.type === 'bus' ? Bus : Train;
                const isFavorited = user && line.favorited_by.includes(user.id);

                return (
                  <tr key={line.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-6 w-6 ${line.type === 'bus' ? 'text-orange-600' : 'text-blue-600'}`} />
                        <span className="font-medium text-gray-900">{line.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        line.status === 'on_time'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {line.status === 'on_time' ? 'No horário' : 'Atrasado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{line.next_arrival}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleFavorite(line.id)}
                          className={`p-2 rounded-lg transition ${
                            isFavorited ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:text-yellow-600'
                          }`}
                        >
                          <Star className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                          <Bell className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
