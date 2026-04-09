import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, Heart, Download, Settings, Upload } from 'lucide-react';

const navItems = [
  { path: '/', icon: BookOpen, label: 'Biblioteca' },
  { path: '/search', icon: Search, label: 'Buscar' },
  { path: '/upload', icon: Upload, label: 'Subir' },
  { path: '/favorites', icon: Heart, label: 'Favoritos' },
  { path: '/downloads', icon: Download, label: 'Gratis' },
  { path: '/settings', icon: Settings, label: 'Ajustes' },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav className="bottom-nav bg-card border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
