/**
 * ComponentPalette — Left Sidebar with Draggable Components
 * ===========================================================
 * 
 * This sidebar lists all available architecture components,
 * grouped by category. Users drag components from here onto the canvas.
 * 
 * DRAG & DROP (HTML5 API):
 * 1. onDragStart: Set the component type as drag data
 * 2. User drags to canvas
 * 3. Canvas onDrop reads the data and creates a node
 * 
 * This is the same drag-and-drop API used by Figma, Notion, etc.
 */

import { useState } from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { COMPONENT_CATEGORIES } from '../../data/componentLibrary';
import type { ComponentDefinition } from '../../types';
import './ComponentPalette.css';

export default function ComponentPalette() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(COMPONENT_CATEGORIES))
  );

  /**
   * onDragStart — When user starts dragging a component.
   * We store the component type in the drag event's dataTransfer.
   * The canvas reads this on drop.
   */
  const onDragStart = (
    event: React.DragEvent,
    component: ComponentDefinition
  ) => {
    event.dataTransfer.setData('application/archlab-component', component.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Filter components by search query
  const filteredCategories = Object.entries(COMPONENT_CATEGORIES)
    .map(([key, category]) => ({
      key,
      label: category.label,
      components: category.components.filter(
        (comp) =>
          comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comp.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.components.length > 0);

  return (
    <div className="component-palette" data-tour="component-palette">
      <div className="palette-header">
        <h2 className="palette-title">
          <Icons.LayoutGrid size={18} />
          Components
        </h2>
        <div className="palette-search">
          <Icons.Search size={14} className="search-icon" />
          <input
            type="text"
            className="input"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="palette-body">
        {filteredCategories.map(({ key, label, components }) => (
          <div key={key} className="palette-category">
            <button
              className="category-header"
              onClick={() => toggleCategory(key)}
            >
              <span className="category-label">{label}</span>
              <Icons.ChevronDown
                size={14}
                className={`category-chevron ${expandedCategories.has(key) ? 'expanded' : ''}`}
              />
            </button>

            {expandedCategories.has(key) && (
              <div className="category-items">
                {components.map((comp) => {
                  const IconComponent = ((Icons as any)[comp.icon] || Icons.Box) as React.ComponentType<LucideProps>;

                  return (
                    <div
                      key={comp.type}
                      className="palette-item"
                      draggable
                      onDragStart={(e) => onDragStart(e, comp)}
                      title={comp.description}
                    >
                      <div
                        className="palette-item-icon"
                        style={{ background: comp.color }}
                      >
                        <IconComponent size={14} />
                      </div>
                      <span className="palette-item-name">{comp.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="palette-footer">
        <p className="palette-hint">
          <Icons.GripVertical size={12} />
          Drag components onto the canvas
        </p>
      </div>
    </div>
  );
}
