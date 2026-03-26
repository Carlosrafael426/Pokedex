import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PokemonCard } from './components/PokemonCard';
import { SkeletonCard } from './components/SkeletonCard';
import { PokemonDetailsModal } from './components/PokemonDetailsModal';
import { fetchPokemonList } from './api/pokeApi';

function App() {
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [allPokemon, setAllPokemon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const data = await fetchPokemonList(1000, 0);
      setAllPokemon(data.results || []);
      setPokemonList((data.results || []).slice(0, 20));
      setOffset(20);
    } catch (error) {
      console.error(error);
      localStorage.clear(); // Limpar cache corrompido em caso fatal
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    if (query) {
      const filtered = allPokemon.filter(p => p.name.includes(query.toLowerCase()));
      setPokemonList(filtered.slice(0, 20));
      setOffset(20); 
    } else {
      setPokemonList(allPokemon.slice(0, 20));
      setOffset(20);
    }
  }, [query, allPokemon]);

  const loadMore = useCallback(() => {
    if (loading) return;
    const currentList = query 
      ? allPokemon.filter(p => p.name.includes(query.toLowerCase()))
      : allPokemon;
      
    if (offset >= currentList.length) return;
    
    // Slight artificial delay to show loading elegantly if needed
    const nextBatch = currentList.slice(offset, offset + 20);
    setPokemonList(prev => [...prev, ...nextBatch]);
    setOffset(prev => prev + 20);
  }, [loading, offset, allPokemon, query]);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we are at bottom
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      <Navbar onSearch={setQuery} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading && pokemonList.length === 0 ? (
            Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)
          ) : (
            pokemonList.map((p) => (
              <PokemonCard key={p.name} name={p.name} onClick={() => setSelectedPokemon(p.name)} />
            ))
          )}
        </div>
        
        {pokemonList.length === 0 && !loading && (
          <div 
            className="text-center py-24 text-gray-500 text-xl font-bold bg-white rounded-3xl mt-8 shadow-sm cursor-pointer hover:scale-[1.01] hover:shadow-md transition-all select-none"
            onClick={() => window.location.reload()}
          >
            Nenhuma informação encontrada! 🕵️‍♂️<br/>
            <span className="text-sm font-medium text-gray-400 mt-2 block">Clique aqui para atualizar a página e tentar reconectar.</span>
          </div>
        )}
      </main>

      {selectedPokemon && (
        <PokemonDetailsModal 
          pokemonName={selectedPokemon} 
          onClose={() => setSelectedPokemon(null)} 
        />
      )}
    </div>
  );
}

export default App;
