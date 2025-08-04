import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  BookOpen,
  Video,
  Award, 
  BarChart3,
  CheckCircle,
  Users,
  Star,
  TrendingUp,
} from 'lucide-react';

// Dados das funcionalidades para a seção de Scrollytelling
const featuresData = [
  {
    icon: Video,
    title: "Módulos Interativos",
    description: "Treinamentos com vídeos, textos, imagens e quizzes para fixação do conhecimento.",
    features: ["Vídeos educativos", "Textos explicativos", "Quizzes avaliativos"],
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Award,
    title: "Sistema de Certificados",
    description: "Certificados automáticos gerados ao completar os treinamentos.",
    features: ["Certificados em PDF", "Validação automática", "Histórico completo"],
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: BarChart3,
    title: "Acompanhamento de Progresso",
    description: "Visualize o progresso individual e da equipe em tempo real.",
    features: ["Progresso por módulo", "Dashboard de equipe", "Relatórios detalhados"],
    gradient: "from-green-500 to-emerald-500"
  }
];

// Componente para renderizar cada passo de texto na seção de scrollytelling
const FeatureText = ({ feature, isActive }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: isActive ? 1 : 0.3 }}
    transition={{ duration: 0.5 }}
    className="h-screen flex flex-col justify-center"
  >
    <h3 className="text-4xl font-bold text-white mb-4">{feature.title}</h3>
    <p className="text-xl text-gray-300 mb-6 leading-relaxed max-w-lg">{feature.description}</p>
    <div className="space-y-3">
      {feature.features.map((item, i) => (
        <div key={i} className="flex items-center text-gray-200">
          <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  </motion.div>
);


// COMPONENTE PRINCIPAL DA LANDING PAGE
const LandingPage = () => {
  const pageContainerRef = useRef(null);
  
  // Hook de scroll para a página inteira (usado no header e título do hero)
  const { scrollYProgress: pageScrollYProgress } = useScroll({ 
    target: pageContainerRef,
    offset: ["start start", "end start"]
  });
  
  const headerY = useTransform(pageScrollYProgress, [0, 0.05], [0, -100]);
  const titleScale = useTransform(pageScrollYProgress, [0, 0.5], [1, 0.8]);

  //--- Lógica da Seção Scrollytelling ---//
  const featuresRef = useRef(null);
  const { scrollYProgress: featuresScrollYProgress } = useScroll({
    target: featuresRef,
    offset: ["start start", "end end"]
  });

  const activeIndex = useTransform(featuresScrollYProgress, [0, 1], [0, featuresData.length - 0.001]);
  //--- Fim da Lógica da Seção Scrollytelling ---//


  // --- Sub-componentes da Página --- //

  const Header = () => (
    <motion.header
      style={{ y: headerY }}
      className="fixed top-0 left-0 w-full bg-slate-900/90 backdrop-blur-md z-50 border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Sinfony</span>
        </div>
        <Link to="/login">
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
            Acessar Plataforma
          </button>
        </Link>
      </div>
    </motion.header>
  );

  const HeroSection = () => (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <motion.h1
          style={{ scale: titleScale }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-7xl md:text-9xl font-black mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
        >
          SINFONY
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Plataforma de treinamento hospitalar com 
          <span className="text-blue-400 font-semibold"> módulos interativos, certificados e acompanhamento de progresso</span>
        </motion.p>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="flex justify-center"
        >
          <Link to="/login">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Acessar Plataforma
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
  
  const BenefitsSection = () => (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Benefícios da <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">Plataforma</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'Gamificação', description: 'Sistema de pontos e badges', icon: Star },
            { title: 'Multi-usuário', description: 'Gestão de equipes completa', icon: Users },
            { title: 'Certificados', description: 'Geração automática em PDF', icon: Award },
            { title: 'Progresso', description: 'Acompanhamento em tempo real', icon: TrendingUp }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="text-center group bg-slate-800/50 p-6 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-300 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const FinalCTASection = () => (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Experimente a<br />
            <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">Plataforma</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Acesse agora e descubra como nossos treinamentos podem transformar sua equipe
          </p>
          <Link to="/login">
            <button className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Acessar Plataforma
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer className="bg-slate-900 border-t border-slate-800 py-8">
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Sinfony</span>
        </div>
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Sinfony. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );


  // --- Renderização Principal da Página --- //
  return (
    <div ref={pageContainerRef} className="bg-slate-900 overflow-x-hidden relative">
      <Header />
      <HeroSection />
      
      {/* --- SEÇÃO DE FUNCIONALIDADES (SCROLLYTELLING) --- */}
      <div className="bg-slate-800 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl font-bold text-white mb-4">
            Funcionalidades <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">Essenciais</span>
          </h2>
          <p className="text-xl text-gray-300">Tudo que você precisa para treinamentos eficazes, de forma interativa.</p>
        </motion.div>
      </div>
      
      <section ref={featuresRef} className="relative bg-slate-800" style={{ height: `${featuresData.length * 100}vh` }}>
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Coluna da Esquerda (Visual Fixo e Animado) */}
            <div className="w-full h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                {featuresData.map((feature, index) => {
                  const isActive = Math.floor(activeIndex.get()) === index;
                  if (!isActive) return null;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.5 }}
                      className="absolute w-64 h-64 flex items-center justify-center"
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center shadow-2xl`}>
                        <feature.icon className="w-24 h-24 text-white" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Coluna da Direita (Texto que Rola) */}
            <div className="w-full h-full">
              {featuresData.map((feature, index) => {
                const isActive = Math.floor(activeIndex.get()) === index;
                return <FeatureText key={index} feature={feature} isActive={isActive} />;
              })}
            </div>

          </div>
        </div>
      </section>
      {/* --- FIM DA SEÇÃO DE FUNCIONALIDADES --- */}

      <BenefitsSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;