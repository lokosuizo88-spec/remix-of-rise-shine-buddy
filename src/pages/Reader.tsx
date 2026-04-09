import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/hooks/useLibrary';
import PDFReader from '@/components/PDFReader';
import EPUBReader from '@/components/EPUBReader';
import { ArrowLeft, Heart, Share2, Globe, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Reader() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { books, updateProgress, toggleFavorite, updateReaderSettings, readerSettings, updateBook } = useLibrary();
  const { toast } = useToast();
  const [showHeader, setShowHeader] = useState(true);
  const [headerTimeout, setHeaderTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const book = books.find(b => b.id === bookId);

  useEffect(() => {
    if (!book) return;
    // Auto-hide header after 3 seconds
    const t = setTimeout(() => setShowHeader(false), 3000);
    return () => clearTimeout(t);
  }, [book]);

  const handleTap = () => {
    setShowHeader(true);
    if (headerTimeout) clearTimeout(headerTimeout);
    const t = setTimeout(() => setShowHeader(false), 3000);
    setHeaderTimeout(t);
  };

  const handlePDFProgress = useCallback((progress: number, page: number, total: number) => {
    if (!bookId) return;
    updateProgress(bookId, progress, String(page), page);
    if (book && !book.totalPages && total > 0) {
      updateBook(bookId, { totalPages: total });
    }
  }, [bookId, updateProgress, updateBook, book]);

  const handleEPUBProgress = useCallback((progress: number, cfi: string) => {
    if (!bookId) return;
    updateProgress(bookId, progress, cfi);
  }, [bookId, updateProgress]);

  const handleAddBookmark = (label: string, cfi: string) => {
    if (!book || !bookId) return;
    const newBookmark = {
      id: `bm_${Date.now()}`,
      label,
      cfi,
      createdAt: new Date().toISOString(),
    };
    updateBook(bookId, { bookmarks: [...(book.bookmarks || []), newBookmark] });
    toast({ title: 'Marcador añadido', description: label });
  };

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <BookOpen size={60} className="text-muted-foreground/30" />
        <p className="text-muted-foreground">Libro no encontrado</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary text-white rounded-xl text-sm">
          Volver a la biblioteca
        </button>
      </div>
    );
  }

  // Online book (no local file)
  if (book.format === 'online' || (!book.fileData && !book.filePath)) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-background border-b border-border">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{book.title}</p>
            <p className="text-xs text-muted-foreground truncate">{book.author}</p>
          </div>
          <button onClick={() => toggleFavorite(book.id)} className={book.isFavorite ? 'text-red-500' : 'text-muted-foreground'}>
            <Heart size={20} fill={book.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center py-10">
          {book.cover && (
            <img src={book.cover} alt={book.title} className="w-36 h-52 object-cover rounded-xl shadow-xl book-cover" />
          )}
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{book.title}</h2>
            <p className="text-muted-foreground">{book.author}</p>
            {book.year && <p className="text-xs text-muted-foreground mt-1">{book.year}</p>}
          </div>
          {book.description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{book.description}</p>
          )}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {book.downloadUrl && (
              <a
                href={book.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold"
              >
                <Globe size={20} /> Abrir en navegador
              </a>
            )}
            <div className="text-xs text-muted-foreground bg-muted rounded-xl p-3">
              Para leer en la app, descarga el archivo PDF o EPUB y súbelo usando "Subir Libro"
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPDF = book.format === 'pdf';
  const initialPage = book.readingPosition ? parseInt(book.readingPosition) || 1 : 1;

  return (
    <div className="h-screen flex flex-col overflow-hidden" onClick={handleTap}>
      {/* Header (auto-hide) */}
      <div
        className={`reader-toolbar flex items-center gap-3 px-4 py-3 bg-background/95 backdrop-blur border-b border-border flex-shrink-0 z-30 ${showHeader ? '' : 'hidden'}`}
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
      >
        <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{book.title}</p>
          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(book.id); }}
          className={book.isFavorite ? 'text-red-500' : 'text-muted-foreground'}
        >
          <Heart size={20} fill={book.isFavorite ? 'currentColor' : 'none'} />
        </button>
        {/* Progress indicator */}
        <span className="text-xs text-muted-foreground font-medium">{book.readingProgress}%</span>
      </div>

      {/* Reader */}
      <div className="flex-1 overflow-hidden">
        {isPDF ? (
          <PDFReader
            fileData={book.fileData!}
            settings={readerSettings}
            onProgress={handlePDFProgress}
            initialPage={initialPage}
          />
        ) : (
          <EPUBReader
            fileData={book.fileData!}
            settings={readerSettings}
            onProgress={handleEPUBProgress}
            initialCfi={book.readingPosition}
            onSettingsChange={updateReaderSettings}
            onAddBookmark={handleAddBookmark}
          />
        )}
      </div>
    </div>
  );
}
