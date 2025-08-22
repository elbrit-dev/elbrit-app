import React, { useMemo, useState, useEffect } from 'react';
import { Tag, Button, Badge, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

/**
 * TagFilter Component for Plasmic Studio using Ant Design
 * 
 * This component uses Ant Design components for beautiful, professional tag designs
 * that can be configured through Plasmic Studio props.
 */
const TagFilterAntDesign = ({
  // Tag data configuration
  tagList = [], // Direct array of tags
  tagDataSource = "props", // "props", "pageData", "queryData", "cmsData"
  tagDataPath = "", // Path to extract tags from data source
  tagField = "name", // Field name to extract from objects
  
  // Visual configuration
  tagStyle = "tag", // "tag", "button", "badge", "custom"
  selectedStyle = "filled", // "filled", "outlined", "highlighted"
  tagSize = "middle", // "small", "middle", "large"
  tagSpacing = 8, // Spacing between tags in pixels
  
  // Ant Design specific styling
  tagColor = "blue", // Color for tags
  tagIcon = null, // Icon to show on tags
  showCloseIcon = false, // Show close icon on selected tags
  
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

  // Get Ant Design component props based on selection state
  const getTagProps = (tag) => {
    const isSelected = selectedTags.includes(tag);
    
    // Base props for all tag types
    const baseProps = {
      onClick: () => handleTagClick(tag),
      style: { 
        cursor: 'pointer', 
        margin: `${tagSpacing / 2}px`,
        transition: 'all 0.2s ease'
      },
      className: `tag-filter-item ${isSelected ? 'tag-selected' : ''}`,
    };

    // Selection-based styling
    if (isSelected) {
      switch (selectedStyle) {
        case 'filled':
          return {
            ...baseProps,
            color: tagColor || 'blue',
            style: { ...baseProps.style, transform: 'scale(1.05)' }
          };
        case 'outlined':
          return {
            ...baseProps,
            color: tagColor || 'blue',
            style: { 
              ...baseProps.style, 
              border: `2px solid ${tagColor === 'blue' ? '#1890ff' : tagColor}`,
              backgroundColor: 'transparent'
            }
          };
        case 'highlighted':
          return {
            ...baseProps,
            color: 'gold',
            style: { 
              ...baseProps.style, 
              backgroundColor: '#fffbe6',
              borderColor: '#faad14'
            }
          };
        default:
          return {
            ...baseProps,
            color: tagColor || 'blue'
          };
      }
    } else {
      return {
        ...baseProps,
        color: 'default'
      };
    }
  };

  // Render different Ant Design components based on tagStyle
  const renderTag = (tag, index) => {
    const tagProps = getTagProps(tag);
    const isSelected = selectedTags.includes(tag);

    switch (tagStyle) {
      case 'button':
        return (
          <Button
            key={`${tag}-${index}`}
            type={isSelected ? 'primary' : 'default'}
            size={tagSize}
            icon={tagIcon}
            onClick={() => handleTagClick(tag)}
            style={{ 
              margin: `${tagSpacing / 2}px`,
              borderRadius: '16px',
              height: tagSize === 'small' ? '24px' : tagSize === 'large' ? '40px' : '32px'
            }}
            className={`tag-filter-item ${isSelected ? 'tag-selected' : ''}`}
          >
            {tag}
          </Button>
        );

      case 'badge':
        return (
          <Badge
            key={`${tag}-${index}`}
            count={tag}
            showZero
            size={tagSize === 'small' ? 'small' : tagSize === 'large' ? 'default' : 'default'}
            style={{ 
              margin: `${tagSpacing / 2}px`,
              cursor: 'pointer'
            }}
            onClick={() => handleTagClick(tag)}
            className={`tag-filter-item ${isSelected ? 'tag-selected' : ''}`}
          />
        );

      case 'custom':
        return (
          <div
            key={`${tag}-${index}`}
            onClick={() => handleTagClick(tag)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: tagSize === 'small' ? '4px 8px' : tagSize === 'large' ? '8px 16px' : '6px 12px',
              margin: `${tagSpacing / 2}px`,
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: isSelected ? (tagColor === 'blue' ? '#1890ff' : tagColor) : '#f5f5f5',
              color: isSelected ? 'white' : '#333',
              border: `1px solid ${isSelected ? (tagColor === 'blue' ? '#1890ff' : tagColor) : '#d9d9d9'}`,
              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
            }}
            className={`tag-filter-item ${isSelected ? 'tag-selected' : ''}`}
          >
            {tagIcon && <span style={{ marginRight: '4px' }}>{tagIcon}</span>}
            {tag}
            {isSelected && showCloseIcon && (
              <CloseOutlined 
                style={{ marginLeft: '6px', fontSize: '12px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagClick(tag);
                }}
              />
            )}
          </div>
        );

      case 'tag':
      default:
        return (
          <Tag
            key={`${tag}-${index}`}
            icon={tagIcon}
            closable={isSelected && showCloseIcon && allowDeselect}
            onClose={(e) => {
              e.preventDefault();
              handleTagClick(tag);
            }}
            {...tagProps}
          >
            {tag}
          </Tag>
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
      <Space wrap size={tagSpacing}>
        {tags.map((tag, index) => renderTag(tag, index))}
      </Space>
      
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

export default TagFilterAntDesign; 