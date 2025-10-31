import { useState, useEffect } from 'react';
import { LogOut, Leaf, Route, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { user, profile, signIn, signUp, signOut, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCO2: 0, totalRoutes: 0 });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    const { data: routesData } = await supabase
      .from('routes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: emissionsData } = await supabase
      .from('emissions_history')
      .select('co2_avoided')
      .eq('user_id', user.id);

    if (routesData) setRoutes(routesData);
    if (emissionsData) {
      const totalCO2 = emissionsData.reduce((sum, item) => sum + parseFloat(item.co2_avoided), 0);
      setStats({ totalCO2, totalRoutes: routesData?.length || 0 });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      if (error) setError('E-mail ou senha incorretos');
    } else {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      if (error) setError('Erro ao criar conta');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </h1>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-red-700 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1EB980] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#17a06d] transition"
              >
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </button>
            </form>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full mt-4 text-[#1EB980] hover:underline"
            >
              {isLogin ? 'Criar uma conta' : 'Já tenho uma conta'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Olá, {profile?.full_name || 'Usuário'}!</h1>
            <p className="text-gray-600">{profile?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-lg">
            <Leaf className="h-12 w-12 mb-4" />
            <div className="text-4xl font-bold mb-2">{stats.totalCO2.toFixed(1)} kg</div>
            <div className="text-green-100">Total de CO₂ Evitado</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
            <Route className="h-12 w-12 mb-4" />
            <div className="text-4xl font-bold mb-2">{stats.totalRoutes}</div>
            <div className="text-blue-100">Rotas Salvas</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Rotas</h2>
          {routes.length > 0 ? (
            <div className="space-y-4">
              {routes.map((route) => (
                <div key={route.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-6 w-6 text-[#1EB980]" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {route.origin} → {route.destination}
                      </div>
                      <div className="text-sm text-gray-600">
                        {route.total_time} min • {route.total_distance} km • R$ {route.estimated_cost}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(route.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Nenhuma rota salva ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}
