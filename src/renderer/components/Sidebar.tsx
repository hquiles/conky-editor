import React from 'react';
import { Category } from '../data/categories';

interface SidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ categories, activeCategory, onCategorySelect }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Conky Editor</h2>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3>Settings Categories</h3>
          <ul>
            {categories.map((category) => (
              <li
                key={category.id}
                className={activeCategory === category.id ? 'active' : ''}
                onClick={() => onCategorySelect(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};
