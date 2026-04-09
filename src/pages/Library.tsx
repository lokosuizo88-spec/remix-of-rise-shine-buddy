import { useState } from 'react';
import { useLibrary } from '@/hooks/useLibrary';
import BookCard from '@/components/BookCard';
import BottomNav from '@/components/BottomNav';
import { BookOpen, Search, Plus, Clock, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookCategory } from '@/types/book';

const CATEGORIES: { value: BookCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'fiction', label: 'Ficción' },
  { value: 'non-fiction', label: 'No ficción' },
  { value: 'science', label: 'Ciencia' },
  { value: 'history', label: 'Historia' },
  { value: 'philosophy', label: 'Filosofía' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'biography', label: 'Biografía' },
  { value: 'children', label: 'Infantil' },
  { value: 'art', label: 'Arte' },
  { value: 'other', label: 'Otros' },
];

export default function Library() {
  const { books, toggleFavorite, darkMode } = useLibrary();
  const [category, setCategory] = useState<BookCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'reading' | 'favorites'>('all');
  const navigate = useNavigate();

  const filtered = books.filter(b => {
    if (tab === 'reading') return b.readingProgress > 0 && b.readingProgress < 100;
    if (tab === 'favorites') return b.isFavorite;
    if (category !== 'all' && b.category !== category) return false;
    if (query && !b.title.toLowerCase().includes(query.toLowerCase()) && !b.author.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-safe-top">
          <div className="flex items-center justify-between py-3">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>BookVerse</h1>
              <p className="text-xs text-muted-foreground">{books.length} libros en tu biblioteca</p>
            </div>
            <button onClick={() => navigate('/search')} className="p-2 rounded-full bg-primary/10 text-primary">
              <Search size={20} />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar en tu biblioteca..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            {[['all', 'Biblioteca'], ['reading', 'Leyendo'], ['favorites', 'Favoritos']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTab(val as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${tab === val ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category filter (only in 'all' tab) */}
          {tab === 'all' && (
            <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${category === c.value ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-muted text-muted-foreground'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen size={60} className="text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-semibold mb-2">Tu biblioteca está vacía</h2>
              <p className="text-sm text-muted-foreground mb-6">Busca libros online o sube tus propios PDFs y EPUBs</p>
              <div className="flex gap-3">
                <button onClick={() => navigate('/search')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium">
                  <Search size={16} /> Buscar libros
                </button>
                <button onClick={() => navigate('/upload')} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-medium">
                  <Plus size={16} /> Subir libro
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">No hay libros que coincidan</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map(book => (
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
