import { useState, useEffect, useCallback } from 'react';
import { Book, BookCategory, BookFormat, ReaderSettings, LibraryState } from '@/types/book';

const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 16,
  fontFamily: 'serif',
  lineHeight: 1.6,
  margin: 20,
  theme: 'day',
  brightness: 100,
  rotation: 0,
};

const DEFAULT_STATE: LibraryState = {
  books: [],
  readerSettings: DEFAULT_READER_SETTINGS,
  darkMode: false,
};

function loadState(): LibraryState {
  try {
    const raw = localStorage.getItem('bookverse_library');
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: LibraryState) {
  try {
    localStorage.setItem('bookverse_library', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving library state', e);
  }
}

export function useLibrary() {
  const [state, setState] = useState<LibraryState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addBook = useCallback((book: Omit<Book, 'id' | 'addedAt' | 'isFavorite' | 'isDownloaded' | 'readingProgress'>) => {
    const newBook: Book = {
      ...book,
      id: `book_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      addedAt: new Date().toISOString(),
      isFavorite: false,
      isDownloaded: book.filePath ? true : false,
      readingProgress: 0,
    };
    setState(prev => ({ ...prev, books: [...prev.books, newBook] }));
    return newBook.id;
  }, []);

  const updateBook = useCallback((id: string, updates: Partial<Book>) => {
    setState(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  }, []);

  const removeBook = useCallback((id: string) => {
    setState(prev => ({ ...prev, books: prev.books.filter(b => b.id !== id) }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b),
    }));
  }, []);

  const updateProgress = useCallback((id: string, progress: number, position?: string, currentPage?: number) => {
    setState(prev => ({
      ...prev,
      books: prev.books.map(b => b.id === id ? {
        ...b,
        readingProgress: Math.min(100, Math.max(0, progress)),
        readingPosition: position ?? b.readingPosition,
        currentPage: currentPage ?? b.currentPage,
        lastReadAt: new Date().toISOString(),
      } : b),
    }));
  }, []);

  const updateReaderSettings = useCallback((settings: Partial<ReaderSettings>) => {
    setState(prev => ({
      ...prev,
      readerSettings: { ...prev.readerSettings, ...settings },
    }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const bookAlreadyInLibrary = useCallback((title: string, author: string) => {
    return state.books.some(b =>
      b.title.toLowerCase() === title.toLowerCase() &&
      b.author.toLowerCase() === author.toLowerCase()
    );
  }, [state.books]);

  return {
    books: state.books,
    readerSettings: state.readerSettings,
    darkMode: state.darkMode,
    addBook,
    updateBook,
    removeBook,
    toggleFavorite,
    updateProgress,
    updateReaderSettings,
    toggleDarkMode,
    bookAlreadyInLibrary,
    favorites: state.books.filter(b => b.isFavorite),
    recentBooks: [...state.books].sort((a, b) =>
      new Date(b.lastReadAt || b.addedAt).getTime() - new Date(a.lastReadAt || a.addedAt).getTime()
    ).slice(0, 10),
  };
}
