import React, { useMemo, useState, useEffect } from 'react';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';

/**
 * TagFilter Component for Plasmic Studio using PrimeReact
 * 
 * This component uses PrimeReact components for beautiful, professional tag designs
 * that can be configured through Plasmic Studio props.
 */
const TagFilterPrimeReact = ({
  // Tag data configuration
  tagList = [], // Direct array of tags
  tagDataSource = "props", // "props", "pageData", "queryData", "cmsData"
  tagDataPath = "", // Path to extract tags from data source
  tagField = "name", // Field name to extract from objects
  
  // Visual configuration
  tagStyle = "tag", // "tag", "chip", "button", "badge"
  selectedStyle = "filled", // "filled", "outlined", "highlighted"
  tagSize = "medium", // "small", "medium", "large"
  tagSpacing = 8, // Spacing between tags in pixels
  
  // PrimeReact specific styling
  tagSeverity = "info", // "success", "info", "warn", "error", null
  tagIcon = null, // Icon to show on tags
  tagIconPos = "left", // "left" or "right"
  
  // Behavior configuration
  multiSelect = true, // Allow multiple tag selection
  allowDeselect = true, // Allow deselecting selected tags
  maxSelections = 10, // Maximum number of tags that can be selected
  
  // State management
  stateKey = "selectedTags", // Plasmic Studio state variable name
  defaultSelected = [], // Default selected tags
  
  // Callbacks
  onSelectionChange, // Called when selection changes
  onTagClick, // Called when individual tag is clicked
  
  // Plasmic Studio props
  className = "",
  style = {},
  
  // Data context (will be provided by Plasmic Studio)
  pageData,
  queryData,
  cmsData,
  
  ...plasmicProps
}) => {
  // Get the actual tag list based on data source
  const tags = useMemo(() => {
    if (tagDataSource === "props" && Array.isArray(tagList)) {
      return tagList;
    }
    
    if (tagDataSource === "pageData" && pageData && tagDataPath) {
      const data = getNestedValue(pageData, tagDataPath);
      return extractTagsFromData(data, tagField);
    }
    
    if (tagDataSource === "queryData" && queryData && tagDataPath) {
      const data = getNestedValue(queryData, tagDataPath);
      return extractTagsFromData(data, tagField);
    }
    
    if (tagDataSource === "cmsData" && cmsData && tagDataPath) {
      const data = getNestedValue(cmsData, tagDataPath);
      return extractTagsFromData(data, tagField);
    }
    
    return [];
  }, [tagDataSource, tagList, tagDataPath, tagField, pageData, queryData, cmsData]);

  // Selection state - this will be managed by Plasmic Studio
  const [selectedTags, setSelectedTags] = useState(defaultSelected);

  // Update selected tags when defaultSelected changes
  useEffect(() => {
    if (defaultSelected && defaultSelected.length > 0) {
      setSelectedTags(defaultSelected);
    }
  }, [defaultSelected]);

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Helper function to extract tags from various data formats
  const extractTagsFromData = (data, field) => {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      if (typeof data[0] === 'string') {
        return data;
      }
      if (typeof data[0] === 'object') {
        return data.map(item => item[field] || item.name || item.label || item.id).filter(Boolean);
      }
    }
    
    if (typeof data === 'object') {
      if (data.tags) return data.tags;
      if (data.categories) return data.categories;
      if (data.labels) return data.labels;
    }
    
    return [];
  };

  // Handle tag selection/deselection
  const handleTagClick = (tag) => {
    let newSelection;
    
    if (multiSelect) {
      if (selectedTags.includes(tag)) {
        // Deselect tag
        if (allowDeselect) {
          newSelection = selectedTags.filter(t => t !== tag);
        } else {
          return; // Don't allow deselection
        }
      } else {
        // Select tag
        if (selectedTags.length >= maxSelections) {
          // Remove oldest selection if at max
          newSelection = [...selectedTags.slice(1), tag];
        } else {
          newSelection = [...selectedTags, tag];
        }
      }
    } else {
      // Single select mode
      newSelection = selectedTags.includes(tag) ? [] : [tag];
    }
    
    setSelectedTags(newSelection);
    
    // Call callbacks
    if (onSelectionChange) {
      onSelectionChange(newSelection, tag);
    }
    
    if (onTagClick) {
      onTagClick(tag, newSelection);
    }
    
    // Dispatch custom event for Plasmic Studio integration
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('tag-filter-selection-change', {
        detail: {
          selectedTags: newSelection,
          clickedTag: tag,
          stateKey: stateKey
        }
      });
      window.dispatchEvent(event);
    }
  };

  // Get PrimeReact component props based on selection state
  const getTagProps = (tag) => {
    const isSelected = selectedTags.includes(tag);
    
    // Base props for all tag types
    const baseProps = {
      onClick: () => handleTagClick(tag),
      style: { cursor: 'pointer', margin: `${tagSpacing / 2}px` },
      className: `tag-filter-item ${isSelected ? 'tag-selected' : ''}`,
    };

    // Size-based props
    const sizeProps = {
      small: { size: 'small' },
      medium: { size: 'normal' },
      large: { size: 'large' }
    };

    // Selection-based styling
    const selectionProps = {
      filled: {
        severity: isSelected ? tagSeverity || 'success' : 'secondary',
        className: isSelected ? 'p-tag-success' : 'p-tag-secondary'
      },
      outlined: {
        severity: isSelected ? tagSeverity || 'info' : 'secondary',
        className: isSelected ? 'p-tag-outlined p-tag-info' : 'p-tag-outlined p-tag-secondary'
      },
      highlighted: {
        severity: isSelected ? 'warn' : 'secondary',
        className: isSelected ? 'p-tag-warn' : 'p-tag-secondary'
      }
    };

    return {
      ...baseProps,
      ...sizeProps[tagSize],
      ...selectionProps[selectedStyle]
    };
  };

  // Render different PrimeReact components based on tagStyle
  const renderTag = (tag, index) => {
    const tagProps = getTagProps(tag);
    const isSelected = selectedTags.includes(tag);

    switch (tagStyle) {
      case 'chip':
        return (
          <Chip
            key={`${tag}-${index}`}
            label={tag}
            icon={tagIcon}
            iconPos={tagIconPos}
            removable={isSelected && allowDeselect}
            onRemove={() => handleTagClick(tag)}
            {...tagProps}
          />
        );

      case 'button':
        return (
          <Button
            key={`${tag}-${index}`}
            label={tag}
            icon={tagIcon}
            iconPos={tagIconPos}
            severity={isSelected ? 'success' : 'secondary'}
            outlined={selectedStyle === 'outlined'}
            size={tagSize === 'small' ? 'small' : tagSize === 'large' ? 'large' : 'normal'}
            onClick={() => handleTagClick(tag)}
            style={{ margin: `${tagSpacing / 2}px` }}
            className={`tag-filter-item ${isSelected ? 'tag-selected' : ''}`}
          />
        );

      case 'badge':
        return (
          <div key={`${tag}-${index}`} style={{ display: 'inline-block', margin: `${tagSpacing / 2}px` }}>
            <Badge
              value={tag}
              severity={isSelected ? tagSeverity || 'success' : 'secondary'}
              size={tagSize === 'small' ? 'small' : tagSize === 'large' ? 'large' : 'normal'}
              onClick={() => handleTagClick(tag)}
              style={{ cursor: 'pointer' }}
              className={`tag-filter-item ${isSelected ? 'tag-selected' : ''}`}
            />
          </div>
        );

      case 'tag':
      default:
        return (
          <Tag
            key={`${tag}-${index}`}
            value={tag}
            icon={tagIcon}
            iconPos={tagIconPos}
            {...tagProps}
          />
        );
    }
  };

  // Generate container styles
  const getContainerStyle = () => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${tagSpacing}px`,
    alignItems: 'center',
    minHeight: '40px',
    padding: '8px 0',
    ...style
  });

  // Render nothing if no tags
  if (!tags || tags.length === 0) {
    return (
      <div className={`tag-filter-container ${className}`} style={getContainerStyle()}>
        <span style={{ color: '#999', fontStyle: 'italic' }}>
          No tags available
        </span>
      </div>
    );
  }

  return (
    <div className={`tag-filter-container ${className}`} style={getContainerStyle()}>
      {tags.map((tag, index) => renderTag(tag, index))}
      
      {/* Selection counter */}
      {multiSelect && (
        <div style={{ 
          marginLeft: 'auto', 
          fontSize: '12px', 
          color: '#6c757d',
          padding: '4px 8px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #dee2e6'
        }}>
          {selectedTags.length} selected
        </div>
      )}
    </div>
  );
};

export default TagFilterPrimeReact; 