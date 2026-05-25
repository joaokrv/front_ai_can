import React from 'react';
import api from '../../lib/api';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchPalette.module.css';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: number;
  nome: string;
  meta: string;
  tipo: 'exercicio' | 'refeicao';
}

export const SearchPalette: React.FC<SearchPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Foco no input ao abrir
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escuta tecla Escape para fechar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        // Buscamos dados dinamicamente da API local (port 8000)
        const [exRes, refRes] = await Promise.all([
          api.get<{ itens: any[] }>(`/catalogo/exercicios?q=${encodeURIComponent(query)}&limit=5`).catch(() => ({ itens: [] })),
          api.get<{ itens: any[] }>(`/catalogo/refeicoes?q=${encodeURIComponent(query)}&limit=5`).catch(() => ({ itens: [] }))
        ]);

        const merged: SearchItem[] = [
          ...(exRes.itens || []).map((i: any) => ({
            id: i.id,
            nome: i.nome,
            meta: i.grupo_muscular,
            tipo: 'exercicio' as const
          })),
          ...(refRes.itens || []).map((i: any) => ({
            id: i.id,
            nome: i.nome,
            meta: i.tipo === 'pre_treino' ? 'Pré-treino' : 'Pós-treino',
            tipo: 'refeicao' as const
          }))
        ];

        setResults(merged);
      } catch (err) {
        // Silencia erro e deixa vazio se der offline
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleItemSelect = (item: SearchItem) => {
    onClose();
    if (item.tipo === 'exercicio') {
      navigate(`/treinos?q=${encodeURIComponent(item.nome)}`);
    } else {
      navigate(`/refeicoes?q=${encodeURIComponent(item.nome)}`);
    }
  };

  const exercicios = results.filter(r => r.tipo === 'exercicio');
  const refeicoes = results.filter(r => r.tipo === 'refeicao');

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.palette}>
        <div className={styles.searchHeader}>
          <Search size={20} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Digite para buscar exercícios ou refeições..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.resultsArea}>
          {isLoading && (
            <div className={styles.emptyState}>Buscando sugestões...</div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className={styles.emptyState}>Nenhum resultado encontrado para "{query}"</div>
          )}

          {!isLoading && !query && (
            <div className={styles.emptyState}>Digite um termo (ex: "Peito", "Frango", "Supino")</div>
          )}

          {!isLoading && results.length > 0 && (
            <>
              {exercicios.length > 0 && (
                <div className={styles.group}>
                  <div className={styles.groupLabel}>Exercícios</div>
                  {exercicios.map(item => (
                    <div key={`ex-${item.id}`} className={styles.item} onClick={() => handleItemSelect(item)}>
                      <span className={styles.itemTitle}>{item.nome}</span>
                      <span className={styles.itemMeta}>{item.meta}</span>
                    </div>
                  ))}
                </div>
              )}

              {refeicoes.length > 0 && (
                <div className={styles.group}>
                  <div className={styles.groupLabel}>Nutrição (Pré / Pós-Treino)</div>
                  {refeicoes.map(item => (
                    <div key={`ref-${item.id}`} className={styles.item} onClick={() => handleItemSelect(item)}>
                      <span className={styles.itemTitle}>{item.nome}</span>
                      <span className={styles.itemMeta}>{item.meta}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.footer}>
          <span><kbd className={styles.key}>esc</kbd> fechar</span>
          <span><kbd className={styles.key}>↑↓</kbd> navegar</span>
          <span><kbd className={styles.key}>enter</kbd> ir para página</span>
        </div>
      </div>
    </div>
  );
};
