import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAllSources, getGutenbergBooks } from '@/lib/bookApi';
import { useLibrary } from '@/hooks/useLibrary';
import { SearchResult } from '@/types/book';
import BottomNav from '@/components/BottomNav';
import { Search as SearchIcon, ArrowLeft, BookOpen, Plus, Check, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Search() {
  const navigate = useNavigate();
  const { addBook, bookAlreadyInLibrary, darkMode } = useLibrary();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'search' | 'free'>('search');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await searchAllSources(q);
      setResults(res);
    } catch {
      toast({ title: 'Error al buscar', description: 'Comprueba tu conexión a internet', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadFree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGutenbergBooks();
      setResults(res);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los libros gratuitos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleAddBook = (result: SearchResult) => {
    if (addedIds.has(result.id)) return;
    addBook({
      title: result.title,
      author: result.author,
      cover: result.cover,
      year: result.year,
      description: result.description,
      pages: result.pages,
      format: 'online',
      category: 'other',
      openLibraryKey: result.openLibraryKey,
      googleBooksId: result.googleBooksId,
      downloadUrl: result.downloadUrl,
    });
    setAddedIds(prev => new Set([...prev, result.id]));
    toast({ title: '¡Añadido!', description: `"${result.title}" está en tu biblioteca` });
  };

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-safe-top">
          <div className="flex items-center gap-3 py-3">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg flex-1" style={{ fontFamily: 'Playfair Display, serif' }}>Buscar Libros</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => { setTab('search'); setResults([]); }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === 'search' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
            >
              Buscar
            </button>
            <button
              onClick={() => { setTab('free'); loadFree(); }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === 'free' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
            >
              Libros Gratuitos
            </button>
          </div>

          {tab === 'search' && (
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
                  placeholder="Título, autor o ISBN..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
              <button
                onClick={() => handleSearch(query)}
                disabled={loading || !query.trim()}
                className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="px-4 py-4">
          {loading && (
            <div className="flex flex-col items-center py-16 gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Buscando libros...</p>
            </div>
          )}

          {!loading && results.length === 0 && tab === 'search' && (
            <div className="text-center py-16 text-muted-foreground">
              <SearchIcon size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Busca libros por título, autor o ISBN</p>
              <p className="text-xs mt-1 opacity-70">Usamos Open Library y Google Books</p>
            </div>
          )}

          <div className="space-y-3">
            {results.map(result => {
              const inLibrary = bookAlreadyInLibrary(result.title, result.author) || addedIds.has(result.id);
              return (
                <div key={result.id} className="flex gap-3 p-3 rounded-xl bg-card border border-border">
                  <div className="flex-shrink-0 w-14">
                    {result.cover ? (
                      <img src={result.cover} alt={result.title} className="w-14 h-20 object-cover rounded-md book-cover" />
                    ) : (
                      <div className="w-14 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-md flex items-center justify-center">
                        <BookOpen size={18} className="text-primary/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-2 leading-tight">{result.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{result.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {result.year && <span className="text-[10px] text-muted-foreground">{result.year}</span>}
                      {result.pages && <span className="text-[10px] text-muted-foreground">{result.pages} págs.</span>}
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${result.source === 'openlibrary' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                        {result.source === 'openlibrary' ? 'Open Library' : 'Google Books'}
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">{result.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAddBook(result)}
                        disabled={inLibrary}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${inLibrary ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-primary text-white'}`}
                      >
                        {inLibrary ? <><Check size={12} /> Añadido</> : <><Plus size={12} /> Añadir</>}
                      </button>
                      {result.downloadUrl && (
                        <a
                          href={result.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/80"
                        >
                          <Download size={12} /> Descargar
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
