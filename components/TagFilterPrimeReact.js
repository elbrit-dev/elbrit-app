// /components/TagFilterPrimeReact.js
'use client';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import '../styles/TagFilter.css';

export default function TagFilterPrimeReact(props) {
  const {
    tagList = [],
    tagDataSource = 'props',
    tagDataPath = '',
    tagField = 'name',

    tagStyle = 'tag',            // 'tag' | 'chip' | 'button' | 'badge'
    selectedStyle = 'filled',    // 'filled' | 'outlined' | 'highlighted'
    tagSize = 'medium',          // 'small' | 'medium' | 'large'
    tagSpacing = 8,

    tagSeverity = 'info',
    tagIcon = null,
    tagIconPos = 'left',

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
  } = props;

  const getNestedValue = useCallback((obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((cur, key) => (cur == null ? cur : cur[key]), obj);
  }, []);

  const extractTagsFromData = useCallback((data, field) => {
    if (!data) return [];
    if (Array.isArray(data)) {
      if (typeof data[0] === 'string') return data.filter(Boolean);
      if (typeof data[0] === 'object') {
        return data.map((it) => it?.[field] ?? it?.name ?? it?.label ?? it?.id).filter(Boolean);
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

  const [selected, setSelected] = useState(() => Array.isArray(defaultSelected) ? defaultSelected : []);

  useEffect(() => {
    if (Array.isArray(defaultSelected)) setSelected(defaultSelected);
  }, [defaultSelected]);

  const commit = useCallback((next, clicked) => {
    setSelected(next);
    onSelectionChange?.(next, clicked);
    onTagClick?.(clicked, next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tag-filter-selection-change', {
        detail: { selectedTags: next, clickedTag: clicked, stateKey }
      }));
    }
  }, [onSelectionChange, onTagClick, stateKey]);

  const toggle = useCallback((tag) => {
    const isSel = selected.includes(tag);
    let next;
    if (multiSelect) {
      next = isSel
        ? (allowDeselect ? selected.filter(t => t !== tag) : selected)
        : (selected.length >= maxSelections ? [...selected.slice(1), tag] : [...selected, tag]);
    } else {
      next = isSel ? (allowDeselect ? [] : selected) : [tag];
    }
    commit(next, tag);
  }, [selected, multiSelect, allowDeselect, maxSelections, commit]);

  const sizeProp = tagSize === 'small' ? 'small' : tagSize === 'large' ? 'large' : undefined;
  const itemCommon = { style: { cursor: 'pointer', margin: `${tagSpacing / 2}px` } };

  const renderOne = (tag, i) => {
    const isSel = selected.includes(tag);
    switch (tagStyle) {
      case 'chip':
        return (
          <Chip
            key={`${String(tag)}-${i}`}
            label={String(tag)}
            icon={tagIcon}
            iconPos={tagIconPos}
            removable={isSel && allowDeselect}
            onRemove={() => toggle(tag)}
            onClick={() => toggle(tag)}
            {...itemCommon}
            {...plasmicProps}
          />
        );
      case 'button':
        return (
          <Button
            key={`${String(tag)}-${i}`}
            label={String(tag)}
            icon={tagIcon}
            iconPos={tagIconPos}
            severity={isSel ? (tagSeverity || 'success') : 'secondary'}
            outlined={selectedStyle === 'outlined'}
            size={sizeProp}
            onClick={() => toggle(tag)}
            {...itemCommon}
            {...plasmicProps}
          />
        );
      case 'badge':
        return (
          <span key={`${String(tag)}-${i}`} style={{ display: 'inline-block', ...itemCommon.style }} {...plasmicProps}>
            <Badge
              value={String(tag)}
              severity={isSel ? (tagSeverity || 'success') : 'secondary'}
              size={sizeProp}
              onClick={() => toggle(tag)}
              style={{ cursor: 'pointer' }}
            />
          </span>
        );
      case 'tag':
      default:
        return (
          <Tag
            key={`${String(tag)}-${i}`}
            value={String(tag)}
            icon={tagIcon}
            iconPos={tagIconPos}
            severity={
              selectedStyle === 'highlighted'
                ? (isSel ? 'warn' : 'secondary')
                : (isSel ? (tagSeverity || 'success') : 'secondary')
            }
            onClick={() => toggle(tag)}
            {...itemCommon}
            {...plasmicProps}
          />
        );
    }
  };

  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${tagSpacing}px`,
    alignItems: 'center',
    minHeight: '40px',
    padding: '8px 0',
    ...style
  };

  if (!tags?.length) {
    return (
      <div className={`tag-filter-container ${className}`} style={containerStyle}>
        <span style={{ color: '#999', fontStyle: 'italic' }}>No tags available</span>
      </div>
    );
  }

  return (
    <div className={`tag-filter-container ${className}`} style={containerStyle}>
      {tags.map(renderOne)}
    </div>
  );
}
