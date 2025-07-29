// Auto-detect column grouping patterns
export const autoDetectColumnGroups = (columns, tableData, groupConfig) => {
  if (!tableData.length) {
    return { groups: [], ungroupedColumns: columns };
  }

  const { groupSeparator, ungroupedColumns, totalColumns, groupingPatterns, customGroupMappings } = groupConfig;
  const groups = [];
  const processedColumns = new Set();
  const remainingColumns = [];

  // Step 1: Handle explicitly ungrouped columns
  const explicitlyUngroupedColumns = columns.filter(col => 
    ungroupedColumns.includes(col.key)
  );
  explicitlyUngroupedColumns.forEach(col => processedColumns.add(col.key));

  // Step 2: Post-merge column grouping based on keywords
  const keywordGroups = {};
  
  // Auto-detect group keywords from column names
  const autoDetectedGroups = detectGroupKeywords(columns, ungroupedColumns);
  
  columns.forEach(col => {
    if (processedColumns.has(col.key)) return;
    
    const colKey = col.key.toLowerCase();
    
    // Explicitly exclude salesTeam from any grouping
    if (colKey.includes('salesteam') || col.key === 'salesTeam') return;
    
    let assignedGroup = null;
    
    // Check for keyword-based grouping (post-merge logic)
    if (customGroupMappings && Object.keys(customGroupMappings).length > 0) {
      for (const [keyword, groupName] of Object.entries(customGroupMappings)) {
        if (colKey.includes(keyword.toLowerCase())) {
          assignedGroup = groupName;
          break;
        }
      }
    }
    
    // Auto-detect group based on column prefix
    if (!assignedGroup) {
      for (const [groupName, prefixes] of autoDetectedGroups) {
        if (prefixes.some(prefix => colKey.startsWith(prefix))) {
          assignedGroup = groupName;
          break;
        }
      }
    }
    
    // Fallback to hardcoded keywords if no auto-detection
    if (!assignedGroup) {
      if (colKey.includes('service')) {
        assignedGroup = 'Service';
      } else if (colKey.includes('support')) {
        assignedGroup = 'Support';
      } else if (colKey.includes('inventory')) {
        assignedGroup = 'Inventory';
      } else if (colKey.includes('empvisit')) {
        assignedGroup = 'EmpVisit';
      } else if (colKey.includes('drvisit')) {
        assignedGroup = 'DrVisit';
      }
    }
    
    if (assignedGroup) {
      if (!keywordGroups[assignedGroup]) {
        keywordGroups[assignedGroup] = [];
      }
      keywordGroups[assignedGroup].push({
        ...col,
        originalKey: col.key,
        subHeader: col.title,
        groupName: assignedGroup
      });
      processedColumns.add(col.key);
    }
  });

  // Step 3: Detect groups by separator pattern (e.g., "2025-04-01__serviceAmount")
  const separatorGroups = {};
  columns.forEach(col => {
    if (processedColumns.has(col.key)) return;
    
    if (col.key.includes(groupSeparator)) {
      const parts = col.key.split(groupSeparator);
      if (parts.length >= 2) {
        const prefix = parts[0]; // e.g., "2025-04-01"
        const suffix = parts.slice(1).join(groupSeparator); // e.g., "serviceAmount"
        let groupName = suffix;
        const suffixLower = suffix.toLowerCase();
        
        // Check custom group mappings first
        if (customGroupMappings && Object.keys(customGroupMappings).length > 0) {
          for (const [keyword, groupNameMapping] of Object.entries(customGroupMappings)) {
            if (suffixLower.includes(keyword.toLowerCase())) {
              groupName = groupNameMapping;
              break;
            }
          }
        }
        
        if (!separatorGroups[groupName]) {
          separatorGroups[groupName] = [];
        }
        separatorGroups[groupName].push({
          ...col,
          originalKey: col.key,
          groupPrefix: prefix,
          groupSuffix: suffix,
          subHeader: suffix.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        });
        processedColumns.add(col.key);
      }
    }
  });

  // Step 4: Handle custom grouping patterns
  groupingPatterns.forEach(pattern => {
    const regex = new RegExp(pattern.regex);
    columns.forEach(col => {
      if (processedColumns.has(col.key)) return;
      if (regex.test(col.key)) {
        const match = col.key.match(regex);
        const groupName = pattern.groupName || match[1] || 'Group';
        if (!separatorGroups[groupName]) {
          separatorGroups[groupName] = [];
        }
        separatorGroups[groupName].push({
          ...col,
          originalKey: col.key,
          subHeader: pattern.subHeaderExtractor ? pattern.subHeaderExtractor(col.key) : col.title
        });
        processedColumns.add(col.key);
      }
    });
  });

  // Step 5: Convert keyword groups to column groups (post-merge grouping takes priority)
  Object.entries(keywordGroups).forEach(([groupName, groupColumns]) => {
    if (groupColumns.length > 0) {
      groups.push({
        header: groupName,
        columns: groupColumns.sort((a, b) => a.title.localeCompare(b.title))
      });
    }
  });

  // Step 6: Convert separator groups to column groups
  Object.entries(separatorGroups).forEach(([groupName, groupColumns]) => {
    if (groupColumns.length > 0) {
      groups.push({
        header: groupName,
        columns: groupColumns.sort((a, b) => {
          // Sort by prefix first, then by suffix
          const prefixCompare = (a.groupPrefix || '').localeCompare(b.groupPrefix || '');
          if (prefixCompare !== 0) return prefixCompare;
          return (a.groupSuffix || '').localeCompare(b.groupSuffix || '');
        })
      });
    }
  });

  // Step 7: Handle total columns - try to group them with their parent groups
  const totalCols = columns.filter(col => 
    !processedColumns.has(col.key) && (
      totalColumns.includes(col.key) || 
      col.key.toLowerCase().includes('total') ||
      col.title.toLowerCase().includes('total')
    )
  );
  totalCols.forEach(col => {
    let matched = false;
    const colLower = col.key.toLowerCase();
    groups.forEach(group => {
      const groupNameLower = group.header.toLowerCase();
      if (colLower.includes(groupNameLower)) {
        group.columns.push({
          ...col,
          originalKey: col.key,
          subHeader: col.title,
          isTotal: true
        });
        matched = true;
        processedColumns.add(col.key);
      }
    });
    if (!matched) {
      remainingColumns.push(col);
      processedColumns.add(col.key);
    }
  });

  // Step 8: Remaining ungrouped columns
  columns.forEach(col => {
    if (!processedColumns.has(col.key)) {
      remainingColumns.push(col);
    }
  });

  return {
    groups,
    ungroupedColumns: [...explicitlyUngroupedColumns, ...remainingColumns]
  };
};

// Auto-detect group keywords from column names
const detectGroupKeywords = (columns, ungroupedColumns) => {
  const allColumnKeys = columns.map(col => col.key.toLowerCase());
  const detectedGroups = new Map();
  
  // Find common prefixes/suffixes in column names
  allColumnKeys.forEach(colKey => {
    // Skip columns that are explicitly ungrouped
    if (ungroupedColumns.includes(colKey)) return;
    
    // Look for patterns like: serviceAmount, serviceId, supportValue, etc.
    // Extract the first word (before camelCase or underscore)
    const match = colKey.match(/^([a-zA-Z]+)/);
    if (match) {
      const prefix = match[1];
      
      // Skip common shared field prefixes
      const sharedPrefixes = ['dr', 'date', 'id', 'name', 'team', 'hq', 'location', 'code','salesTeam'];
      if (sharedPrefixes.includes(prefix)) return;
      
      // Count how many columns start with this prefix
      const count = allColumnKeys.filter(key => key.startsWith(prefix)).length;
      
      // If multiple columns share this prefix, it's likely a group
      if (count > 1) {
        const groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        if (!detectedGroups.has(groupName)) {
          detectedGroups.set(groupName, []);
        }
        detectedGroups.get(groupName).push(prefix);
      }
    }
  });
  
  return detectedGroups;
};

// Generate column structure with grouping
export const generateColumnStructure = (enableColumnGrouping, enableAutoColumnGrouping, columns, autoDetectedColumnGroups, columnGroups) => {
  if (!enableColumnGrouping) {
    return { columns, hasGroups: false };
  }

  if (enableAutoColumnGrouping) {
    return {
      columns,
      hasGroups: autoDetectedColumnGroups.groups.length > 0,
      groups: autoDetectedColumnGroups.groups,
      ungroupedColumns: autoDetectedColumnGroups.ungroupedColumns
    };
  }

  // Use manual column groups
  return {
    columns,
    hasGroups: columnGroups.length > 0,
    groups: columnGroups,
    ungroupedColumns: columns
  };
}; 