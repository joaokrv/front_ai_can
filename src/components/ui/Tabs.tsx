import React from 'react';
import styles from './Tabs.module.css';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTabId?: string;
  onChangeTab?: (id: string) => void;
  variant?: 'default' | 'accent';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  onChangeTab,
  variant = 'default',
  className = ''
}) => {
  const [localActiveTab, setLocalActiveTab] = React.useState(tabs[0]?.id);
  
  const currentActiveId = activeTabId !== undefined ? activeTabId : localActiveTab;

  const handleTabClick = (id: string) => {
    if (onChangeTab) {
      onChangeTab(id);
    } else {
      setLocalActiveTab(id);
    }
  };

  const activeContent = tabs.find(t => t.id === currentActiveId)?.content;

  return (
    <div className={`${styles.tabContainer} ${className}`}>
      <div className={styles.tabList} role="tablist">
        {tabs.map(tab => {
          const isActive = tab.id === currentActiveId;
          const activeStyle = isActive 
            ? (variant === 'accent' ? styles.activeTriggerAccent : styles.activeTrigger)
            : '';

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`${styles.tabTrigger} ${activeStyle}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className={styles.tabContent} role="tabpanel">
        {activeContent}
      </div>
    </div>
  );
};
