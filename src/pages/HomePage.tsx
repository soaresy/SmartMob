import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Route, Clock, Leaf, BarChart3, Send } from 'lucide-react';

export default function HomePage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const features = [
    {
      icon: Route,
      title: 'Rotas Inteligentes',
      description: 'Planeje suas viagens combinando múltiplos meios de transporte para encontrar a rota mais rápida ou mais sustentável.',
      link: '/routes',
      color: 'from-[#1EB980] to-[#17a06d]'
    },
    {
      icon: Clock,
      title: 'Informações em Tempo Real',
      description: 'Acompanhe o status do transporte público em tempo real e favorite suas linhas preferidas.',
      link: '/real-time',
      color: 'from-[#007BFF] to-[#0056b3]'
    },
    {
      icon: Leaf,
      title: 'Cálculo de Emissões',
      description: 'Calcule e entenda o impacto ambiental das suas escolhas de transporte e veja quanto CO₂ você está evitando.',
      link: '/emissions',
      color: 'from-[#28a745] to-[#1e7e34]'
    },
    {
      icon: BarChart3,
      title: 'Dashboard Urbano',
      description: 'Visualize dados agregados de mobilidade urbana para auxiliar no planejamento e tomada de decisões.',
      link: '/dashboard',
      color: 'from-[#6f42c1] to-[#5a32a3]'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen">
      <section
        className="relative h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1920)'
        }}
      >
        <div className="text-center text-white px-4">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            Mobilidade Urbana,
            <br />
            <span className="text-[#1EB980]">Reinventada.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Transforme a forma como você se desloca pela cidade com tecnologia inteligente e sustentável
          </p>
          <Link
            to="/routes"
            className="inline-block bg-[#1EB980] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#17a06d] transition shadow-lg"
          >
            Começar Agora
          </Link>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Funcionalidades
            </h2>
            <div className="w-24 h-1 bg-[#1EB980] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Entre em Contato
            </h2>
            <div className="w-24 h-1 bg-[#1EB980] mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">
              Tem dúvidas ou sugestões? Adoraríamos ouvir você!
            </p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Mensagem Enviada!
              </h3>
              <p className="text-green-600">
                Obrigado pelo contato. Responderemos em breve.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none transition"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none transition"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1EB980] focus:outline-none transition resize-none"
                    placeholder="Como podemos ajudar?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#1EB980] to-[#17a06d] text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <span>Enviar Mensagem</span>
                  <Send className="h-5 w-5" />
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <p className="text-gray-600">
                  Ou envie um e-mail para:{' '}
                  <a href="mailto:contato@smartmob.com.br" className="text-[#1EB980] font-semibold hover:underline">
                    contato@smartmob.com.br
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
