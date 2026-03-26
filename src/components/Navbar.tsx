import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface NavbarProps {
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="relative w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white -translate-y-1/2"></div>
              <div className="w-3 h-3 bg-white rounded-full border-2 border-gray-300 z-10"></div>
            </div>
            <span className="font-bold text-2xl text-gray-800 tracking-tight">Pokédex Pro</span>
          </div>
          
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-white/40 rounded-full leading-5 bg-white/60 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300 sm:text-sm shadow-inner"
                placeholder="Buscar Pokémon..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
