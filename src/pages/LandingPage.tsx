import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, BarChart3, Award, ArrowRight } from 'lucide-react';
import AnimatedTitle from '../components/AnimatedTitle'; // ✅ IMPORTA O NOVO COMPONENTE

const LandingPage = () => {
  // Animação para o nome "Sinfony" (sem alterações)
  const sinfonyAnimation = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.5, staggerChildren: 0.1 } },
  };

  const letterAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } },
  };
  
  // Animação para os cards de funcionalidades (sem alterações)
  const fadeInOnScroll = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: 'easeOut' },
  };

  return (
    <div className="bg-gray-900 text-white font-sans antialiased">
      {/* Header (sem alterações) */}
      <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sinfony</h1>
          <Link to="/login" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Acessar Plataforma
          </Link>
        </div>
      </header>

      <main>
        {/* Seção Herói (sem alterações) */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
          <motion.h2
            className="text-6xl md:text-8xl font-black tracking-tighter"
            variants={sinfonyAnimation}
            initial="hidden"
            animate="visible"
          >
            {'Sinfony'.split('').map((char, index) => (
              <motion.span key={index} variants={letterAnimation} className="inline-block">
                {char}
              </motion.span>
            ))}
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-gray-400 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            A plataforma inteligente que orquestra o desenvolvimento contínuo da sua equipe de saúde.
          </motion.p>
        </section>

        {/* Storytelling - O Desafio */}
        <section className="py-24 bg-gray-800">
          <div className="container mx-auto px-6 max-w-3xl">
            {/* ✅ USA O NOVO COMPONENTE ANIMADO */}
            <AnimatedTitle>O desafio do treinamento hospitalar é complexo.</AnimatedTitle>
            <motion.p {...fadeInOnScroll} className="text-lg text-gray-400 mt-4 text-center">
              Manter equipes atualizadas, medir o progresso real e garantir a conformidade consome tempo e recursos valiosos que poderiam ser dedicados aos pacientes.
            </motion.p>
          </div>
        </section>
        
        {/* Storytelling - A Solução */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            {/* ✅ USA O NOVO COMPONENTE ANIMADO */}
            <AnimatedTitle>A Solução é uma Sinfonia de Inteligência e Simplicidade.</AnimatedTitle>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div {...fadeInOnScroll} className="p-8 bg-gray-800 rounded-xl border border-gray-700">
                <ShieldCheck className="h-10 w-10 text-blue-500" />
                <h4 className="font-semibold text-2xl mt-4">Treinamentos Sob Medida</h4>
                <p className="text-gray-400 mt-2">Crie e distribua módulos interativos com vídeos, textos e quizzes, garantindo que o conhecimento seja absorvido de forma eficaz.</p>
              </motion.div>
              <motion.div {...fadeInOnScroll} transition={{ ...fadeInOnScroll.transition, delay: 0.2 }} className="p-8 bg-gray-800 rounded-xl border border-gray-700">
                <BarChart3 className="h-10 w-10 text-green-500" />
                <h4 className="font-semibold text-2xl mt-4">Insights que Geram Ação</h4>
                <p className="text-gray-400 mt-2">Nossa plataforma gera insights sobre o desempenho da equipe, identificando pontos fortes e oportunidades de melhoria para os coordenadores.</p>
              </motion.div>
              <motion.div {...fadeInOnScroll} transition={{ ...fadeInOnScroll.transition, delay: 0.4 }} className="p-8 bg-gray-800 rounded-xl border border-gray-700">
                <Award className="h-10 w-10 text-yellow-500" />
                <h4 className="font-semibold text-2xl mt-4">Desenvolvimento Contínuo</h4>
                <p className="text-gray-400 mt-2">Incentive o engajamento com gamificação e emita certificados, criando um ciclo de desenvolvimento que eleva o padrão de cuidado.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-gray-800">
          <div className="container mx-auto px-6 py-24 text-center">
            {/* ✅ USA O NOVO COMPONENTE ANIMADO */}
            <AnimatedTitle>Treinamentos específicos para minimizar riscos e maximizar resultados.</AnimatedTitle>
            <motion.div {...fadeInOnScroll}>
              <Link to="/login" className="mt-8 inline-flex items-center px-10 py-4 bg-blue-600 text-white font-bold rounded-full text-lg hover:bg-blue-700 transition-transform hover:scale-105">
                Começar a Transformação
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer (sem alterações) */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-6 py-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Sinfony. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;