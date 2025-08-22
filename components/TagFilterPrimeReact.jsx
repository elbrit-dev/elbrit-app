'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';

const TagFilterPrimeReact = ({
  // Data props
  tagList = [],
  tagDataSource = 'props',
  tagDataPath = '',
  tagField = 'name',
  
  // Behavior props
  multiSelect = true,
  allowDeselect = true,
  maxSelections = 10,
  defaultSelected = [],
  stateKey = 'selectedTags',
  
  // Search props
  showSearch = true,
  searchPlaceholder = 'Search tags...',
  searchDebounceMs = 300,
  searchLabel = 'Search',
  selectedLabel = 'Selected',
  showSearchLabel = false,
  
  // Color props
  enableTagColors = true,
  colorScheme = 'default', // 'default', 'rainbow', 'pastel', 'material'
  
  // Event handlers
  onSelectionChange,
  onTagClick,
  
  // Visual props
  display = 'tag',
  size = 'medium',
  severity = undefined,
  icon = null,
  iconPos = 'left',
  
  // Plasmic data context
  pageData,
  queryData,
  cmsData,
  
  ...props
}) => {
  // State
  const [selectedTags, setSelectedTags] = useState(defaultSelected);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [tempSelectedTags, setTempSelectedTags] = useState(defaultSelected);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  
  // Refs
  const searchInputRef = useRef(null);
  const overlayPanelRef = useRef(null);
  
  // Get tags from data source
  const getTagsFromDataSource = useCallback(() => {
    let sourceData;
    
    switch (tagDataSource) {
      case 'pageData':
        sourceData = pageData;
        break;
      case 'queryData':
        sourceData = queryData;
        break;
      case 'cmsData':
        sourceData = cmsData;
        break;
      default:
        return tagList;
    }
    
    if (!sourceData || !tagDataPath) return tagList;
    
    const pathParts = tagDataPath.split('.');
    let result = sourceData;
    
    for (const part of pathParts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return tagList;
      }
    }
    
    if (Array.isArray(result)) {
      return result.map(item => 
        typeof item === 'object' ? item[tagField] : item
      ).filter(Boolean);
    }
    
    return tagList;
  }, [tagDataSource, tagDataPath, tagField, tagList, pageData, queryData, cmsData]);
  
  const availableTags = getTagsFromDataSource();
  
  // Color generation functions
  const generateTagColor = useCallback((tag, index) => {
    if (!enableTagColors) return undefined;
    
    // Generate consistent color based on tag string hash
    const hash = tag.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    switch (colorScheme) {
      case 'rainbow':
        return `hsl(${Math.abs(hash) % 360}, 75%, 65%)`;
      
      case 'pastel':
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 75%)`;
      
      case 'material':
        const materialColors = [
          '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
          '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
          '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
          '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#795548'
        ];
        return materialColors[Math.abs(hash) % materialColors.length];
      
      default: // default - medium contrast, professional colors
        const defaultColors = [
          '#bbdefb', '#f8bbd9', '#c8e6c9', '#fff9c4', '#ffccbc',
          '#d1c4e9', '#c5cae9', '#b3e5fc', '#f0f4c3', '#e1bee7',
          '#b2dfdb', '#f3e5f5', '#e8eaf6', '#e0f2f1', '#f1f8e9',
          '#fff3e0', '#fce4ec', '#e8f5e8', '#e3f2fd', '#f3e5f5'
        ];
        return defaultColors[Math.abs(hash) % defaultColors.length];
    }
  }, [enableTagColors, colorScheme]);
  
  // Generate text color based on background color for better contrast
  const getTextColor = useCallback((backgroundColor) => {
    if (!backgroundColor) return undefined;
    
    // Convert hex to RGB for brightness calculation
    if (backgroundColor.startsWith('#')) {
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Calculate brightness using YIQ formula
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      // Return dark text for light backgrounds, light text for dark backgrounds
      return brightness > 128 ? '#2c3e50' : '#ffffff';
    }
    
    // For HSL colors, use a simpler approach
    if (backgroundColor.startsWith('hsl')) {
      // Extract lightness value
      const lightnessMatch = backgroundColor.match(/,\s*(\d+)%,\s*(\d+)%/);
      if (lightnessMatch) {
        const lightness = parseInt(lightnessMatch[2]);
        return lightness > 60 ? '#2c3e50' : '#ffffff';
      }
    }
    
    // Default fallback
    return '#2c3e50';
  }, []);
  
  // Create color map for tags - memoized for performance
  const tagColorMap = useMemo(() => {
    const map = new Map();
    availableTags.forEach((tag, index) => {
      map.set(tag, generateTagColor(tag, index));
    });
    return map;
  }, [availableTags, generateTagColor]);
  
  // Filter tags based on search
  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get unique tags that are not already selected
  const uniqueAvailableTags = filteredTags.filter(tag => 
    !selectedTags.includes(tag)
  );
  
  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);
  
  // Handle tag selection
  const handleTagSelect = useCallback((tag) => {
      if (selectedTags.includes(tag)) {
        if (allowDeselect) {
        const newSelected = selectedTags.filter(t => t !== tag);
        setSelectedTags(newSelected);
        onSelectionChange?.(newSelected, tag);
      }
    } else {
      if (multiSelect) {
        if (selectedTags.length < maxSelections) {
          const newSelected = [...selectedTags, tag];
          setSelectedTags(newSelected);
          onSelectionChange?.(newSelected, tag);
        }
      } else {
        setSelectedTags([tag]);
        onSelectionChange?.([tag], tag);
      }
    }
    
    // Close overlay after selection
    setIsOverlayVisible(false);
    if (overlayPanelRef.current) {
      overlayPanelRef.current.hide();
    }
    
    // Clear search query
    setSearchQuery('');
  }, [selectedTags, allowDeselect, multiSelect, maxSelections, onSelectionChange]);
  
  // Handle temporary tag selection in multi-select mode
  const handleTempTagToggle = useCallback((tag) => {
    if (tempSelectedTags.includes(tag)) {
      setTempSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      if (tempSelectedTags.length < maxSelections) {
        setTempSelectedTags(prev => [...prev, tag]);
      }
    }
  }, [tempSelectedTags, maxSelections]);

  // Handle select all functionality
  const handleSelectAll = useCallback(() => {
    const allAvailableTags = uniqueAvailableTags.slice(0, maxSelections);
    setTempSelectedTags(allAvailableTags);
  }, [uniqueAvailableTags, maxSelections]);

  // Handle deselect all functionality
  const handleDeselectAll = useCallback(() => {
    setTempSelectedTags([]);
  }, []);
  
  // Apply temporary selections
  const handleApplySelection = useCallback(() => {
    setSelectedTags(tempSelectedTags);
    onSelectionChange?.(tempSelectedTags);
    setIsOverlayVisible(false);
    if (overlayPanelRef.current) {
      overlayPanelRef.current.hide();
    }
    setSearchQuery('');
    setIsMultiSelectMode(false);
  }, [tempSelectedTags, onSelectionChange]);
  
  // Cancel multi-select mode
  const handleCancelSelection = useCallback(() => {
    setTempSelectedTags(selectedTags);
    setIsMultiSelectMode(false);
    setSearchQuery('');
  }, [selectedTags]);
  
  // Close dropdown
  const handleCloseDropdown = useCallback(() => {
    setIsOverlayVisible(false);
    if (overlayPanelRef.current) {
      overlayPanelRef.current.hide();
    }
    setSearchQuery('');
    setIsMultiSelectMode(false);
    setTempSelectedTags(selectedTags);
  }, [selectedTags]);
  
  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    setIsOverlayVisible(true);
    setTempSelectedTags(selectedTags);
    if (overlayPanelRef.current) {
      overlayPanelRef.current.show(null, searchInputRef.current);
    }
  }, [selectedTags]);
  
  // Handle search key down
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsOverlayVisible(false);
      if (overlayPanelRef.current) {
        overlayPanelRef.current.hide();
      }
    }
  }, []);
  
  // Handle tag removal (only when clicking X icon)
  const handleTagRemove = useCallback((tagToRemove, e) => {
    e.stopPropagation(); // Prevent tag click event
    
    if (allowDeselect) {
      const newSelected = selectedTags.filter(t => t !== tagToRemove);
      setSelectedTags(newSelected);
      onSelectionChange?.(newSelected, tagToRemove);
    }
  }, [selectedTags, allowDeselect, onSelectionChange]);

  // Handle remove all selected tags
  const handleRemoveAll = useCallback(() => {
    if (allowDeselect) {
      setSelectedTags([]);
      onSelectionChange?.([], null);
    }
  }, [allowDeselect, onSelectionChange]);
  
  // Handle tag click (for general tag interaction)
  const handleTagClick = useCallback((tag) => {
    onTagClick?.(tag, selectedTags);
  }, [onTagClick, selectedTags]);
  
  // Render tag element based on display prop
  const renderTagElement = (tag, isSelected = false) => {
    const tagColor = tagColorMap.get(tag);
    const textColor = getTextColor(tagColor);
    
    const commonProps = {
      key: tag,
      onClick: () => handleTagClick(tag),
      style: { 
        cursor: 'pointer',
        margin: '2px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        ...(tagColor && { backgroundColor: tagColor }),
        ...(textColor && { color: textColor })
      }
    };
    
    if (isSelected) {
      // Render selected tag with remove functionality
    switch (display) {
        case 'chip':
          return (
            <Chip
              {...commonProps}
              label={tag}
              removable={allowDeselect}
              onRemove={(e) => handleTagRemove(tag, e)}
              severity={severity}
              size={size}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            />
          );
        
        case 'button':
          return (
            <Button
              {...commonProps}
              label={tag}
              icon={icon || 'pi pi-times'}
              iconPos={iconPos}
              severity={severity}
              size={size}
              onClick={(e) => handleTagRemove(tag, e)}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor, borderColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            />
          );
        
        case 'badge':
        return (
            <Badge
              {...commonProps}
            value={tag}
              severity={severity}
              size={size}
              onClick={(e) => handleTagRemove(tag, e)}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            />
          );
        
        default: // tag
          return (
            <Tag
              {...commonProps}
              value={tag}
              severity={severity}
              size={size}
              style={{
                ...commonProps.style,
                position: 'relative',
                paddingRight: allowDeselect ? '24px' : '8px',
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            >
              {allowDeselect && (
                <span
                  onClick={(e) => handleTagRemove(tag, e)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: textColor || '#666',
                    lineHeight: 1,
                    padding: '2px',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = textColor === '#ffffff' ? '#333' : '#f0f0f0';
                    e.target.style.color = textColor === '#ffffff' ? '#ffffff' : '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = textColor || '#666';
                  }}
                >
                  ×
                </span>
              )}
            </Tag>
          );
      }
    } else {
      // Render unselected tag (in dropdown)
      switch (display) {
      case 'chip':
        return (
          <Chip
              {...commonProps}
            label={tag}
              size={size}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
          />
        );
        
      case 'button':
        return (
          <Button
              {...commonProps}
            label={tag}
            icon={icon}
            iconPos={iconPos}
              size={size}
              outlined
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor, borderColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
          />
        );
        
      case 'badge':
        return (
            <Badge
              {...commonProps}
              value={tag}
              size={size}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            />
          );
        
        default: // tag
        return (
          <Tag
              {...commonProps}
            value={tag}
              size={size}
              style={{
                ...commonProps.style,
                ...(tagColor && { backgroundColor: tagColor }),
                ...(textColor && { color: textColor })
              }}
            />
          );
      }
    }
  };
  
  return (
    <div 
      className="tag-filter-container"
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px'
      }}
      {...props}
    >
      {/* Search Bar */}
      {showSearch && (
        <div style={{ position: 'relative' }}>
          {showSearchLabel && (
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              fontSize: '14px', 
              fontWeight: '500',
              color: '#333'
            }}>
              {searchLabel}
            </label>
          )}
          <InputText
            ref={searchInputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onKeyDown={handleSearchKeyDown}
            placeholder={searchPlaceholder}
            style={{ 
              width: '100%',
              cursor: 'text'
            }}
          />
          
          <OverlayPanel
            ref={overlayPanelRef}
            style={{ 
              width: '350px', 
              maxHeight: '400px', 
              overflowY: 'auto',
              zIndex: 1000
            }}
            onHide={() => setIsOverlayVisible(false)}
          >
            <div style={{ padding: '8px' }}>
              {/* Dropdown Header with Close Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 12px', 
                borderBottom: '1px solid #e0e0e0', 
                marginBottom: '8px'
              }}>
                <div style={{ 
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {uniqueAvailableTags.length} tag{uniqueAvailableTags.length !== 1 ? 's' : ''} available
                </div>
                <button
                  onClick={handleCloseDropdown}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.color = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#666';
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* Multi-Select Toggle */}
              {multiSelect && (
                <div style={{ 
                  padding: '8px 12px', 
                  marginBottom: '8px',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <button
                    onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                    style={{
                      background: isMultiSelectMode ? '#007bff' : '#f8f9fa',
                      color: isMultiSelectMode ? '#ffffff' : '#333',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMultiSelectMode) {
                        e.target.style.backgroundColor = '#e9ecef';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMultiSelectMode) {
                        e.target.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                  >
                    {isMultiSelectMode ? 'Single Select Mode' : 'Multi-Select Mode'}
                  </button>
                </div>
              )}

              {/* Action Buttons for Multi-Select Mode - Fixed at Top */}
              {isMultiSelectMode && (
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  padding: '8px 12px',
                  borderBottom: '1px solid #f0f0f0',
                  marginBottom: '8px',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#ffffff',
                  zIndex: 1
                }}>
                  <button
                    onClick={handleSelectAll}
                    style={{
                      background: '#28a745',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      flex: 1,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#218838';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#28a745';
                    }}
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    style={{
                      background: '#6c757d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      flex: 1,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#545b62';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#6c757d';
                    }}
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={handleApplySelection}
                    style={{
                      background: '#007bff',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      flex: 1,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#0056b3';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#007bff';
                    }}
                  >
                    Apply ({tempSelectedTags.length})
                  </button>
                  <button
                    onClick={handleCancelSelection}
                    style={{
                      background: '#dc3545',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      flex: 1,
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#c82333';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#dc3545';
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {uniqueAvailableTags.length === 0 ? (
                <div style={{ 
                  padding: '12px', 
                  textAlign: 'center', 
                  color: '#666',
                  fontSize: '14px'
                }}>
                  {selectedTags.length === availableTags.length ? 'All tags selected' : 'No tags found'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {uniqueAvailableTags.map(tag => {
                    const isTempSelected = tempSelectedTags.includes(tag);
                    return (
                      <div
                        key={tag}
                        onClick={() => isMultiSelectMode ? handleTempTagToggle(tag) : handleTagSelect(tag)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease',
                          fontSize: '14px',
                          border: '1px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: isMultiSelectMode && isTempSelected ? '#e3f2fd' : 'transparent',
                          borderColor: isMultiSelectMode && isTempSelected ? '#2196f3' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!isMultiSelectMode || !isTempSelected) {
                            e.target.style.backgroundColor = '#f5f5f5';
                            e.target.style.borderColor = '#e0e0e0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMultiSelectMode || !isTempSelected) {
                            e.target.style.backgroundColor = isMultiSelectMode && isTempSelected ? '#e3f2fd' : 'transparent';
                            e.target.style.borderColor = isMultiSelectMode && isTempSelected ? '#2196f3' : 'transparent';
                          }
                        }}
                      >
                        {/* Selection indicator for multi-select mode */}
                        {isMultiSelectMode && (
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: isTempSelected ? '#2196f3' : '#ccc',
                            backgroundColor: isTempSelected ? '#2196f3' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isTempSelected && (
                              <span style={{
                                color: '#ffffff',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                lineHeight: 1
                              }}>
                                ✓
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Tag display */}
                        <div style={{ flex: 1 }}>
                          {renderTagElement(tag, false)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              

            </div>
          </OverlayPanel>
        </div>
      )}
      
      {/* Remove All Button - Below Search Bar */}
      {selectedTags.length > 0 && allowDeselect && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          marginBottom: '8px'
        }}>
          <button
            onClick={handleRemoveAll}
            style={{
              background: '#dc3545',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#c82333';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#dc3545';
            }}
          >
            <span style={{ fontSize: '14px' }}>×</span>
            Remove All ({selectedTags.length})
          </button>
        </div>
      )}

      {/* Selected Tags Section */}
      {selectedTags.length > 0 && (
        <div>
          <div style={{ 
            marginBottom: '8px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: '#333'
          }}>
            {selectedLabel}: {selectedTags.length}
          </div>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '4px',
            alignItems: 'center'
          }}>
            {selectedTags.map(tag => renderTagElement(tag, true))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagFilterPrimeReact; 