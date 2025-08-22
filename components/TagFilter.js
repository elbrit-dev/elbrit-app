'use client';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import '../styles/TagFilter.css';

export default function TagFilter({
  tagList = [],
  tagDataSource = 'props',
  tagDataPath = '',
  tagField = 'name',
  tagStyle = 'pill',
  selectedStyle = 'filled',
  tagSize = 'medium',
  tagSpacing = 8,
  multiSelect = true,
  allowDeselect = true,
  maxSelections = 10,
  stateKey = 'selectedTags',
  defaultSelected = [],
  onSelectionChange,
  onTagClick,
  className = '',
  style = {},
  pageData,
  queryData,
  cmsData,
  ...plasmicProps
}) {
  const getNestedValue = useCallback((obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((cur, key) => (cur == null ? cur : cur[key]), obj);
  }, []);

  const extractTagsFromData = useCallback((data, field) => {
    if (!data) return [];
    if (Array.isArray(data)) {
      if (typeof data[0] === 'string') return data.filter(Boolean);
      if (typeof data[0] === 'object') {
        return data
          .map((item) => item?.[field] ?? item?.name ?? item?.label ?? item?.id)
          .filter(Boolean);
      }
    }
    if (typeof data === 'object') {
      return (data.tags || data.categories || data.labels || []).filter(Boolean);
    }
    return [];
  }, []);

  const tags = useMemo(() => {
    if (tagDataSource === 'props') return Array.isArray(tagList) ? tagList : [];
    if (tagDataSource === 'pageData') return extractTagsFromData(getNestedValue(pageData, tagDataPath), tagField);
    if (tagDataSource === 'queryData') return extractTagsFromData(getNestedValue(queryData, tagDataPath), tagField);
    if (tagDataSource === 'cmsData') return extractTagsFromData(getNestedValue(cmsData, tagDataPath), tagField);
    return [];
  }, [tagDataSource, tagList, tagDataPath, tagField, pageData, queryData, cmsData, getNestedValue, extractTagsFromData]);

  const [selectedTags, setSelectedTags] = useState(() => Array.isArray(defaultSelected) ? defaultSelected : []);

  useEffect(() => {
    if (Array.isArray(defaultSelected)) {
      setSelectedTags(defaultSelected);
    }
  }, [defaultSelected]);

  const commitSelection = useCallback((newSelection, clicked) => {
    setSelectedTags(newSelection);
    onSelectionChange?.(newSelection, clicked);
    onTagClick?.(clicked, newSelection);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tag-filter-selection-change', {
          detail: { selectedTags: newSelection, clickedTag: clicked, stateKey },
        })
      );
    }
  }, [onSelectionChange, onTagClick, stateKey]);

  const toggleTag = useCallback((tag) => {
    let next;
    const isSelected = selectedTags.includes(tag);

    if (multiSelect) {
      if (isSelected) {
        if (!allowDeselect) return;
        next = selectedTags.filter((t) => t !== tag);
      } else {
        next = selectedTags.length >= maxSelections
          ? [...selectedTags.slice(1), tag]
          : [...selectedTags, tag];
      }
    } else {
      next = isSelected ? (allowDeselect ? [] : selectedTags) : [tag];
    }

    commitSelection(next, tag);
  }, [selectedTags, multiSelect, allowDeselect, maxSelections, commitSelection]);

  const getTagClasses = useCallback(
    (tag) =>
      clsx(
        'tag-filter-tag',
        `tag-size-${tagSize}`,
        `tag-style-${tagStyle}`,
        { [`tag-selected-${selectedStyle}`]: selectedTags.includes(tag) }
      ),
    [selectedTags, tagSize, tagStyle, selectedStyle]
  );

  const containerStyle = useMemo(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${tagSpacing}px`,
    ...style
  }), [tagSpacing, style]);

  // ---------- JSX return ----------
  if (!tags?.length) {
    return (
      <div className={clsx('tag-filter-container', className)} style={containerStyle}>
        <span style={{ color: '#999', fontStyle: 'italic' }}>No tags available</span>
      </div>
    );
  }

  return (
    <div className={clsx('tag-filter-container', className)} style={containerStyle}>
      {tags.map((tag, i) => (
        <button
          key={`${String(tag)}-${i}`}
          className={getTagClasses(tag)}
          onClick={() => toggleTag(tag)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTag(tag);
            }
          }}
          title={`${selectedTags.includes(tag) ? 'Deselect' : 'Select'} ${String(tag)}`}
          type="button"
          {...plasmicProps}
        >
          {String(tag)}
        </button>
      ))}
    </div>
  );
}
