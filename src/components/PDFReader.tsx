import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ReaderSettings } from '@/types/book';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Search, Loader2 } from 'lucide-react';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface Props {
  fileData: string; // base64 data URL
  settings: ReaderSettings;
  onProgress: (progress: number, page: number, total: number) => void;
  initialPage?: number;
}

export default function PDFReader({ fileData, settings, onProgress, initialPage = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(settings.rotation || 0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [showThumbs, setShowThumbs] = useState(false);

  // Touch handling for swipe
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const renderPage = useCallback(async (pageNum: number, sc: number, rot: number) => {
    if (!pdfRef.current || !canvasRef.current) return;
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }
    try {
      const page = await pdfRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale: sc, rotation: rot });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Apply brightness/contrast via filter
      ctx.filter = `brightness(${settings.brightness / 100})`;

      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
      setLoading(false);
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('PDF render error', err);
      }
    }
  }, [settings.brightness]);

  // Load PDF
  useEffect(() => {
    let destroyed = false;
    async function loadPDF() {
      setLoading(true);
      try {
        // Convert data URL to Uint8Array
        const base64 = fileData.split(',')[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (destroyed) return;
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        await renderPage(initialPage, scale, rotation);

        // Generate thumbnails (first 20 pages)
        const thumbs: string[] = [];
        const maxThumbs = Math.min(pdf.numPages, 20);
        for (let i = 1; i <= maxThumbs; i++) {
          const p = await pdf.getPage(i);
          const vp = p.getViewport({ scale: 0.15 });
          const c = document.createElement('canvas');
          c.width = vp.width;
          c.height = vp.height;
          await p.render({ canvasContext: c.getContext('2d')!, viewport: vp, canvas: c } as any).promise;
          thumbs.push(c.toDataURL());
        }
        if (!destroyed) setThumbnails(thumbs);
      } catch (e) {
        console.error('PDF load error', e);
        setLoading(false);
      }
    }
    loadPDF();
    return () => { destroyed = true; };
  }, [fileData]);

  // Re-render on page/scale/rotation change
  useEffect(() => {
    if (pdfRef.current) {
      setLoading(true);
      renderPage(currentPage, scale, rotation);
    }
  }, [currentPage, scale, rotation, renderPage]);

  // Report progress
  useEffect(() => {
    if (totalPages > 0) {
      onProgress(Math.round((currentPage / totalPages) * 100), currentPage, totalPages);
    }
  }, [currentPage, totalPages, onProgress]);

  const goTo = (page: number) => {
    const p = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(p);
    containerRef.current?.scrollTo({ top: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 60 && dy < 80) {
      if (dx < 0) goTo(currentPage + 1);
      else goTo(currentPage - 1);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !pdfRef.current) return;
    for (let i = currentPage; i <= totalPages; i++) {
      const page = await pdfRef.current.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      if (text.toLowerCase().includes(searchQuery.toLowerCase())) {
        goTo(i);
        break;
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-600">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 text-white text-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowThumbs(!showThumbs)} className="p-1.5 rounded hover:bg-white/10">
            <span className="text-xs font-mono">≡</span>
          </button>
          <button onClick={() => setShowSearch(!showSearch)} className="p-1.5 rounded hover:bg-white/10">
            <Search size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs">{currentPage} / {totalPages}</span>
          <button onClick={() => goTo(currentPage + 1)} disabled={currentPage >= totalPages} className="p-1 rounded hover:bg-white/10 disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1.5 rounded hover:bg-white/10"><ZoomOut size={14} /></button>
          <span className="text-xs">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-1.5 rounded hover:bg-white/10"><ZoomIn size={14} /></button>
          <button onClick={() => setRotation(r => ((r + 90) % 360) as any)} className="p-1.5 rounded hover:bg-white/10"><RotateCw size={14} /></button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="flex gap-2 px-3 py-2 bg-gray-700">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar en el documento..."
            className="flex-1 px-3 py-1.5 text-xs bg-gray-800 text-white rounded border-0 outline-none"
          />
          <button onClick={handleSearch} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded">
            Buscar
          </button>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnails sidebar */}
        {showThumbs && (
          <div className="w-20 bg-gray-800 overflow-y-auto flex-shrink-0 p-1 space-y-1">
            {thumbnails.map((thumb, i) => (
              <div
                key={i}
                onClick={() => goTo(i + 1)}
                className={`cursor-pointer rounded overflow-hidden border-2 transition-colors ${currentPage === i + 1 ? 'border-blue-500' : 'border-transparent'}`}
              >
                <img src={thumb} alt={`Pág. ${i + 1}`} className="w-full" />
                <p className="text-[9px] text-center text-gray-400 pb-0.5">{i + 1}</p>
              </div>
            ))}
          </div>
        )}

        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={32} className="animate-spin text-white" />
            </div>
          )}
          <div className="pdf-canvas-container">
            <canvas ref={canvasRef} style={{ display: loading ? 'none' : 'block' }} />
          </div>
        </div>
      </div>

      {/* Bottom progress */}
      <div className="h-1 bg-gray-700 flex-shrink-0">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: totalPages ? `${(currentPage / totalPages) * 100}%` : '0%' }}
        />
      </div>

      {/* Page navigation bottom */}
      <div className="flex items-center justify-center gap-4 py-2 bg-gray-800 text-white flex-shrink-0">
        <button onClick={() => goTo(1)} className="text-xs text-gray-400 hover:text-white">⏮</button>
        <button onClick={() => goTo(currentPage - 10)} className="text-xs text-gray-400 hover:text-white">-10</button>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={e => goTo(parseInt(e.target.value) || 1)}
          className="w-14 text-center text-xs bg-gray-700 text-white rounded px-2 py-1 border border-gray-600 outline-none"
        />
        <button onClick={() => goTo(currentPage + 10)} className="text-xs text-gray-400 hover:text-white">+10</button>
        <button onClick={() => goTo(totalPages)} className="text-xs text-gray-400 hover:text-white">⏭</button>
      </div>
    </div>
  );
}
