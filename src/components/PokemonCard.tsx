import { useEffect, useState, useCallback } from 'react';
import { fetchPokemonDetails, typeTranslations } from '../api/pokeApi';
import { motion } from 'framer-motion';

interface PokemonCardProps {
  name: string;
  onClick: (id: string) => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ name, onClick }) => {
  const [details, setDetails] = useState<any>(null);
  const [hasError, setHasError] = useState(false);

  const loadData = useCallback(() => {
    setHasError(false);
    fetchPokemonDetails(name)
      .then(setDetails)
      .catch((err) => {
        console.error("Erro no card do", name, err);
        setHasError(true);
      });
  }, [name]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (hasError) {
    return (
      <div className="glass rounded-3xl p-5 flex flex-col items-center justify-center h-64 border border-red-300">
        <span className="text-gray-500 font-bold capitalize mb-2">{name}</span>
        <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-600 rounded-full shadow-sm text-center">API Limitada</span>
        <button 
          onClick={(e) => { e.stopPropagation(); loadData(); }} 
          className="mt-4 text-xs font-bold bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 active:scale-95 transition-all shadow-md cursor-pointer relative z-20"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="glass rounded-3xl p-4 flex flex-col items-center justify-center h-64 animate-pulse relative overflow-hidden">
        <div className="absolute top-2 right-4 w-12 h-8 bg-white/20 rounded-md"></div>
        <div className="w-32 h-32 bg-white/30 rounded-full mb-4 mt-6"></div>
        <div className="h-6 bg-white/30 rounded w-24 mb-3"></div>
        <div className="flex gap-2">
          <div className="w-16 h-6 bg-white/30 rounded-full"></div>
          <div className="w-16 h-6 bg-white/30 rounded-full"></div>
        </div>
      </div>
    );
  }

  const mainType = details.types?.[0]?.type?.name || 'normal';
  const imageUrl = details.sprites?.other?.['official-artwork']?.front_default || details.sprites?.front_default || '';

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(details.name)}
      className={`relative cursor-pointer rounded-3xl p-5 overflow-hidden shadow-lg transition-colors duration-300 bg-type-${mainType} backdrop-blur-sm border border-white/20`}
    >
      <div className="absolute -top-4 -right-4 text-white/20 font-black text-7xl z-0 pointer-events-none rotate-12">
        #{String(details.id).padStart(3, '0')}
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        {imageUrl ? (
          <motion.img 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={imageUrl} 
            alt={details.name} 
            className="w-36 h-36 object-contain filter drop-shadow-xl"
            loading="lazy"
          />
        ) : (
          <div className="w-36 h-36 flex items-center justify-center bg-white/10 rounded-full mb-4">
             <span className="text-white/50 text-xs">Sem Imagem</span>
          </div>
        )}

        <h3 className="mt-4 text-2xl font-black text-white capitalize drop-shadow-sm tracking-wide">{details.name}</h3>
        <div className="flex gap-2 mt-3">
          {details.types?.map((t: any) => (
            <span 
              key={t.type.name}
              className="px-4 py-1 bg-white/25 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-sm border border-white/30 lowercase"
            >
              {typeTranslations[t.type.name] || t.type.name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
