import { useEffect, useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Weight, ShieldAlert } from 'lucide-react';
import { fetchPokemonDetails, fetchPokemonSpecies, fetchEvolutionChain, translateToPT, typeTranslations, statTranslations } from '../api/pokeApi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface PokemonDetailsModalProps {
  pokemonName: string;
  onClose: () => void;
}

export const PokemonDetailsModal: React.FC<PokemonDetailsModalProps> = ({ pokemonName, onClose }) => {
  const [details, setDetails] = useState<any>(null);
  const [evolution, setEvolution] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('sobre');
  const [description, setDescription] = useState<string>('Carregando descrição...');
  const [translatedAbilities, setTranslatedAbilities] = useState<string[]>([]);

  useEffect(() => {
    // Disable body scroll when modal opens
    document.body.style.overflow = 'hidden';
    
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchPokemonDetails(pokemonName);
        if (!isMounted) return;
        setDetails(data);
        
        // Traduzir Habilidades em background de forma isolada
        Promise.all(
          data.abilities.map((a: any) => translateToPT(a.ability.name.replace('-', ' ')))
        ).then(abs => { if (isMounted) setTranslatedAbilities(abs); }).catch(console.error);

        // Buscar Espécie
        const sp = await fetchPokemonSpecies(data.id);
        if (!isMounted) return;

        // Traduzir Descrição isoladamente
        const enEntry = sp.flavor_text_entries?.find((f: any) => f.language.name === 'en');
        if (enEntry) {
          translateToPT(enEntry.flavor_text)
            .then(ptText => { if (isMounted) setDescription(ptText); })
            .catch(console.error);
        } else {
          setDescription('Nenhuma descrição disponível.');
        }

        // Buscar Evolução garantidamente
        if (sp.evolution_chain?.url) {
          const evo = await fetchEvolutionChain(sp.evolution_chain.url);
          if (isMounted) setEvolution(evo);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      document.body.style.overflow = 'unset';
    };
  }, [pokemonName]);

  if (!details) return null;

  const mainType = details.types?.[0]?.type?.name || 'normal';
  const imageUrl = details.sprites?.other?.['official-artwork']?.front_default || details.sprites?.front_default || '';
  const statsData = details.stats?.map((s: any) => ({
    name: statTranslations[s.stat.name.toUpperCase()] || s.stat.name.toUpperCase(),
    value: s.base_stat
  })) || [];

  const renderEvolutions = () => {
    if (!evolution) return <div className="animate-pulse h-10 w-full bg-gray-200 rounded-xl mt-10"></div>;
    const evos = [];
    let current = evolution.chain;
    while (current) {
      const idStr = current.species.url.split('/');
      const id = idStr[idStr.length - 2]; // e.g., "https://pokeapi.co/api/v2/pokemon-species/1/" -> "1"
      evos.push({
        name: current.species.name,
        img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      });
      current = current.evolves_to[0];
    }
    return (
      <div className="flex justify-around items-center w-full mt-8">
        {evos.map((e, idx) => (
          <Fragment key={e.name}>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center p-2 mb-3 shadow-inner">
                <img src={e.img} alt={e.name} className="w-full h-full object-contain filter drop-shadow-md hover:scale-110 transition-transform cursor-pointer" />
              </div>
              <span className="capitalize font-bold text-gray-700 tracking-wide">{e.name}</span>
            </div>
            {idx < evos.length - 1 && <div className="text-gray-300 font-black text-3xl mb-8">➔</div>}
          </Fragment>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          style={{ backgroundColor: `var(--color-type-${mainType}, #A8A77A)` }}
          className="w-full max-w-md max-h-[95vh] sm:max-h-[85vh] rounded-t-[3rem] sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Botão Fechar */}
          <button onClick={onClose} className="absolute top-5 right-5 sm:top-6 sm:right-6 text-white z-50 bg-black/10 p-2 rounded-full backdrop-blur-md hover:bg-black/20 transition cursor-pointer">
            <X size={24} />
          </button>
          
          {/* Header Colorido */}
          <div className="px-6 pt-8 sm:pt-10 pb-2 relative flex flex-col items-center">
            {/* Título e Tipos */}
            <div className="w-full flex justify-between items-start mb-2 sm:mb-6">
              <div className="flex-1">
                <h2 className="text-white text-3xl sm:text-4xl font-black capitalize tracking-wider drop-shadow-md">
                  {details.name}
                </h2>
                <div className="flex gap-2 mt-3">
                  {details.types.map((t: any) => (
                    <span key={t.type.name} className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-xs font-bold text-white lowercase shadow-sm border border-white/20">
                      {typeTranslations[t.type.name] || t.type.name}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* ID Pokémon */}
              <div className="text-white/60 text-xl sm:text-2xl font-black pt-1 pr-12 sm:pr-14">
                 #{String(details.id).padStart(3, '0')}
              </div>
            </div>
            
            {/* Imagem Puxada para baixo */}
            <motion.img 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              src={imageUrl} 
              alt={details.name} 
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain relative z-20 drop-shadow-2xl -mb-16 sm:-mb-24"
            />
          </div>
          
          {/* Container Branco Inferior */}
          <div className="bg-white flex-1 min-h-0 rounded-t-[3rem] px-6 sm:px-8 pt-20 sm:pt-28 pb-6 relative shadow-[0_-10px_20px_rgba(0,0,0,0.1)] flex flex-col z-10 w-full overflow-hidden">
            <div className="flex justify-between sm:justify-around border-b border-gray-100 pb-3 mb-5 relative z-30">
              {['sobre', 'status base', 'evolução'].map(tab => (
                <button 
                  key={tab}
                  className={`capitalize font-bold pb-2 transition-all duration-300 text-sm sm:text-base relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="underline" className="absolute left-0 right-0 bottom-0 h-1 bg-red-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 custom-scrollbar relative z-30 scroll-smooth overscroll-contain">
              {activeTab === 'sobre' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <p className="text-gray-600 leading-relaxed text-center px-2 font-medium">
                    {description}
                  </p>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6 grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="flex items-center gap-3">
                      <Ruler className="text-gray-400" size={20} />
                      <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Altura</div>
                        <div className="text-gray-800 font-semibold">{details.height / 10} m</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Weight className="text-gray-400" size={20} />
                      <div>
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Peso</div>
                        <div className="text-gray-800 font-semibold">{details.weight / 10} kg</div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-start gap-3 mt-2 pt-4 border-t border-gray-100">
                      <ShieldAlert className="text-gray-400 mt-1" size={20} />
                      <div className="w-full">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Habilidades</div>
                        <div className="text-gray-800 font-semibold lowercase flex flex-wrap gap-1.5">
                          {translatedAbilities.map((ab: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                              {ab}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'status base' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <XAxis type="number" domain={[0, 255]} hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11, fontWeight: 700}} width={50} />
                      <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={12}>
                        {statsData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.value > 85 ? '#4ade80' : entry.value > 50 ? '#facc15' : '#f87171'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {activeTab === 'evolução' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col justify-start">
                   <h4 className="text-gray-800 font-black text-lg mb-2">Cadeia de Evolução</h4>
                   {renderEvolutions()}
                </motion.div>
              )}
            </div>
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
