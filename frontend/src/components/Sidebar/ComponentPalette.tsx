/**
 * ComponentPalette — Left Sidebar with Draggable Components
 * ===========================================================
 * 
 * This sidebar lists all available architecture components,
 * grouped by category. Users drag components from here onto the canvas.
 * Powered by Hugeicons.
 */

import { useState } from 'react';
import {
  Icon,
  LayoutGridIcon,
  Search01Icon,
  ChevronDownIcon,
  GripVerticalIcon,
} from '../common/Icon';
import { HugeiconsIcon } from '@hugeicons/react';
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
      iconName: category.iconName,
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
          <HugeiconsIcon icon={LayoutGridIcon} size={18} />
          Components
        </h2>
        <div className="palette-search">
          <HugeiconsIcon icon={Search01Icon} size={14} className="search-icon" />
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
        {filteredCategories.map(({ key, label, iconName, components }) => (
          <div key={key} className="palette-category">
            <button
              className="category-header"
              onClick={() => toggleCategory(key)}
            >
              <span className="category-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon name={iconName} size={14} />
                {label}
              </span>
              <HugeiconsIcon
                icon={ChevronDownIcon}
                size={14}
                className={`category-chevron ${expandedCategories.has(key) ? 'expanded' : ''}`}
              />
            </button>

            {expandedCategories.has(key) && (
              <div className="category-items">
                {components.map((comp) => (
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
                      <Icon name={comp.icon} size={14} color="#ffffff" />
                    </div>
                    <span className="palette-item-name">{comp.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="palette-footer">
        <p className="palette-hint">
          <HugeiconsIcon icon={GripVerticalIcon} size={12} />
          Drag components onto the canvas
        </p>
      </div>
    </div>
  );
}
