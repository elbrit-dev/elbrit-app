import React, { useMemo, useState, useEffect } from 'react';

/**
 * TagFilter Component for Plasmic Studio
 * 
 * This component allows users to select from a list of tags that can be:
 * - Passed directly as props
 * - Retrieved from page data
 * - Retrieved from query data
 * - Retrieved from CMS data
 * 
 * The selection state can be stored in Plasmic Studio state or passed to parent components.
 */
const TagFilter = ({
  // Tag data configuration
  tagList = [], // Direct array of tags
  tagDataSource = "props", // "props", "pageData", "queryData", "cmsData"
  tagDataPath = "", // Path to extract tags from data source
  tagField = "name", // Field name to extract from objects
  
  // Visual configuration
  tagStyle = "pill", // "pill", "button", "chip", "badge"
  selectedStyle = "filled", // "filled", "outlined", "highlighted"
  tagSize = "medium", // "small", "medium", "large"
  tagSpacing = 8, // Spacing between tags in pixels
  
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

  // Generate CSS classes based on props
  const getTagClasses = (tag) => {
    const baseClasses = ['tag-filter-tag'];
    
    // Size classes
    baseClasses.push(`tag-size-${tagSize}`);
    
    // Style classes
    baseClasses.push(`tag-style-${tagStyle}`);
    
    // Selection state
    if (selectedTags.includes(tag)) {
      baseClasses.push(`tag-selected-${selectedStyle}`);
    }
    
    return baseClasses.join(' ');
  };

  // Generate inline styles
  const getContainerStyle = () => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${tagSpacing}px`,
    ...style
  });

  const getTagStyle = (tag) => {
    const baseStyle = {
      cursor: 'pointer',
      border: 'none',
      borderRadius: tagStyle === 'pill' ? '20px' : '4px',
      padding: tagSize === 'small' ? '4px 12px' : tagSize === 'large' ? '8px 20px' : '6px 16px',
      fontSize: tagSize === 'small' ? '12px' : tagSize === 'large' ? '16px' : '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      outline: 'none',
    };

    // Default (unselected) styles
    if (!selectedTags.includes(tag)) {
      return {
        ...baseStyle,
        backgroundColor: '#f5f5f5',
        color: '#333',
        border: '1px solid #e0e0e0',
      };
    }

    // Selected styles
    switch (selectedStyle) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: '#007bff',
          color: 'white',
          border: '1px solid #007bff',
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: '#007bff',
          border: '2px solid #007bff',
        };
      case 'highlighted':
        return {
          ...baseStyle,
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeaa7',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#007bff',
          color: 'white',
          border: '1px solid #007bff',
        };
    }
  };

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
      {tags.map((tag, index) => (
        <button
          key={`${tag}-${index}`}
          className={getTagClasses(tag)}
          style={getTagStyle(tag)}
          onClick={() => handleTagClick(tag)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTagClick(tag);
            }
          }}
          title={`Click to ${selectedTags.includes(tag) ? 'deselect' : 'select'} ${tag}`}
          {...plasmicProps}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter; 