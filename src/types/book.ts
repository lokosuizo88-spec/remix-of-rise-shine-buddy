export type BookFormat = 'pdf' | 'epub' | 'online';
export type BookCategory = 'fiction' | 'non-fiction' | 'science' | 'history' | 'philosophy' | 'technology' | 'art' | 'biography' | 'children' | 'other';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  pages?: number;
  format: BookFormat;
  category: BookCategory;
  filePath?: string; // local file path for PDF/EPUB
  fileData?: string; // base64 data
  openLibraryKey?: string;
  googleBooksId?: string;
  downloadUrl?: string;
  isFavorite: boolean;
  isDownloaded: boolean;
  addedAt: string;
  lastReadAt?: string;
  readingProgress: number; // 0-100
  currentPage?: number;
  totalPages?: number;
  readingPosition?: string; // epub cfi or pdf page
  highlights?: Highlight[];
  bookmarks?: Bookmark[];
  notes?: Note[];
}

export interface Highlight {
  id: string;
  text: string;
  cfi?: string;
  page?: number;
  color: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  label: string;
  cfi?: string;
  page?: number;
  createdAt: string;
}

export interface Note {
  id: string;
  text: string;
  cfi?: string;
  page?: number;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  pages?: number;
  source: 'openlibrary' | 'googlebooks';
  openLibraryKey?: string;
  googleBooksId?: string;
  downloadUrl?: string;
  hasEpub?: boolean;
  hasPdf?: boolean;
}

export interface ReaderSettings {
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif' | 'monospace';
  lineHeight: number;
  margin: number;
  theme: 'day' | 'night' | 'sepia';
  brightness: number;
  rotation: 0 | 90 | 180 | 270;
}

export interface LibraryState {
  books: Book[];
  readerSettings: ReaderSettings;
  darkMode: boolean;
}
