import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { Badge } from '../ui/Badge';
import styles from './Header.module.css';

interface HeaderProps {
  onSearchOpen: () => void;
  onToggleSidebar: () => void;
  userName?: string;
  activePlanoId?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchOpen,
  onToggleSidebar,
  userName = 'João Victor',
  activePlanoId
}) => {
  const navigate = useNavigate();

  // Captura as iniciais do nome para renderizar no avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Escuta os atalhos de teclado Ctrl+K ou Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearchOpen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchOpen]);

  return (
    <header className={styles.header}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Botão de Hambúrguer para alternar menu lateral */}
        <button className={styles.menuHamburger} onClick={onToggleSidebar} aria-label="Alternar menu lateral">
          <Menu size={20} />
        </button>

        {/* Botão de Busca Rápida */}
        <button className={styles.searchBtn} onClick={onSearchOpen} aria-label="Abrir busca">
          <Search size={16} />
          <span className={styles.searchPlaceholder}>Buscar exercícios ou refeições...</span>
          <kbd className={styles.shortcut}>⌘K</kbd>
        </button>
      </div>

      {/* Destaques da Direita */}
      <div className={styles.rightArea}>
        {activePlanoId && (
          <Badge variant="active" className={styles.planoBadge}>
            Plano #{activePlanoId} · Ativo
          </Badge>
        )}

        <div className={styles.avatar} title={userName} onClick={() => navigate('/perfil')}>
          {getInitials(userName)}
        </div>
      </div>
    </header>
  );
};
export default Header;
