import { Leaf, Clock, Users, Route } from 'lucide-react';

export default function DashboardPage() {
  const kpis = [
    { icon: Leaf, label: 'Emissões Evitadas', value: '1,245 ton', color: 'from-green-500 to-green-600' },
    { icon: Clock, label: 'Tempo Médio de Viagem', value: '32 min', color: 'from-blue-500 to-blue-600' },
    { icon: Users, label: 'Usuários Ativos', value: '45,234', color: 'from-purple-500 to-purple-600' },
    { icon: Route, label: 'Rotas Calculadas', value: '128,456', color: 'from-orange-500 to-orange-600' },
  ];

  const popularRoutes = [
    { name: 'Centro → Shopping', count: 2345 },
    { name: 'Universidade → Terminal', count: 1890 },
    { name: 'Aeroporto → Centro', count: 1654 },
    { name: 'Estação → Hospital', count: 1432 },
  ];

  const modalDistribution = [
    { name: 'Ônibus', percentage: 35, color: 'bg-orange-500' },
    { name: 'Metrô', percentage: 28, color: 'bg-blue-500' },
    { name: 'Bicicleta', percentage: 18, color: 'bg-green-500' },
    { name: 'Caminhada', percentage: 12, color: 'bg-teal-500' },
    { name: 'Carona', percentage: 7, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Urbano</h1>
        <p className="text-gray-600 mb-8">Visualize dados agregados de mobilidade urbana</p>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                <div className="text-sm text-gray-600">{kpi.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rotas Mais Populares</h2>
            <div className="space-y-4">
              {popularRoutes.map((route, index) => {
                const maxCount = popularRoutes[0].count;
                const percentage = (route.count / maxCount) * 100;

                return (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">{route.name}</span>
                      <span className="font-bold text-gray-900">{route.count}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
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

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Distribuição de Modais</h2>
            <div className="space-y-4">
              {modalDistribution.map((modal, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700">{modal.name}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${modal.color} flex items-center justify-end pr-3`}
                        style={{ width: `${modal.percentage}%` }}
                      >
                        <span className="text-white text-sm font-bold">{modal.percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
