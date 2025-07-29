import { getUniqueValues } from './tableUtils';

// Pivot Table Helper Functions
export const parsePivotFieldName = (fieldName, config) => {
  if (config.parseFieldName && typeof config.parseFieldName === 'function') {
    return config.parseFieldName(fieldName);
  }
  
  // Default parsing logic for fields like "2025-04-01__serviceAmount"
  if (fieldName.includes(config.fieldSeparator)) {
    const parts = fieldName.split(config.fieldSeparator);
    return {
      prefix: parts[0], // e.g., "2025-04-01"
      suffix: parts.slice(1).join(config.fieldSeparator), // e.g., "serviceAmount"
      isDateField: config.dateFieldPattern.test(parts[0]),
      originalField: fieldName
    };
  }
  
  return {
    prefix: null,
    suffix: fieldName,
    isDateField: false,
    originalField: fieldName
  };
};

// Group data by specified fields
export const groupDataBy = (data, groupFields) => {
  const groups = {};
  
  data.forEach(row => {
    if (!row || typeof row !== 'object') return;
    
    const key = groupFields.map(field => row[field] || '').join('|');
    
    if (!groups[key]) {
      groups[key] = {
        key,
        groupValues: {},
        rows: []
      };
      
      groupFields.forEach(field => {
        groups[key].groupValues[field] = row[field];
      });
    }
    
    groups[key].rows.push(row);
  });
  
  return Object.values(groups);
};

// Transform data into pivot structure
export const transformToPivotData = (data, config) => {
  if (!config.enabled || !data.length) {
    return { pivotData: data, pivotColumns: [] };
  }
  
  const { rows, columns, values, filters } = config;
  
  // Step 1: Apply pivot filters if any
  let filteredData = data;
  if (filters && filters.length > 0) {
    // For now, we'll handle filters through the existing filter system
    // Could be enhanced to have specific pivot filter logic
  }
  
  // Step 2: If no pivot configuration, return original data
  if (rows.length === 0 && columns.length === 0 && values.length === 0) {
    return { pivotData: filteredData, pivotColumns: [] };
  }
  
  // Step 3: Group data by row fields
  const rowGroups = rows.length > 0 ? groupDataBy(filteredData, rows) : [{ key: 'all', groupValues: {}, rows: filteredData }];
  
  // Step 4: Get unique column values
  let columnValues = [];
  if (columns.length > 0) {
    columns.forEach(colField => {
      const uniqueVals = getUniqueValues(filteredData, colField);
      columnValues = [...columnValues, ...uniqueVals];
    });
    columnValues = [...new Set(columnValues)];
    
    if (config.sortColumns) {
      columnValues.sort((a, b) => {
        if (config.sortDirection === 'desc') {
          return String(b).localeCompare(String(a));
        }
        return String(a).localeCompare(String(b));
      });
    }
  }
  
  // Step 5: Create pivot structure
  const pivotData = [];
  
  rowGroups.forEach(rowGroup => {
    const pivotRow = { ...rowGroup.groupValues };
    
    // Add row totals
    if (config.showRowTotals && values.length > 0) {
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        const aggregateFunc = config.aggregationFunctions[aggregation];
        
        if (aggregateFunc) {
          const allValues = rowGroup.rows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
          pivotRow[`${fieldName}_total`] = aggregateFunc(allValues);
        }
      });
    }
    
    // Add column-specific values
    if (columns.length > 0 && columnValues.length > 0) {
      columnValues.forEach(colValue => {
        const colRows = rowGroup.rows.filter(row => {
          return columns.some(colField => row[colField] === colValue);
        });
        
        values.forEach(valueConfig => {
          const fieldName = valueConfig.field;
          const aggregation = valueConfig.aggregation || 'sum';
          const aggregateFunc = config.aggregationFunctions[aggregation];
          
          if (aggregateFunc) {
            const colValues = colRows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
            const columnKey = `${colValue}_${fieldName}`;
            pivotRow[columnKey] = colValues.length > 0 ? aggregateFunc(colValues) : 0;
          }
        });
      });
    } else {
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        const aggregateFunc = config.aggregationFunctions[aggregation];
        
        if (aggregateFunc) {
          const allValues = rowGroup.rows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
          pivotRow[fieldName] = aggregateFunc(allValues);
        }
      });
    }
    
    pivotData.push(pivotRow);
  });
  
  // Step 6: Add grand totals row if needed
  if (config.showGrandTotals && pivotData.length > 0) {
    const grandTotalRow = { isGrandTotal: true };
    
    rows.forEach(rowField => {
      grandTotalRow[rowField] = 'Grand Total';
    });
    
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      const aggregateFunc = config.aggregationFunctions[aggregation];
      
      if (aggregateFunc) {
        const allValues = filteredData.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
        
        if (config.showRowTotals) {
          grandTotalRow[`${fieldName}_total`] = aggregateFunc(allValues);
        }
        
        if (columns.length > 0) {
          columnValues.forEach(colValue => {
            const colRows = filteredData.filter(row => {
              return columns.some(colField => row[colField] === colValue);
            });
            const colValues = colRows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
            const columnKey = `${colValue}_${fieldName}`;
            grandTotalRow[columnKey] = colValues.length > 0 ? aggregateFunc(colValues) : 0;
          });
        } else {
          grandTotalRow[fieldName] = aggregateFunc(allValues);
        }
      }
    });
    
    pivotData.push(grandTotalRow);
  }
  
  // Step 7: Generate pivot columns
  const pivotColumns = generatePivotColumns(config, columnValues);
  
  return { pivotData, pivotColumns, columnValues };
};

// Generate columns for pivot table
export const generatePivotColumns = (config, columnValues) => {
  const { rows, columns, values } = config;
  const pivotColumns = [];
  
  // Add row grouping columns
  rows.forEach(rowField => {
    pivotColumns.push({
      key: rowField,
      title: rowField.charAt(0).toUpperCase() + rowField.slice(1).replace(/([A-Z])/g, ' $1'),
      sortable: true,
      filterable: true,
      type: 'text',
      isPivotRow: true
    });
  });
  
  // Add value columns (when no column grouping)
  if (columns.length === 0) {
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      
      pivotColumns.push({
        key: fieldName,
        title: `${fieldName} (${aggregation})`,
        sortable: true,
        filterable: true,
        type: 'number',
        isPivotValue: true
      });
    });
  } else {
    // Add column-grouped value columns
    columnValues.forEach(colValue => {
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        const columnKey = `${colValue}_${fieldName}`;
        
        pivotColumns.push({
          key: columnKey,
          title: `${colValue} - ${fieldName} (${aggregation})`,
          sortable: true,
          filterable: true,
          type: 'number',
          isPivotValue: true,
          pivotColumn: colValue,
          pivotField: fieldName
        });
      });
    });
  }
  
  // Add row total columns
  if (config.showRowTotals && values.length > 0) {
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      
      pivotColumns.push({
        key: `${fieldName}_total`,
        title: `${fieldName} Total`,
        sortable: true,
        filterable: true,
        type: 'number',
        isPivotTotal: true
      });
    });
  }
  
  return pivotColumns;
};

// Default aggregation functions
export const defaultAggregationFunctions = {
  sum: (values) => values.reduce((a, b) => (a || 0) + (b || 0), 0),
  count: (values) => values.filter(v => v !== null && v !== undefined).length,
  average: (values) => {
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    return validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
  },
  min: (values) => {
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    return validValues.length > 0 ? Math.min(...validValues) : 0;
  },
  max: (values) => {
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    return validValues.length > 0 ? Math.max(...validValues) : 0;
  },
  first: (values) => values.find(v => v !== null && v !== undefined) || '',
  last: (values) => {
    const validValues = values.filter(v => v !== null && v !== undefined);
    return validValues.length > 0 ? validValues[validValues.length - 1] : '';
  }
};

// Merge pivot configuration
export const mergePivotConfig = (enablePivotTable, pivotConfig, individualProps, localPivotConfig, enablePivotUI) => {
  // If pivot UI is enabled, use local config
  if (enablePivotUI && localPivotConfig) {
    return {
      ...pivotConfig,
      ...localPivotConfig,
      aggregationFunctions: {
        ...defaultAggregationFunctions,
        ...pivotConfig.aggregationFunctions,
        ...individualProps.pivotAggregationFunctions
      }
    };
  }
  
  const hasIndividualProps = individualProps.pivotRows.length > 0 || 
                            individualProps.pivotColumns.length > 0 || 
                            individualProps.pivotValues.length > 0;
  
  if (hasIndividualProps) {
    // Use individual props (Plasmic interface)
    return {
      enabled: enablePivotTable,
      rows: individualProps.pivotRows,
      columns: individualProps.pivotColumns,
      values: individualProps.pivotValues,
      filters: individualProps.pivotFilters,
      showGrandTotals: individualProps.pivotShowGrandTotals,
      showRowTotals: individualProps.pivotShowRowTotals,
      showColumnTotals: individualProps.pivotShowColumnTotals,
      showSubTotals: individualProps.pivotShowSubTotals,
      numberFormat: individualProps.pivotNumberFormat,
      currency: individualProps.pivotCurrency,
      precision: individualProps.pivotPrecision,
      fieldSeparator: individualProps.pivotFieldSeparator,
      sortRows: individualProps.pivotSortRows,
      sortColumns: individualProps.pivotSortColumns,
      sortDirection: individualProps.pivotSortDirection,
      aggregationFunctions: {
        ...defaultAggregationFunctions,
        ...pivotConfig.aggregationFunctions,
        ...individualProps.pivotAggregationFunctions
      }
    };
  }
  
  // Use pivotConfig object (direct usage)
  return {
    ...pivotConfig,
    enabled: enablePivotTable && pivotConfig.enabled,
    aggregationFunctions: {
      ...defaultAggregationFunctions,
      ...pivotConfig.aggregationFunctions
    }
  };
}; 