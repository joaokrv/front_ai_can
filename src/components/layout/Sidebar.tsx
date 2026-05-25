import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Dumbbell, 
  Utensils, 
  Heart, 
  History, 
  User, 
  Sparkles,
  ClipboardList
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/hoje', label: 'Hoje', icon: <Calendar size={18} /> },
    { path: '/treinos', label: 'Treinos', icon: <ClipboardList size={18} /> },
    { path: '/exercicios', label: 'Exercícios', icon: <Dumbbell size={18} /> },
    { path: '/refeicoes', label: 'Refeições', icon: <Utensils size={18} /> },
    { path: '/afinidade', label: 'Afinidade', icon: <Heart size={18} /> },
    { path: '/historico', label: 'Histórico', icon: <History size={18} /> },
  ];

  const handleCtaClick = () => {
    navigate('/preferencias');
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsedSidebar : ''}`}>
      <div className={styles.topSection}>
        <Link to="/hoje" className={styles.logoLink}>
          <div className={styles.logo}>
            <svg className={styles.logoMark} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M10 2 C10.4 5.8 11.8 8.2 13 9.4 C14.2 10.6 16.8 10 18 10 C16.8 10 14.2 9.4 13 10.6 C11.8 11.8 10.4 14.2 10 18 C9.6 14.2 8.2 11.8 7 10.6 C5.8 9.4 3.2 10 2 10 C3.2 10 5.8 10.6 7 9.4 C8.2 8.2 9.6 5.8 10 2Z" fill="#D4FF00"/>
              <circle cx="10" cy="10" r="1.2" fill="white" opacity="0.8"/>
            </svg>
            {!isCollapsed && <span className={styles.logoText}>AICan</span>}
          </div>
        </Link>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.activeItem : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                  {isActive && !isCollapsed && <span className={styles.activeDot} />}
                </>
              )}
            </NavLink>
          ))}

          <div className={styles.divider} />

          <NavLink
            to="/perfil"
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.activeItem : ''}`
            }
            title={isCollapsed ? 'Perfil' : undefined}
          >
            {({ isActive }) => (
              <>
                <User size={18} />
                {!isCollapsed && <span>Perfil</span>}
                {isActive && !isCollapsed && <span className={styles.activeDot} />}
              </>
            )}
          </NavLink>
        </nav>
      </div>

      <div className={styles.bottomSection}>
        <button className={styles.ctaBtn} onClick={handleCtaClick} title="Novo Plano">
          <Sparkles size={14} />
          {!isCollapsed && <span>Novo Plano</span>}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
