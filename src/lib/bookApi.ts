import { SearchResult } from '@/types/book';

// Open Library API
export async function searchOpenLibrary(query: string): Promise<SearchResult[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject,ia,has_fulltext`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Open Library error');
  const data = await res.json();
  return (data.docs || []).map((doc: any): SearchResult => ({
    id: doc.key?.replace('/works/', '') || Math.random().toString(36),
    title: doc.title || 'Sin título',
    author: (doc.author_name || ['Autor desconocido']).join(', '),
    cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
    year: doc.first_publish_year,
    pages: doc.number_of_pages_median,
    source: 'openlibrary',
    openLibraryKey: doc.key,
    downloadUrl: doc.ia && doc.has_fulltext ? `https://archive.org/download/${doc.ia[0]}/${doc.ia[0]}.pdf` : undefined,
    hasEpub: doc.ia ? true : false,
    hasPdf: doc.ia ? true : false,
  }));
}

export async function getOpenLibraryDescription(key: string): Promise<string> {
  try {
    const res = await fetch(`https://openlibrary.org${key}.json`);
    const data = await res.json();
    const desc = data.description;
    if (typeof desc === 'string') return desc;
    if (desc?.value) return desc.value;
    return '';
  } catch {
    return '';
  }
}

export async function searchGoogleBooks(query: string): Promise<SearchResult[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&langRestrict=es`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Google Books error');
  const data = await res.json();
  return ((data.items || []) as any[]).map((item: any): SearchResult => {
    const info = item.volumeInfo || {};
    return {
      id: item.id,
      title: info.title || 'Sin título',
      author: (info.authors || ['Autor desconocido']).join(', '),
      cover: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
      year: info.publishedDate ? parseInt(info.publishedDate) : undefined,
      description: info.description,
      pages: info.pageCount,
      source: 'googlebooks',
      googleBooksId: item.id,
      downloadUrl: info.previewLink,
    };
  });
}

export async function searchAllSources(query: string): Promise<SearchResult[]> {
  const [ol, gb] = await Promise.allSettled([
    searchOpenLibrary(query),
    searchGoogleBooks(query),
  ]);
  const results: SearchResult[] = [];
  if (ol.status === 'fulfilled') results.push(...ol.value);
  if (gb.status === 'fulfilled') results.push(...gb.value);
  return results;
}

// Project Gutenberg top free books
export async function getGutenbergBooks(): Promise<SearchResult[]> {
  const url = 'https://gutendex.com/books/?languages=es&mime_type=application%2Fepub&page_size=20';
  try {
    const res = await fetch(url);
    const data = await res.json();
    return ((data.results || []) as any[]).map((book: any): SearchResult => ({
      id: `gutenberg_${book.id}`,
      title: book.title,
      author: book.authors?.map((a: any) => a.name).join(', ') || 'Anónimo',
      cover: book.formats?.['image/jpeg'],
      source: 'openlibrary',
      downloadUrl: book.formats?.['application/epub+zip'] || book.formats?.['application/pdf'],
      hasEpub: !!book.formats?.['application/epub+zip'],
      hasPdf: !!book.formats?.['application/pdf'],
    }));
  } catch {
    return [];
  }
}
