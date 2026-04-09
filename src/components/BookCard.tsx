import { Book } from '@/types/book';
import { Heart, BookOpen, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookCardProps {
  book: Book;
  onToggleFavorite?: (id: string) => void;
  compact?: boolean;
}

export default function BookCard({ book, onToggleFavorite, compact = false }: BookCardProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer" onClick={() => navigate(`/reader/${book.id}`)}>
        <div className="relative flex-shrink-0 w-12 h-18">
          {book.cover ? (
            <img src={book.cover} alt={book.title} className="w-12 h-18 object-cover rounded-md book-cover" />
          ) : (
            <div className="w-12 h-18 bg-gradient-to-br from-primary/30 to-primary/10 rounded-md flex items-center justify-center">
              <BookOpen size={20} className="text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{book.title}</p>
          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
          {book.readingProgress > 0 && (
            <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
              <div className="reading-progress-bar h-full rounded-full" style={{ width: `${book.readingProgress}%` }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="cursor-pointer" onClick={() => navigate(`/reader/${book.id}`)}>
        <div className="relative aspect-[2/3] mb-2">
          {book.cover ? (
            <img src={book.cover} alt={book.title} className="book-cover w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-purple-500/20 rounded-lg flex items-center justify-center border border-border">
              <BookOpen size={40} className="text-primary/60" />
            </div>
          )}
          {book.readingProgress > 0 && book.readingProgress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden">
              <div className="reading-progress-bar h-full" style={{ width: `${book.readingProgress}%` }} />
            </div>
          )}
          {book.readingProgress === 100 && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">✓</div>
          )}
          <div className="absolute top-2 left-2 bg-black/50 text-white text-[9px] uppercase px-1.5 py-0.5 rounded font-bold">
            {book.format}
          </div>
        </div>
        <p className="text-xs font-semibold leading-tight line-clamp-2 mb-0.5">{book.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{book.author}</p>
      </div>
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.id); }}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${book.isFavorite ? 'bg-red-500 text-white' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'}`}
        >
          <Heart size={12} fill={book.isFavorite ? 'currentColor' : 'none'} />
        </button>
      )}
    </div>
  );
}
