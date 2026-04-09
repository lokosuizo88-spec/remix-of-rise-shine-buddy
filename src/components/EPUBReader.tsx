import { useEffect, useRef, useState, useCallback } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { ReaderSettings } from '@/types/book';
import { ChevronLeft, ChevronRight, List, Type, Sun, Moon, Loader2, BookmarkPlus } from 'lucide-react';

interface TocItem {
  label: string;
  href: string;
  subitems?: TocItem[];
}

interface Props {
  fileData: string;
  settings: ReaderSettings;
  onProgress: (progress: number, cfi: string) => void;
  initialCfi?: string;
  onSettingsChange: (s: Partial<ReaderSettings>) => void;
  onAddBookmark?: (label: string, cfi: string) => void;
}

export default function EPUBReader({ fileData, settings, onProgress, initialCfi, onSettingsChange, onAddBookmark }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentCfi, setCurrentCfi] = useState('');
  const touchStartX = useRef(0);

  const getThemeStyles = useCallback(() => {
    const base = {
      fontFamily: settings.fontFamily === 'serif' ? "'Georgia', serif" : settings.fontFamily === 'monospace' ? "'Courier New', monospace" : "'Arial', sans-serif",
      fontSize: `${settings.fontSize}px`,
      lineHeight: `${settings.lineHeight}`,
      margin: `0 ${settings.margin}px`,
    };
    if (settings.theme === 'night') return { ...base, color: '#e0e0e0', background: '#1a1a2e' };
    if (settings.theme === 'sepia') return { ...base, color: '#5c4a1e', background: '#f4ecd8' };
    return { ...base, color: '#1a1a1a', background: '#ffffff' };
  }, [settings]);

  useEffect(() => {
    if (!viewerRef.current) return;
    let destroyed = false;

    async function loadEpub() {
      setLoading(true);
      try {
        // Convert base64 to ArrayBuffer
        const base64 = fileData.split(',')[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const buffer = bytes.buffer;

        const book = ePub(buffer as ArrayBuffer);
        bookRef.current = book;

        const rendition = book.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
          flow: 'paginated',
        });
        renditionRef.current = rendition;

        // Apply theme
        const themeStyles = getThemeStyles();
        rendition.themes.register('custom', {
          body: themeStyles,
          p: { lineHeight: themeStyles.lineHeight, margin: '0 0 1em 0' },
          img: { maxWidth: '100%' },
        });
        rendition.themes.select('custom');

        // Navigation events
        rendition.on('locationChanged', (loc: any) => {
          if (destroyed) return;
          const cfi = loc.start?.cfi || '';
          setCurrentCfi(cfi);
          try {
            const pct = book.locations.percentageFromCfi(cfi);
            const progress = Math.round((typeof pct === 'number' ? pct : 0) * 100);
            setCurrentProgress(progress);
            onProgress(progress, cfi);
          } catch {}
        });

        // Enable text selection and highlighting
        rendition.on('selected', (cfiRange: string, contents: any) => {
          const selection = contents.window.getSelection();
          if (!selection?.toString()) return;
          // Could implement highlighting here
        });

        // Load TOC
        await book.ready;
        if (!destroyed) {
          const nav = await book.loaded.navigation;
          setToc((nav.toc as any) || []);

          // Generate locations for progress tracking
          await book.locations.generate(1024);

          // Display at initial position or start
          if (initialCfi) {
            await rendition.display(initialCfi);
          } else {
            await rendition.display();
          }
          setLoading(false);
        }
      } catch (e) {
        console.error('EPUB load error', e);
        setLoading(false);
      }
    }

    loadEpub();
    return () => {
      destroyed = true;
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
      renditionRef.current = null;
      bookRef.current = null;
    };
  }, [fileData]);

  // Apply settings changes
  useEffect(() => {
    if (!renditionRef.current) return;
    const styles = getThemeStyles();
    renditionRef.current.themes.register('custom', {
      body: styles,
      p: { lineHeight: styles.lineHeight },
    });
    renditionRef.current.themes.select('custom');
  }, [settings, getThemeStyles]);

  const prevPage = () => renditionRef.current?.prev();
  const nextPage = () => renditionRef.current?.next();

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      if (dx < 0) nextPage();
      else prevPage();
    }
  };

  const goToToc = (href: string) => {
    renditionRef.current?.display(href);
    setShowToc(false);
  };

  const addBookmark = () => {
    if (currentCfi && onAddBookmark) {
      onAddBookmark(`Página ~${currentProgress}%`, currentCfi);
    }
  };

  const themeColor = settings.theme === 'night' ? '#1a1a2e' : settings.theme === 'sepia' ? '#f4ecd8' : '#ffffff';

  return (
    <div className="flex flex-col h-full" style={{ background: themeColor }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ background: settings.theme === 'night' ? '#0d0d1a' : settings.theme === 'sepia' ? '#e8d5b0' : '#f5f5f5', borderBottom: '1px solid rgba(0,0,0,0.1)' }}
      >
        <div className="flex items-center gap-2">
          <button onClick={() => setShowToc(!showToc)} className="p-1.5 rounded hover:bg-black/10">
            <List size={16} />
          </button>
          <button onClick={addBookmark} className="p-1.5 rounded hover:bg-black/10">
            <BookmarkPlus size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevPage} className="p-1 rounded hover:bg-black/10">
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-medium">{currentProgress}%</span>
          <button onClick={nextPage} className="p-1 rounded hover:bg-black/10">
            <ChevronRight size={18} />
          </button>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded hover:bg-black/10">
          <Type size={16} />
        </button>
      </div>

      {/* TOC panel */}
      {showToc && (
        <div className="absolute top-14 left-0 z-50 w-64 max-h-96 overflow-y-auto shadow-xl rounded-br-xl" style={{ background: themeColor, border: '1px solid rgba(0,0,0,0.1)' }}>
          <div className="p-3 font-semibold text-sm border-b border-black/10">Tabla de contenidos</div>
          {toc.map((item, i) => (
            <button key={i} onClick={() => goToToc(item.href)} className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 border-b border-black/5 last:border-0">
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="flex-shrink-0 p-3 border-b space-y-3" style={{ background: themeColor }}>
          {/* Font size */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Tamaño fuente</span>
            <div className="flex items-center gap-2">
              <button onClick={() => onSettingsChange({ fontSize: Math.max(10, settings.fontSize - 2) })} className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-sm">A-</button>
              <span className="text-xs w-8 text-center">{settings.fontSize}px</span>
              <button onClick={() => onSettingsChange({ fontSize: Math.min(32, settings.fontSize + 2) })} className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-sm">A+</button>
            </div>
          </div>
          {/* Font family */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Fuente</span>
            <div className="flex gap-1">
              {(['serif', 'sans-serif', 'monospace'] as const).map(f => (
                <button key={f} onClick={() => onSettingsChange({ fontFamily: f })} className={`px-2 py-1 text-xs rounded ${settings.fontFamily === f ? 'bg-primary text-white' : 'bg-black/10'}`}>
                  {f === 'serif' ? 'Serif' : f === 'sans-serif' ? 'Sans' : 'Mono'}
                </button>
              ))}
            </div>
          </div>
          {/* Theme */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Tema</span>
            <div className="flex gap-1">
              {([['day', '☀️'], ['sepia', '📜'], ['night', '🌙']] as const).map(([t, icon]) => (
                <button key={t} onClick={() => onSettingsChange({ theme: t })} className={`px-2 py-1 text-xs rounded ${settings.theme === t ? 'bg-primary text-white' : 'bg-black/10'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          {/* Line height */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Interlineado</span>
            <div className="flex gap-1">
              {([1.2, 1.6, 2.0] as const).map(lh => (
                <button key={lh} onClick={() => onSettingsChange({ lineHeight: lh })} className={`px-2 py-1 text-xs rounded ${settings.lineHeight === lh ? 'bg-primary text-white' : 'bg-black/10'}`}>
                  {lh}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EPUB viewer */}
      <div className="flex-1 relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: themeColor }}>
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando libro...</p>
            </div>
          </div>
        )}
        <div ref={viewerRef} id="epub-viewer" className="w-full h-full" />
      </div>

      {/* Progress bar */}
      <div className="h-1 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.1)' }}>
        <div className="h-full bg-primary transition-all" style={{ width: `${currentProgress}%` }} />
      </div>
    </div>
  );
}
