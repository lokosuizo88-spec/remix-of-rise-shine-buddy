import { useLibrary } from '@/hooks/useLibrary';
import BookCard from '@/components/BookCard';
import BottomNav from '@/components/BottomNav';
import { Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const { favorites, toggleFavorite, darkMode } = useLibrary();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-safe-top">
          <div className="flex items-center gap-3 py-3">
            <Heart size={22} className="text-red-500" fill="currentColor" />
            <h1 className="font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Favoritos</h1>
            <span className="ml-auto text-sm text-muted-foreground">{favorites.length} libros</span>
          </div>
        </div>

        <div className="px-4 py-4">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Heart size={60} className="text-muted-foreground/20 mb-4" />
              <h2 className="text-lg font-semibold mb-2">Sin favoritos aún</h2>
              <p className="text-sm text-muted-foreground mb-6">Marca libros como favoritos desde tu biblioteca</p>
              <button onClick={() => navigate('/search')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium">
                <Search size={16} /> Buscar libros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {favorites.map(book => (
                <BookCard key={book.id} book={book} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
