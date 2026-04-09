import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '@/hooks/useLibrary';
import BottomNav from '@/components/BottomNav';
import { Upload as UploadIcon, FileText, Book, X, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BookCategory, BookFormat } from '@/types/book';

const CATEGORIES: { value: BookCategory; label: string }[] = [
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

export default function Upload() {
  const navigate = useNavigate();
  const { addBook, darkMode } = useLibrary();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<BookCategory>('other');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['application/pdf', 'application/epub+zip'].includes(file.type) &&
        !file.name.endsWith('.epub') && !file.name.endsWith('.pdf')) {
      toast({ title: 'Formato no soportado', description: 'Solo se admiten archivos PDF y EPUB', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    // Auto-fill title from filename
    const nameWithoutExt = file.name.replace(/\.(pdf|epub)$/i, '');
    setTitle(prev => prev || nameWithoutExt);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileData(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim() || !fileData) return;
    setUploading(true);
    try {
      const format: BookFormat = selectedFile.name.endsWith('.epub') ? 'epub' : 'pdf';
      addBook({
        title: title.trim(),
        author: author.trim() || 'Autor desconocido',
        format,
        category,
        fileData,
        filePath: selectedFile.name,
      });
      toast({ title: '¡Libro añadido!', description: `"${title}" está en tu biblioteca` });
      navigate('/');
    } catch {
      toast({ title: 'Error', description: 'No se pudo añadir el libro', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`min-h-screen pb-20 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 pt-safe-top">
          <div className="flex items-center gap-3 py-3">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Subir Libro</h1>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* File picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${selectedFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.epub,application/pdf,application/epub+zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-2">
                <CheckCircle size={40} className="mx-auto text-primary" />
                <p className="font-semibold text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFileData(null); }}
                  className="text-xs text-red-500 flex items-center gap-1 mx-auto"
                >
                  <X size={12} /> Quitar archivo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center gap-3 mb-3">
                  <FileText size={32} className="text-primary/50" />
                  <Book size={32} className="text-primary/50" />
                </div>
                <p className="font-semibold">Seleccionar PDF o EPUB</p>
                <p className="text-xs text-muted-foreground">Toca para explorar tus archivos</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Título *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Nombre del libro"
                className="w-full mt-1 px-4 py-3 text-sm bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Autor</label>
              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Nombre del autor"
                className="w-full mt-1 px-4 py-3 text-sm bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as BookCategory)}
                className="w-full mt-1 px-4 py-3 text-sm bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || !title.trim() || uploading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadIcon size={20} />
            {uploading ? 'Añadiendo...' : 'Añadir a Biblioteca'}
          </button>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
