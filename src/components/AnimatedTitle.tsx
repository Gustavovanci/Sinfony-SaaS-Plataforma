import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Define os tipos das propriedades que o componente vai receber
interface AnimatedTitleProps {
  children: React.ReactNode;
}

const AnimatedTitle = ({ children }: AnimatedTitleProps) => {
  const ref = useRef<HTMLHeadingElement>(null);

  // Hook do Framer Motion para rastrear a posição de scroll do elemento
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'], // Começa a animação quando o topo do elemento entra na tela
  });

  // Transforma o progresso do scroll (0 a 1) em valores de escala e opacidade
  // O texto começará com 80% do tamanho e 0% de opacidade
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    // Usa o motion.h3 para poder aplicar os valores de animação
    <motion.h3
      ref={ref}
      style={{ scale, opacity }}
      className="text-4xl font-bold text-center mb-16"
    >
      {children}
    </motion.h3>
  );
};

export default AnimatedTitle;