import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGutenbergBooks } from '@/lib/bookApi';
import { useLibrary } from '@/hooks/useLibrary';
import { SearchResult } from '@/types/book';
import BottomNav from '@/components/BottomNav';
import { Download, BookOpen, Loader2, Plus, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

export default function Downloads() {
  const { addBook, bookAlreadyInLibrary, darkMode } = useLibrary();
  const { toast } = useToast();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const { data: freeBooks = [], isLoading } = useQuery({
    queryKey: ['gutenberg-books'],
    queryFn: getGutenbergBooks,
    staleTime: 1000 * 60 * 5,
  });

  const handleAdd = (result: SearchResult) => {
    if (addedIds.has(result.id)) return;
    addBook({
      title: result.title,
      author: result.author,
      cover: result.cover,
      format: 'online',
      category: 'other',
      downloadUrl: result.downloadUrl,
    });
    setAddedIds(prev => new Set([...prev, result.id]));
    toast({ title: '¡Añadido!', description: `"${result.title}" está en tu biblioteca` });
  };

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-safe-top">
          <div className="py-3">
            <div className="flex items-center gap-2 mb-1">
              <Download size={22} className="text-primary" />
              <h1 className="font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Libros Gratuitos</h1>
            </div>
            <p className="text-xs text-muted-foreground">Libros de dominio público de Project Gutenberg y Open Library</p>
          </div>
        </div>

        <div className="px-4 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando libros gratuitos...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {freeBooks.map(book => {
                const inLibrary = bookAlreadyInLibrary(book.title, book.author) || addedIds.has(book.id);
                return (
                  <div key={book.id} className="flex gap-3 p-3 rounded-xl bg-card border border-border">
                    {book.cover ? (
                      <img src={book.cover} alt={book.title} className="w-14 h-20 object-cover rounded-md flex-shrink-0 book-cover" />
                    ) : (
                      <div className="w-14 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-md flex items-center justify-center flex-shrink-0">
                        <BookOpen size={18} className="text-primary/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-2 leading-tight">{book.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
                      <div className="flex gap-1 mt-1">
                        {book.hasEpub && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">EPUB</span>}
                        {book.hasPdf && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">PDF</span>}
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">GRATIS</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAdd(book)}
                          disabled={inLibrary}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${inLibrary ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-primary text-white'}`}
                        >
                          {inLibrary ? <><Check size={12} /> Añadido</> : <><Plus size={12} /> Añadir</>}
                        </button>
                        {book.downloadUrl && (
                          <a href={book.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground">
                            <ExternalLink size={12} /> Abrir
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
