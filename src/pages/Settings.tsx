import { useLibrary } from '@/hooks/useLibrary';
import BottomNav from '@/components/BottomNav';
import { Moon, Sun, Trash2, BookOpen, Info, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { books, darkMode, toggleDarkMode, darkMode: dm } = useLibrary();
  const { toast } = useToast();

  const totalPages = books.reduce((acc, b) => acc + (b.totalPages || 0), 0);
  const booksRead = books.filter(b => b.readingProgress === 100).length;
  const booksReading = books.filter(b => b.readingProgress > 0 && b.readingProgress < 100).length;

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-safe-top">
          <div className="py-3">
            <h1 className="font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Ajustes</h1>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Stats */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-4 border border-primary/20">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><BookOpen size={18} className="text-primary" /> Tus estadísticas</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: books.length },
                { label: 'Leídos', value: booksRead },
                { label: 'Leyendo', value: booksReading },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <h2 className="px-4 pt-4 pb-2 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Apariencia</h2>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-amber-500" />}
                  <div>
                    <p className="text-sm font-medium">Modo oscuro</p>
                    <p className="text-xs text-muted-foreground">{darkMode ? 'Activado' : 'Desactivado'}</p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <h2 className="px-4 pt-4 pb-2 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Información</h2>
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-center gap-3">
                <Info size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">BookVerse</p>
                  <p className="text-xs text-muted-foreground">Versión 1.0.0 • Tu biblioteca digital</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                BookVerse usa Open Library, Google Books y Project Gutenberg para búsqueda y descarga de libros gratuitos.
              </p>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
