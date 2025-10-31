import { NavLink } from 'react-router-dom';
import { Home, Route, Clock, Leaf, BarChart3, User } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/routes', icon: Route, label: 'Rotas' },
    { path: '/real-time', icon: Clock, label: 'Tempo Real' },
    { path: '/emissions', icon: Leaf, label: 'Emissões' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Leaf className="h-8 w-8 text-[#1EB980]" />
          <span className="text-2xl font-bold text-gray-900">SmartMob</span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#1EB980] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2025 SmartMob
          <br />
          Mobilidade Sustentável
        </p>
      </div>
    </aside>
  );
}
