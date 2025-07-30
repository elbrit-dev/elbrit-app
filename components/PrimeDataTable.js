import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Toolbar } from 'primereact/toolbar';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { ContextMenu } from 'primereact/contextmenu';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import Image from 'next/image';


import {
  RefreshCw,
  X,
  Calendar as CalendarIcon
} from "lucide-react";

import { useAuth } from './AuthContext';

// NEW: Direct Plasmic CMS integration functions
const usePlasmicCMS = (workspaceId, tableId, apiToken) => {
  const { user } = useAuth();
  
  // Helper function to check if user has admin permissions
  const isAdminUser = useCallback(() => {
    const ADMIN_ROLE_ID = '6c2a85c7-116e-43b3-a4ff-db11b7858487';
    const userRole = user?.role || user?.roleId;
    return userRole === ADMIN_ROLE_ID;
  }, [user]);
  
  // Helper function to parse page and table names from configKey
  const parseConfigKey = useCallback((configKey) => {
    const parts = configKey.split('_');
    return {
      pageName: parts[0] || 'defaultPage',
      tableName: parts[1] || 'defaultTable'
    };
  }, []);
  
  const saveToCMS = useCallback(async (configKey, pivotConfig) => {
    if (!workspaceId) {
      console.warn('Plasmic workspace ID not provided for CMS integration');
      return null;
    }

    // Check if user has admin permissions
    if (!isAdminUser()) {
      console.warn('🚫 User does not have admin permissions to save configurations');
      throw new Error('Access denied: Only admin users can save pivot configurations');
    }

    // Parse page and table names from configKey
    const { pageName, tableName } = parseConfigKey(configKey);

    // Always use secure API route to avoid CORS issues and improve security
    try {
      const response = await fetch('/api/plasmic-cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          configKey,
          pivotConfig,
          pageName,
          tableName,
          userId: user?.email || null,
          userRole: user?.role || user?.roleId || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new Error(errorData.message || 'Access denied: Only admin users can save pivot configurations');
        }
        throw new Error(`API route failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ CMS SAVE FAILED (API route):', error);
      throw error;
    }
  }, [workspaceId, user, isAdminUser, parseConfigKey]);
  
  const loadFromCMS = useCallback(async (configKey, filterByPage = null, filterByTable = null) => {
    if (!workspaceId) {
      console.warn('Plasmic workspace ID not provided for CMS integration');
      return null;
    }

    // Always use secure API route to avoid CORS issues and improve security
    try {
      const response = await fetch('/api/plasmic-cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'load',
          configKey,
          filterByPage,
          filterByTable
        })
      });

      if (!response.ok) {
        throw new Error(`API route failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.data) {
        return result.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ CMS LOAD FAILED (API route):', error);
      return null;
    }
  }, [workspaceId]);
  
  const listConfigurationsFromCMS = useCallback(async (filterByPage = null, filterByTable = null) => {
    if (!workspaceId) {
      console.warn('Plasmic workspace ID not provided for CMS integration');
      return [];
    }

    // Always use secure API route to avoid CORS issues and improve security
    try {
      const response = await fetch('/api/plasmic-cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'list',
          filterByPage,
          filterByTable
        })
      });

      if (!response.ok) {
        throw new Error(`API route failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('❌ CMS LIST FAILED (API route):', error);
      throw error;
    }
  }, [workspaceId]);

  return { saveToCMS, loadFromCMS, listConfigurationsFromCMS, isAdminUser };
};

// Merge function for combining data from multiple arrays
const mergeData = (by = [], preserve = []) => (tables = {}) => {
  const getKey = row => by.map(k => row?.[k] ?? "").join("||");
  const preserveKey = preserve.find(k => by.includes(k));
  const preserveCache = {};
  
  Object.values(tables).flat().forEach(row => {
    const id = row?.[preserveKey];
    if (!id) return;
    
    preserveCache[id] ??= {};
    preserve.forEach(field => {
      const value = row?.[field];
      if (value !== undefined && value !== null && value !== "" && value !== 0 && !preserveCache[id][field]) {
        preserveCache[id][field] = value;
      }
    });
  });
  
  const mergedMap = Object.values(tables).flat().reduce((acc, row) => {
    const key = getKey(row);
    const existing = acc[key] || {};
    const id = row?.[preserveKey];
    
    acc[key] = {
      ...existing,
      ...row
    };
    
    preserve.forEach(field => {
      const current = acc[key][field];
      if ((current === undefined || current === null || current === "" || current === 0) && id && preserveCache[id]?.[field]) {
        acc[key][field] = preserveCache[id][field];
      }
    });
    
    return acc;
  }, {});
  
  return Object.values(mergedMap);
};

// Helper to detect if data needs merging (object with arrays)
const needsMerging = (data) => {
  return data && 
         typeof data === 'object' && 
         !Array.isArray(data) && 
         Object.values(data).some(val => Array.isArray(val));
};

// Helper to get unique values for a column
const getUniqueValues = (data, key) => {
  return [...new Set(data
    .filter(row => row && typeof row === 'object') // Filter out null/undefined rows
    .map(row => row[key])
    .filter(val => val !== null && val !== undefined))];
};

// Pivot Table Helper Functions
const parsePivotFieldName = (fieldName, config) => {
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
const groupDataBy = (data, groupFields) => {
  const groups = {};
  
  data.forEach(row => {
    if (!row || typeof row !== 'object') return;
    
    // Create a key based on the grouping fields
    const key = groupFields.map(field => row[field] || '').join('|');
    
    if (!groups[key]) {
      groups[key] = {
        key,
        groupValues: {},
        rows: []
      };
      
      // Store the group values for easy access
      groupFields.forEach(field => {
        groups[key].groupValues[field] = row[field];
      });
    }
    
    groups[key].rows.push(row);
  });
  
  return Object.values(groups);
};

  // Transform data into pivot structure
const transformToPivotData = (data, config) => {
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
    
    // Store row-specific aggregated values for meta-aggregation
    const rowMetaAggregationValues = {};
    
    // Add row totals
    if (config.showRowTotals && values.length > 0) {
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        const aggregateFunc = config.aggregationFunctions[aggregation];
        
        if (aggregateFunc) {
          const allValues = rowGroup.rows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
          // Include aggregation type in key to support multiple aggregations for same field
          const totalKey = values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}_total` 
            : `${fieldName}_total`;
          const aggregatedValue = aggregateFunc(allValues);
          pivotRow[totalKey] = aggregatedValue;
          
          // Collect row-specific values for meta-aggregation
          const metaAggregations = config.metaAggregations || [];
          metaAggregations.forEach(metaAgg => {
            if (metaAgg.field === fieldName && metaAgg.sourceAggregation === aggregation) {
              const metaKey = `${fieldName}_${aggregation}_${metaAgg.metaAggregation}`;
              if (!rowMetaAggregationValues[metaKey]) {
                rowMetaAggregationValues[metaKey] = [];
              }
              rowMetaAggregationValues[metaKey].push(aggregatedValue);
            }
          });
        }
      });
    }
    
    // Add column-specific values
    if (columns.length > 0 && columnValues.length > 0) {
      columnValues.forEach(colValue => {
        // Filter rows for this specific column value
        const colRows = rowGroup.rows.filter(row => {
          return columns.some(colField => row[colField] === colValue);
        });
        
        // Calculate aggregated values for each value field
        values.forEach(valueConfig => {
          const fieldName = valueConfig.field;
          const aggregation = valueConfig.aggregation || 'sum';
          const aggregateFunc = config.aggregationFunctions[aggregation];
          
          if (aggregateFunc) {
            const colValues = colRows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
            // Include aggregation type in key to support multiple aggregations for same field
            const columnKey = `${colValue}_${fieldName}_${aggregation}`;
            const aggregatedValue = colValues.length > 0 ? aggregateFunc(colValues) : 0;
            pivotRow[columnKey] = aggregatedValue;
            
            // Collect row-specific values for meta-aggregation
            const metaAggregations = config.metaAggregations || [];
            metaAggregations.forEach(metaAgg => {
              if (metaAgg.field === fieldName && metaAgg.sourceAggregation === aggregation) {
                const metaKey = `${fieldName}_${aggregation}_${metaAgg.metaAggregation}`;
                if (!rowMetaAggregationValues[metaKey]) {
                  rowMetaAggregationValues[metaKey] = [];
                }
                rowMetaAggregationValues[metaKey].push(aggregatedValue);
              }
            });
          }
        });
      });
    } else {
      // No column grouping, just calculate values
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        const aggregateFunc = config.aggregationFunctions[aggregation];
        
        if (aggregateFunc) {
          const allValues = rowGroup.rows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
          // Include aggregation type in key to support multiple aggregations for same field
          const valueKey = values.length > 1 && values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}` 
            : fieldName;
          const aggregatedValue = aggregateFunc(allValues);
          pivotRow[valueKey] = aggregatedValue;
          
          // Collect row-specific values for meta-aggregation
          const metaAggregations = config.metaAggregations || [];
          metaAggregations.forEach(metaAgg => {
            if (metaAgg.field === fieldName && metaAgg.sourceAggregation === aggregation) {
              const metaKey = `${fieldName}_${aggregation}_${metaAgg.metaAggregation}`;
              if (!rowMetaAggregationValues[metaKey]) {
                rowMetaAggregationValues[metaKey] = [];
              }
              rowMetaAggregationValues[metaKey].push(aggregatedValue);
            }
          });
        }
      });
    }
    
    // Step 5.5: Calculate row-specific meta-aggregation results
    Object.keys(rowMetaAggregationValues).forEach(metaKey => {
      const [fieldName, primaryAggregation, metaAggregation] = metaKey.split('_');
      const metaAggregateFunc = config.aggregationFunctions[metaAggregation];
      
      console.log(`🔍 Row-specific meta-aggregation for ${metaKey}:`, {
        rowGroup: rowGroup.groupValues,
        values: rowMetaAggregationValues[metaKey],
        functionExists: !!metaAggregateFunc
      });
      
      if (metaAggregateFunc && rowMetaAggregationValues[metaKey].length > 0) {
        const metaResult = metaAggregateFunc(rowMetaAggregationValues[metaKey]);
        pivotRow[metaKey] = metaResult;
        console.log(`✅ Row-specific meta-aggregation result for ${metaKey}:`, metaResult);
      }
    });
    
    pivotData.push(pivotRow);
  });
  
  // Step 6: Add grand totals row if needed
  if (config.showGrandTotals && pivotData.length > 0) {
    const grandTotalRow = { isGrandTotal: true };
    
    // Set row field values to "Grand Total"
    rows.forEach(rowField => {
      grandTotalRow[rowField] = 'Grand Total';
    });
    
    // Calculate grand totals for each value
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      const aggregateFunc = config.aggregationFunctions[aggregation];
      
      if (aggregateFunc) {
        const allValues = filteredData.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
        
        if (config.showRowTotals) {
          // Include aggregation type in key to support multiple aggregations for same field
          const totalKey = values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}_total` 
            : `${fieldName}_total`;
          grandTotalRow[totalKey] = aggregateFunc(allValues);
        }
        
        if (columns.length > 0) {
          columnValues.forEach(colValue => {
            const colRows = filteredData.filter(row => {
              return columns.some(colField => row[colField] === colValue);
            });
            const colValues = colRows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
            // Include aggregation type in key to support multiple aggregations for same field
            const columnKey = `${colValue}_${fieldName}_${aggregation}`;
            grandTotalRow[columnKey] = colValues.length > 0 ? aggregateFunc(colValues) : 0;
        });
      } else {
          // Include aggregation type in key to support multiple aggregations for same field
          const valueKey = values.length > 1 && values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}` 
            : fieldName;
          grandTotalRow[valueKey] = aggregateFunc(allValues);
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
const generatePivotColumns = (config, columnValues) => {
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
      
      // Include aggregation type in key to support multiple aggregations for same field
      const valueKey = values.length > 1 && values.filter(v => v.field === fieldName).length > 1 
        ? `${fieldName}_${aggregation}` 
        : fieldName;
      
      pivotColumns.push({
        key: valueKey,
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
        // Include aggregation type in key to support multiple aggregations for same field
        const columnKey = `${colValue}_${fieldName}_${aggregation}`;
        
        pivotColumns.push({
          key: columnKey,
          title: `${colValue} - ${fieldName} (${aggregation})`,
          sortable: true,
          filterable: true,
          type: 'number',
          isPivotValue: true,
          pivotColumn: colValue,
          pivotField: fieldName,
          pivotAggregation: aggregation
        });
      });
    });
  }
  
  // Add row total columns
  if (config.showRowTotals && values.length > 0) {
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      
      // Include aggregation type in key to support multiple aggregations for same field
      const totalKey = values.filter(v => v.field === fieldName).length > 1 
        ? `${fieldName}_${aggregation}_total` 
        : `${fieldName}_total`;
      
      pivotColumns.push({
        key: totalKey,
        title: `${fieldName} Total (${aggregation})`,
        sortable: true,
        filterable: true,
        type: 'number',
        isPivotTotal: true
      });
    });
  }
  
  // Add meta-aggregation columns
  const metaAggregations = config.metaAggregations || [];
  metaAggregations.forEach(metaAgg => {
    const metaKey = `${metaAgg.field}_${metaAgg.sourceAggregation}_${metaAgg.metaAggregation}`;
    
    pivotColumns.push({
      key: metaKey,
      title: `${metaAgg.metaAggregation.toUpperCase()} of ${metaAgg.field} (${metaAgg.sourceAggregation})`,
      sortable: true,
      filterable: true,
      type: 'number',
      isPivotMetaAggregation: true,
      metaAggregation: metaAgg.metaAggregation,
      primaryField: metaAgg.field,
      primaryAggregation: metaAgg.sourceAggregation
    });
  });
  
  return pivotColumns;
};

/**
 * PrimeDataTable Component with Configurable Column Filters, Pivot Table Support, and Auto-Merge
 *
 * Auto-Merge Configuration:
 * - enableAutoMerge: Boolean to enable automatic data merging for object with arrays
 * - mergeConfig: Object with merge configuration
 *   Example: {
 *     by: ["drCode", "date"], // Fields to merge by
 *     preserve: ["drName", "salesTeam"], // Fields to preserve across merges
 *     autoDetectMergeFields: true, // Auto-detect common fields for merging
 *     mergeStrategy: "combine" // "combine" or "replace"
 *   }
 *
 * Filter Configuration Props:
 * - dropdownFilterColumns: Array of column keys that should use dropdown filters
 *   Example: ["salesteam", "status", "category"]
 *
 * - datePickerFilterColumns: Array of column keys that should use date picker filters
 *   Example: ["createdDate", "updatedDate", "dueDate"]
 *
 * - numberFilterColumns: Array of column keys that should use number filters
 *   Example: ["amount", "quantity", "price"]
 *
 * - textFilterColumns: Array of column keys that should use text filters
 *   Example: ["name", "description", "notes"]
 *
 * - booleanFilterColumns: Array of column keys that should use boolean filters
 *   Example: ["isActive", "isCompleted", "isPublished"]
 *
 * - customFilterOptions: Object with column keys as keys and array of options as values
 *   Example: {
 *     "salesteam": [
 *       { label: "All", value: null },
 *       { label: "Team A", value: "team_a" },
 *       { label: "Team B", value: "team_b" }
 *     ]
 *   }
 *
 * Pivot Table Configuration:
 * - enablePivotTable: Boolean to enable pivot table functionality
 * - pivotConfig: Object with pivot configuration
 *   Example: {
 *     enabled: true,
 *     rows: ["drName", "salesTeam"], // Row grouping fields
 *     columns: ["date"], // Column grouping fields  
 *     values: [
 *       { field: "serviceAmount", aggregation: "sum" },
 *       { field: "supportValue", aggregation: "sum" }
 *     ],
 *     showGrandTotals: true,
 *     showRowTotals: true
 *   }
 *
 * Usage Examples:
 * 
 * Basic Table:
 * <PrimeDataTable
 *   data={salesData}
 *   dropdownFilterColumns={["salesteam", "status"]}
 *   datePickerFilterColumns={["createdDate"]}
 *   numberFilterColumns={["amount"]}
 * />
 *
 * Auto-Merge with Column Grouping:
 * <PrimeDataTable
 *   data={$queries.serviceVsSupport.data.response.data} // {service: [...], support: [...]}
 *   enableAutoMerge={true}
 *   enableColumnGrouping={true}
 *   enableAutoColumnGrouping={true}
 *   mergeConfig={{
 *     by: ["drCode", "date"], // Merge by doctor code and date
 *     preserve: ["drName", "salesTeam"], // Preserve these fields
 *     autoDetectMergeFields: true
 *   }}
 *   groupConfig={{
 *     customGroupMappings: {
 *       service: "Service",
 *       support: "Support"
 *     },
 *     ungroupedColumns: ["drCode", "drName", "salesTeam", "date"]
 *   }}
 * />
 *
 * Pivot Table:
 * <PrimeDataTable
 *   data={salesData}
 *   enablePivotTable={true}
 *   pivotConfig={{
 *     enabled: true,
 *     rows: ["drName", "salesTeam"],
 *     columns: ["date"],
 *     values: [
 *       { field: "serviceAmount", aggregation: "sum" },
 *       { field: "supportValue", aggregation: "average" }
 *     ],
 *     showGrandTotals: true,
 *     showRowTotals: true,
 *     fieldSeparator: "__", // For parsing "2025-04-01__serviceAmount" style fields
 *     numberFormat: "en-US",
 *     currency: "USD"
 *   }}
 *   currencyColumns={["serviceAmount", "supportValue"]}
 * />
 */

const PrimeDataTable = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  error = null,
  fields = [],
  imageFields = [],
  popupImageFields = [],
  currencyColumns = [], // Array of column keys that should be formatted as currency in footer totals
  
  // Auto-merge configuration
  enableAutoMerge = false, // Enable automatic data merging for object with arrays
  mergeConfig = {
    by: [], // Fields to merge by (e.g., ['drCode', 'date'])
    preserve: [], // Fields to preserve across merges (e.g., ['drName', 'salesTeam'])
    autoDetectMergeFields: true, // Auto-detect common fields for merging
    mergeStrategy: 'combine' // 'combine' or 'replace'
  },
  
  // Filter configuration props
  dropdownFilterColumns = [], // Array of column keys that should use dropdown filters
  datePickerFilterColumns = [], // Array of column keys that should use date picker filters
  numberFilterColumns = [], // Array of column keys that should use number filters
  textFilterColumns = [], // Array of column keys that should use text filters
  booleanFilterColumns = [], // Array of column keys that should use boolean filters
  customFilterOptions = {}, // Object with column keys as keys and array of options as values
  
  // GraphQL props
  graphqlQuery = null,
  graphqlVariables = {},
  onGraphqlData,
  refetchInterval = 0,
  
  // Table configuration - All features are now toggleable
  enableSearch = true,
  enableColumnFilter = true,
  enableSorting = true,
  enablePagination = true,
  enableRowSelection = false,
  enableExport = true,
  enableRefresh = false,
  enableColumnManagement = true,
  enableBulkActions = false,
  enableGlobalFilter = true,
  enableFilterMenu = true,
  enableFilterMatchModes = true,
  enableFilterClear = true,
  enableFilterApply = true,
  enableFilterFooter = true,
  enableGridLines = true,
  enableStripedRows = true,
  enableHoverEffect = true,
  enableResizableColumns = false,
  enableReorderableColumns = false,
  enableVirtualScrolling = false,
  enableLazyLoading = false,
  enableRowGrouping = false,
  enableRowExpansion = false,
  enableFrozenColumns = false,
  enableFrozenRows = false,
  
  // Pagination
  pageSize = 10,
  currentPage = 1,
  pageSizeOptions = [5, 10, 25, 50, 100],
  
  // Styling
  className = "",
  style = {},


  tableSize = "normal", // small, normal, large

  


  // Event handlers
  onRowClick,
  onRowSelect,
  onExport,
  onRefresh,
  onPageChange,
  onFilterChange,
  onSortChange,
  onSearch,
  onBulkAction,
  
  // Action buttons
  rowActions = [],
  bulkActions = [],
  enableRowActions = false,
  
  // Advanced filter options
  filterDisplay = "menu", // menu, row
  forceFilterDisplayWithGrouping = false, // Force specific filterDisplay mode even with grouping
  globalFilterFields = [],
  showFilterMatchModes = true,
  filterDelay = 300,
  globalFilterPlaceholder = "Search...",
  filterLocale = "en",
  
  // Inline editing
  enableInlineEditing = false,
  editingRows = null,
  onRowEditSave = null,
  onRowEditCancel = null,
  onRowEditInit = null,
  onEditingRowsChange = null,
  
  // Context menu
  enableContextMenu = false,
  contextMenu = null,
  contextMenuSelection = null,
  onContextMenuSelectionChange = null,
  onContextMenu = null,
  
  // Advanced pagination
  showFirstLastIcon = true,
  showPageLinks = true,
  showCurrentPageReport = true,
  currentPageReportTemplate = "Showing {first} to {last} of {totalRecords} entries",
  
  // Advanced export
  exportFilename = "data",
  exportFileType = "csv", // csv, excel, pdf
  enableExcelExport = false,
  enablePdfExport = false,
  
  // Advanced selection
  selectionMode = "multiple", // single, multiple, checkbox
  metaKeySelection = true,
  selectOnEdit = false,
  
  // Custom templates
  customTemplates = {},
  customFormatters = {},
  
  // Column grouping props
  enableColumnGrouping = false,
  enableAutoColumnGrouping = false, // New: Auto-detect column groups from data
  headerColumnGroup = null,
  footerColumnGroup = null,
  columnGroups = [],
  groupConfig = {
    enableHeaderGroups: true,
    enableFooterGroups: true,
    groupStyle: {},
    headerGroupStyle: {},
    footerGroupStyle: {},
    groupingPatterns: [], // Custom patterns for grouping
    ungroupedColumns: [], // Columns that should not be grouped
    totalColumns: [], // Columns that represent totals
    groupSeparator: '__', // Default separator for detecting groups
    customGroupMappings: {} // Custom word to group name mappings e.g., { "inventory": "Inventory", "warehouse": "Warehouse" }
  },
  
  // Footer totals props
  enableFooterTotals = false,
  enableFixedFooterTotals = false, // NEW: Always show footer totals at bottom, even with pivot
  footerTotalsConfig = {
    showTotals: true,
    showAverages: false,
    showCounts: true,
    numberFormat: 'en-US',
    currency: 'USD',
    precision: 2
  },
  
  // NEW: ROI Calculation Props
  enableROICalculation = false, // Enable ROI calculation feature
  roiConfig = {
    // ROI calculation fields
    revenueField: 'revenue', // Field name for revenue data
    costField: 'cost', // Field name for cost data
    investmentField: 'investment', // Field name for investment data
    profitField: 'profit', // Field name for profit data (optional, will be calculated if not provided)
    
    // ROI calculation formula: ROI = ((Revenue - Cost) / Investment) * 100
    // Alternative: ROI = (Profit / Investment) * 100
    calculationMethod: 'standard', // 'standard' (revenue-cost/investment) or 'profit' (profit/investment)
    
    // Display options
    showROIColumn: true, // Show ROI as a separate column
    showROIAsPercentage: true, // Display ROI as percentage
    roiColumnTitle: 'ROI (%)', // Title for ROI column
    roiColumnKey: 'roi', // Key for ROI column in data
    
    // Formatting options
    roiNumberFormat: 'en-US',
    roiPrecision: 2, // Decimal places for ROI
    roiCurrency: 'USD',
    
    // Color coding for ROI values
    enableROIColorCoding: true,
    roiColorThresholds: {
      positive: '#22c55e', // Green for positive ROI
      neutral: '#6b7280', // Gray for neutral ROI
      negative: '#ef4444' // Red for negative ROI
    },
    
    // Thresholds for color coding
    positiveROIThreshold: 0, // Values >= this are positive
    negativeROIThreshold: 0, // Values < this are negative
    
    // Custom ROI calculation function (optional)
    customROICalculation: null, // Custom function for ROI calculation
  },
  
  // NEW: Total display preference - controls which type of totals to show
  totalDisplayMode = "auto", // "auto" (smart), "pivot" (only pivot), "footer" (only footer), "both" (show both), "none" (no totals)
  
  // Pivot Table Props - Excel-like pivot functionality  
  enablePivotTable = false,
  
  // NEW: Pivot UI Configuration Props
  enablePivotUI = true, // Enable pivot configuration UI panel
  pivotUIPosition = "toolbar", // "toolbar", "panel", "sidebar"
  
  // NEW: CMS Persistence Props
  enablePivotPersistence = true, // Enable saving pivot config to CMS
  pivotConfigKey = "pivotConfig", // Key for storing in CMS (e.g., "dashboardPage_salesTable_pivotConfig")
  onSavePivotConfig = null, // Callback to save config to CMS (deprecated - use direct integration)
  onLoadPivotConfig = null, // Callback to load config from CMS (deprecated - use direct integration)
  autoSavePivotConfig = false, // Auto-save changes to CMS (disabled by default for explicit control)
  
  // NEW: Direct Plasmic CMS Integration Props
  plasmicWorkspaceId = null, // Plasmic workspace ID for CMS integration
  plasmicTableConfigsId = null, // TableConfigs table ID for CMS integration
  plasmicApiToken = null, // Plasmic API token for direct CMS integration
  useDirectCMSIntegration = true, // Use direct CMS integration instead of callback props
  
  // Individual pivot props for Plasmic interface
  pivotRows = [],
  pivotColumns = [],
  pivotValues = [],
  pivotFilters = [],
  pivotShowGrandTotals = true,
  pivotShowRowTotals = true,
  pivotShowColumnTotals = true,
  pivotShowSubTotals = true,
  pivotNumberFormat = "en-US",
  pivotCurrency = "USD",
  pivotPrecision = 2,
  pivotFieldSeparator = "__",
  pivotSortRows = true,
  pivotSortColumns = true,
  pivotSortDirection = "asc",
  pivotAggregationFunctions = {},
  
  // Combined pivot config object (alternative to individual props)
  pivotConfig = {
    enabled: false,
    rows: [], // Array of field names to use as row grouping (like Excel's "Rows" area)
    columns: [], // Array of field names to use as column headers (like Excel's "Columns" area)  
    values: [], // Array of objects with field name and aggregation function (like Excel's "Values" area)
    filters: [], // Array of field names to use as pivot filters (like Excel's "Filters" area)
    
    // Aggregation functions
    aggregationFunctions: {
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
    },
    
    // Display options
    showGrandTotals: true,
    showSubTotals: true,
    showRowTotals: true,
    showColumnTotals: true,
    
    // Formatting options
    numberFormat: 'en-US',
    currency: 'USD',
    precision: 2,
    
    // Data parsing options for complex field names like "2025-04-01__serviceAmount"
    fieldSeparator: '__', // Separator used in field names to split date/category and metric
    dateFieldPattern: /^\d{4}-\d{2}-\d{2}$/, // Pattern to identify date fields
    
    // Custom field parsing functions
    parseFieldName: null, // Custom function to parse complex field names
    formatFieldName: null, // Custom function to format field names for display
    
    // Grouping options
    sortRows: true,
    sortColumns: true,
    sortDirection: 'asc' // 'asc' or 'desc'
  }
}) => {
  // Local state
  const [selectedRows, setSelectedRows] = useState([]);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState("");
  const [imageModalAlt, setImageModalAlt] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  
  // Inline editing state
  const [localEditingRows, setLocalEditingRows] = useState(editingRows || {});
  
  // Context menu state
  const [localContextMenuSelection, setLocalContextMenuSelection] = useState(contextMenuSelection || null);
  const contextMenuRef = useRef(null);

  // GraphQL data state
  const [graphqlData, setGraphqlData] = useState([]);
  const [graphqlLoading, setGraphqlLoading] = useState(false);
  const [graphqlError, setGraphqlError] = useState(null);

  // Pivot table state
  const [pivotDataCache, setPivotDataCache] = useState(null);
  const [pivotColumnsCache, setPivotColumnsCache] = useState([]);
  
  // NEW: Pivot UI Configuration State
  const [showPivotConfig, setShowPivotConfig] = useState(false);
  const [localPivotConfig, setLocalPivotConfig] = useState({
    enabled: enablePivotTable,
    rows: [],
    columns: [],
    values: [],
    filters: [],
    metaAggregations: [],
    showGrandTotals: true,
    showRowTotals: true,
    showColumnTotals: true,
    showSubTotals: true
  });
  
  // NEW: CMS Persistence State
  const [isLoadingPivotConfig, setIsLoadingPivotConfig] = useState(false);
  const [isSavingPivotConfig, setIsSavingPivotConfig] = useState(false);
  const [pivotConfigLoaded, setPivotConfigLoaded] = useState(false);

  // NEW: Direct Plasmic CMS Integration
  const { saveToCMS: directSaveToCMS, loadFromCMS: directLoadFromCMS, listConfigurationsFromCMS, isAdminUser } = usePlasmicCMS(
    plasmicWorkspaceId || process.env.PLASMIC_WORKSPACE_ID || 'uP7RbyUnivSX75FTKL9RLp',
    plasmicTableConfigsId || process.env.PLASMIC_TABLE_CONFIGS_ID || 'o4o5VRFTDgHHmQ31fCfkuz',
    plasmicApiToken || process.env.PLASMIC_API_TOKEN
  );

  // NEW: ROI Calculation Functions
  const calculateROI = useCallback((rowData) => {
    if (!enableROICalculation || !roiConfig) return null;

    const { 
      revenueField, 
      costField, 
      investmentField, 
      profitField, 
      calculationMethod,
      customROICalculation 
    } = roiConfig;

    // Use custom calculation if provided
    if (customROICalculation && typeof customROICalculation === 'function') {
      return customROICalculation(rowData);
    }

    // Get values from row data
    const revenue = parseFloat(rowData[revenueField]) || 0;
    const cost = parseFloat(rowData[costField]) || 0;
    const investment = parseFloat(rowData[investmentField]) || 0;
    const profit = parseFloat(rowData[profitField]) || 0;

    // Prevent division by zero
    if (investment === 0) return 0;

    let roiValue = 0;

    if (calculationMethod === 'profit') {
      // ROI = (Profit / Investment) * 100
      roiValue = (profit / investment) * 100;
    } else {
      // Standard: ROI = ((Revenue - Cost) / Investment) * 100
      roiValue = ((revenue - cost) / investment) * 100;
    }

    return roiValue;
  }, [enableROICalculation, roiConfig]);

  const getROIColor = useCallback((roiValue) => {
    if (!roiConfig?.enableROIColorCoding) return null;

    const { roiColorThresholds, positiveROIThreshold, negativeROIThreshold } = roiConfig;

    if (roiValue >= positiveROIThreshold) {
      return roiColorThresholds.positive;
    } else if (roiValue < negativeROIThreshold) {
      return roiColorThresholds.negative;
    } else {
      return roiColorThresholds.neutral;
    }
  }, [roiConfig]);

  const formatROIValue = useCallback((roiValue) => {
    if (roiValue === null || roiValue === undefined) return 'N/A';

    const { roiNumberFormat, roiPrecision, showROIAsPercentage } = roiConfig;

    if (showROIAsPercentage) {
      return new Intl.NumberFormat(roiNumberFormat, {
        minimumFractionDigits: roiPrecision,
        maximumFractionDigits: roiPrecision
      }).format(roiValue) + '%';
    } else {
      return new Intl.NumberFormat(roiNumberFormat, {
        minimumFractionDigits: roiPrecision,
        maximumFractionDigits: roiPrecision
      }).format(roiValue);
    }
  }, [roiConfig]);

  // Built-in default save function for local storage fallback
  const defaultSaveToCMS = useCallback(async (configKey, config) => {
    try {
      // Save to localStorage as fallback
      const storageKey = `pivotConfig_${configKey}`;
      localStorage.setItem(storageKey, JSON.stringify(config));
      console.log('✅ Pivot config saved to localStorage:', storageKey, config);
      return true;
    } catch (error) {
      console.error('❌ Failed to save pivot config:', error);
      return false;
    }
  }, []);

  const defaultLoadFromCMS = useCallback(async (configKey) => {
    try {
      // Load from localStorage as fallback
      const storageKey = `pivotConfig_${configKey}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const config = JSON.parse(stored);
        console.log('✅ Pivot config loaded from localStorage:', storageKey, config);
        return config;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to load pivot config:', error);
      return null;
    }
  }, []);

  // Choose between direct CMS integration, callback props, or built-in defaults
  const finalSaveToCMS = useDirectCMSIntegration && directSaveToCMS 
    ? directSaveToCMS 
    : (onSavePivotConfig || defaultSaveToCMS);
  
  const finalLoadFromCMS = useDirectCMSIntegration && directLoadFromCMS 
    ? directLoadFromCMS 
    : (onLoadPivotConfig || defaultLoadFromCMS);

  // Load pivot configuration from CMS on component mount
  useEffect(() => {
    const loadPivotConfig = async () => {
      if (!enablePivotPersistence || !finalLoadFromCMS || pivotConfigLoaded) return;
      
      setIsLoadingPivotConfig(true);
      try {
        // console.log('📥 LOADING FROM CMS - Config Key:', pivotConfigKey);
        
        const savedConfig = await finalLoadFromCMS(pivotConfigKey);
        if (savedConfig && typeof savedConfig === 'object') {
          // console.log('✅ CMS LOAD SUCCESSFUL:', savedConfig);
          setLocalPivotConfig(prev => ({
            ...prev,
            ...savedConfig
          }));
          
          // If config was enabled, set pivot enabled state
          if (savedConfig.enabled) {
            setIsPivotEnabled(true);
          }
        } else {
          // console.log('📭 NO SAVED CONFIG FOUND FOR:', pivotConfigKey);
        }
      } catch (error) {
        console.error('❌ CMS LOAD FAILED:', error);
      } finally {
        setIsLoadingPivotConfig(false);
        setPivotConfigLoaded(true);
      }
    };

    loadPivotConfig();
  }, [enablePivotPersistence, finalLoadFromCMS, pivotConfigKey, pivotConfigLoaded]);

  // Save pivot configuration to CMS when it changes
  useEffect(() => {
    const savePivotConfig = async () => {
      if (!enablePivotPersistence || !finalSaveToCMS || !autoSavePivotConfig || !pivotConfigLoaded || !isAdminUser()) return;
      
      setIsSavingPivotConfig(true);
      try {
        // console.log('Auto-saving pivot config to CMS:', localPivotConfig);
        await finalSaveToCMS(pivotConfigKey, localPivotConfig);
      } catch (error) {
        console.error('❌ AUTO-SAVE FAILED:', error);
      } finally {
        setIsSavingPivotConfig(false);
      }
    };

    // Debounce save operations to avoid too many CMS calls
    const saveTimeout = setTimeout(savePivotConfig, 1000);
    return () => clearTimeout(saveTimeout);
  }, [localPivotConfig, enablePivotPersistence, finalSaveToCMS, autoSavePivotConfig, pivotConfigKey, pivotConfigLoaded, isAdminUser]);

  // Merge individual pivot props with pivotConfig object
  const mergedPivotConfig = useMemo(() => {
    // NEW: If pivot UI is enabled, use local config
    if (enablePivotUI && localPivotConfig) {
      const config = {
        ...pivotConfig.aggregationFunctions && { aggregationFunctions: pivotConfig.aggregationFunctions },
        ...localPivotConfig,
        aggregationFunctions: {
          ...pivotConfig.aggregationFunctions,
          ...pivotAggregationFunctions
        }
      };
      // console.log('Using pivot UI config:', config);
      return config;
    }
    
    const hasIndividualProps = pivotRows.length > 0 || pivotColumns.length > 0 || pivotValues.length > 0;
    
    // console.log('MergedPivotConfig Debug:', {
    //   hasIndividualProps,
    //   enablePivotTable,
    //   pivotRows,
    //   pivotColumns,
    //   pivotValues,
    //   pivotConfigEnabled: pivotConfig.enabled
    // });
    
    if (hasIndividualProps) {
      // Use individual props (Plasmic interface)
      const config = {
        enabled: enablePivotTable,
        rows: pivotRows,
        columns: pivotColumns,
        values: pivotValues,
        filters: pivotFilters,
        showGrandTotals: pivotShowGrandTotals,
        showRowTotals: pivotShowRowTotals,
        showColumnTotals: pivotShowColumnTotals,
        showSubTotals: pivotShowSubTotals,
        numberFormat: pivotNumberFormat,
        currency: pivotCurrency,
        precision: pivotPrecision,
        fieldSeparator: pivotFieldSeparator,
        sortRows: pivotSortRows,
        sortColumns: pivotSortColumns,
        sortDirection: pivotSortDirection,
        aggregationFunctions: {
          ...pivotConfig.aggregationFunctions,
          ...pivotAggregationFunctions
        }
      };
      // console.log('Using individual props config:', config);
      return config;
    }
    
    // Use pivotConfig object (direct usage)
    const config = {
      ...pivotConfig,
      enabled: enablePivotTable && pivotConfig.enabled
    };
    // console.log('Using pivotConfig object:', config);
    return config;
  }, [
    enablePivotTable, pivotRows, pivotColumns, pivotValues, pivotFilters,
    pivotShowGrandTotals, pivotShowRowTotals, pivotShowColumnTotals, pivotShowSubTotals,
    pivotNumberFormat, pivotCurrency, pivotPrecision, pivotFieldSeparator,
    pivotSortRows, pivotSortColumns, pivotSortDirection, pivotAggregationFunctions,
    pivotConfig, enablePivotUI, localPivotConfig
  ]);

  const [isPivotEnabled, setIsPivotEnabled] = useState(enablePivotTable && mergedPivotConfig.enabled);

  // Update isPivotEnabled when props change
  useEffect(() => {
    setIsPivotEnabled(enablePivotTable && mergedPivotConfig.enabled);
  }, [enablePivotTable, mergedPivotConfig.enabled]);

  // Compute effective total display settings based on totalDisplayMode
  const effectiveTotalSettings = useMemo(() => {
    const isPivotActive = isPivotEnabled && mergedPivotConfig?.enabled;
    
    // NEW: If fixed footer totals is enabled, always show footer totals regardless of pivot
    if (enableFixedFooterTotals) {
      return {
        showPivotTotals: isPivotActive,
        showFooterTotals: true // Always show footer totals when fixed footer is enabled
      };
    }
    
    switch (totalDisplayMode) {
      case "pivot":
        return {
          showPivotTotals: true,
          showFooterTotals: false
        };
      case "footer":
        return {
          showPivotTotals: false,
          showFooterTotals: true
        };
      case "both":
        return {
          showPivotTotals: true,
          showFooterTotals: true
        };
      case "none":
        return {
          showPivotTotals: false,
          showFooterTotals: false
        };
      case "auto":
      default:
        // Auto mode: prefer pivot totals when pivot is active, footer totals otherwise
        if (isPivotActive) {
          return {
            showPivotTotals: true,
            showFooterTotals: false // Hide footer totals when pivot is active
          };
        } else {
          return {
            showPivotTotals: false,
            showFooterTotals: enableFooterTotals
          };
        }
    }
  }, [totalDisplayMode, isPivotEnabled, mergedPivotConfig?.enabled, enableFooterTotals, enableFixedFooterTotals]);

  // Apply effective total settings to pivot config
  const adjustedPivotConfig = useMemo(() => {
    // Ensure we always have valid formatting defaults
    const defaultConfig = {
      enabled: false,
      rows: [],
      columns: [],
      values: [],
      filters: [],
      showGrandTotals: false,
      showRowTotals: false,
      showColumnTotals: false,
      showSubTotals: false,
      numberFormat: 'en-US',
      currency: 'USD',
      precision: 2,
      fieldSeparator: '__',
      sortRows: true,
      sortColumns: true,
      sortDirection: 'asc',
      aggregationFunctions: {}
    };

    if (!mergedPivotConfig) {
      return defaultConfig;
    }

    if (!effectiveTotalSettings.showPivotTotals) {
      // If pivot totals are disabled, turn off all pivot totals but preserve formatting
      return {
        ...defaultConfig,
        ...mergedPivotConfig,
        showGrandTotals: false,
        showRowTotals: false,
        showColumnTotals: false,
        showSubTotals: false
      };
    }

    // Merge with defaults to ensure all formatting properties exist
    return {
      ...defaultConfig,
      ...mergedPivotConfig
    };
  }, [mergedPivotConfig, effectiveTotalSettings.showPivotTotals]);

  // Process data - handle merging if needed
  const processedData = useMemo(() => {
    let rawData = graphqlQuery ? graphqlData : data;
    
    // Check if data needs merging (object with arrays)
    if (enableAutoMerge && needsMerging(rawData)) {
      
      const { by, preserve, autoDetectMergeFields, mergeStrategy } = mergeConfig;
      
      // Auto-detect merge fields if enabled
      let mergeBy = by;
      let mergePreserve = preserve;
      
      if (autoDetectMergeFields) {
        // Get all unique keys from all arrays
        const allKeys = new Set();
        Object.values(rawData).forEach(array => {
          if (Array.isArray(array)) {
            array.forEach(row => {
              if (row && typeof row === 'object') {
                Object.keys(row).forEach(key => allKeys.add(key));
              }
            });
          }
        });
        
        // Find common fields across all arrays (potential merge keys)
        const commonFields = Array.from(allKeys).filter(key => {
          return Object.values(rawData).every(array => 
            Array.isArray(array) && array.some(row => row && key in row)
          );
        });
        
        // Auto-detect merge fields (common fields that look like IDs or dates)
        if (mergeBy.length === 0) {
          mergeBy = commonFields.filter(field => 
            field.toLowerCase().includes('id') || 
            field.toLowerCase().includes('code') || 
            field.toLowerCase().includes('date') ||
            field.toLowerCase().includes('key')
          );
          
          // If no obvious merge fields, use first common field
          if (mergeBy.length === 0 && commonFields.length > 0) {
            mergeBy = [commonFields[0]];
          }
        }
        
        // Auto-detect preserve fields (common fields that should be preserved)
        if (mergePreserve.length === 0) {
          mergePreserve = commonFields.filter(field => 
            field.toLowerCase().includes('name') || 
            field.toLowerCase().includes('team') || 
            field.toLowerCase().includes('hq') ||
            field.toLowerCase().includes('location')
          );
        }
      }
      
      console.log('Merge configuration:', { mergeBy, mergePreserve });
      
      // Perform the merge
      if (mergeBy.length > 0) {
        const mergeFunction = mergeData(mergeBy, mergePreserve);
        const mergedData = mergeFunction(rawData);
        return mergedData;
      } else {
        // If no merge fields detected, flatten the data with group markers
        const flattenedData = [];
        Object.entries(rawData).forEach(([groupKey, array]) => {
          if (Array.isArray(array)) {
            array.forEach(row => {
              if (row && typeof row === 'object') {
                flattenedData.push({
                  ...row,
                  __group: groupKey // Add group marker for column grouping
                });
              }
            });
          }
        });
        return flattenedData;
      }
    }
    
    // NEW: Add ROI calculation to processed data
    let finalData = rawData;
    
    if (enableROICalculation && Array.isArray(rawData)) {
      finalData = rawData.map(row => {
        if (row && typeof row === 'object') {
          const roiValue = calculateROI(row);
          return {
            ...row,
            [roiConfig.roiColumnKey]: roiValue
          };
        }
        return row;
      });
    }
    
    return finalData;
  }, [data, graphqlData, graphqlQuery, enableAutoMerge, mergeConfig, enableROICalculation, calculateROI, roiConfig]);

  // Use processed data
  const tableData = processedData;
  const isLoading = graphqlQuery ? graphqlLoading : loading;
  const tableError = graphqlQuery ? graphqlError : error;

  // Pivot data transformation
  const pivotTransformation = useMemo(() => {
    // console.log('Pivot Transformation Check:', {
    //   isPivotEnabled,
    //   mergedPivotConfigEnabled: mergedPivotConfig.enabled,
    //   mergedPivotConfig: mergedPivotConfig
    // });

    if (!isPivotEnabled || !adjustedPivotConfig.enabled) {
      // console.log('Pivot disabled - returning original data');
      return { 
        pivotData: tableData, 
        pivotColumns: [], 
        columnValues: [], 
        isPivot: false 
      };
    }

    try {
      // console.log('Transforming data to pivot...');
      const result = transformToPivotData(tableData, adjustedPivotConfig);
      // console.log('Pivot transformation result:', result);
      
      return {
        ...result,
        isPivot: true
      };
    } catch (error) {
      console.error('Error transforming data to pivot:', error);
      return { 
        pivotData: tableData, 
        pivotColumns: [], 
        columnValues: [], 
        isPivot: false 
      };
    }
  }, [tableData, isPivotEnabled, adjustedPivotConfig]);

  // Final data source - either original data or pivot data
  const finalTableData = pivotTransformation.isPivot ? pivotTransformation.pivotData : tableData;
  const hasPivotData = pivotTransformation.isPivot && pivotTransformation.pivotData.length > 0;

  // NEW: Helper functions for pivot configuration UI
  const getAvailableFields = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    
    const sampleRow = tableData[0];
    if (!sampleRow || typeof sampleRow !== 'object') return [];
    
    return Object.keys(sampleRow).map(key => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      value: key,
      type: typeof sampleRow[key] === 'number' ? 'number' : 
            typeof sampleRow[key] === 'boolean' ? 'boolean' :
            typeof sampleRow[key] === 'string' && /^\d{4}-\d{2}-\d{2}/.test(sampleRow[key]) ? 'date' : 'text'
    }));
  }, [tableData]);

  const getNumericFields = useMemo(() => {
    return getAvailableFields.filter(field => field.type === 'number');
  }, [getAvailableFields]);

  const getCategoricalFields = useMemo(() => {
    return getAvailableFields.filter(field => field.type !== 'number');
  }, [getAvailableFields]);

  const aggregationOptions = [
    { label: 'Sum', value: 'sum' },
    { label: 'Count', value: 'count' },
    { label: 'Average', value: 'average' },
    { label: 'Min', value: 'min' },
    { label: 'Max', value: 'max' },
    { label: 'First', value: 'first' },
    { label: 'Last', value: 'last' }
  ];

  // Apply pivot configuration (UI only - temporary)
  const applyPivotConfig = useCallback(() => {
    if (enablePivotUI) {
      // Update the merged pivot config with local config
      const newConfig = { ...mergedPivotConfig, ...localPivotConfig };
      // console.log('Applying pivot config (UI only):', newConfig);
      setIsPivotEnabled(newConfig.enabled && newConfig.rows.length > 0);
    }
    setShowPivotConfig(false);
  }, [localPivotConfig, mergedPivotConfig, enablePivotUI]);

  // Apply AND Save pivot configuration to CMS
  const applyAndSavePivotConfig = useCallback(async () => {
    if (enablePivotUI) {
      // First apply to UI
      const newConfig = { ...mergedPivotConfig, ...localPivotConfig };
      // console.log('Applying and saving pivot config:', newConfig);
      setIsPivotEnabled(newConfig.enabled && newConfig.rows.length > 0);
      
      // Then save to CMS (only if user is admin)
      if (enablePivotPersistence && finalSaveToCMS && isAdminUser()) {
        try {
          setIsSavingPivotConfig(true);
          await finalSaveToCMS(pivotConfigKey, localPivotConfig);
        } catch (error) {
          console.error('❌ CMS SAVE FAILED:', error);
          // Optionally show error notification to user
        } finally {
          setIsSavingPivotConfig(false);
        }
      } else if (enablePivotPersistence && !isAdminUser()) {
        // Pivot config applied locally but not saved to CMS (requires admin permissions)
      }
    }
    setShowPivotConfig(false);
  }, [localPivotConfig, mergedPivotConfig, enablePivotUI, enablePivotPersistence, finalSaveToCMS, pivotConfigKey, isAdminUser]);

  // Reset pivot configuration
  const resetPivotConfig = useCallback(async () => {
    const defaultConfig = {
      enabled: false,
      rows: [],
      columns: [],
      values: [],
      filters: [],
      showGrandTotals: true,
      showRowTotals: true,
      showColumnTotals: true,
      showSubTotals: true
    };
    
    setLocalPivotConfig(defaultConfig);
    setIsPivotEnabled(false);
    
    // Save reset config to CMS (only if user is admin)
    if (enablePivotPersistence && finalSaveToCMS && isAdminUser()) {
      try {
        setIsSavingPivotConfig(true);
        await finalSaveToCMS(pivotConfigKey, defaultConfig);
        // console.log('🔄 RESET CONFIG SAVED TO CMS');
      } catch (error) {
        console.error('❌ FAILED TO SAVE RESET CONFIG:', error);
      } finally {
        setIsSavingPivotConfig(false);
      }
    } else if (enablePivotPersistence && !isAdminUser()) {
      // Pivot config reset locally but not saved to CMS (requires admin permissions)
    }
  }, [enablePivotPersistence, finalSaveToCMS, pivotConfigKey, isAdminUser]);

  // Manual save function for CMS persistence (admin only)
  const savePivotConfigManually = useCallback(async () => {
    if (!enablePivotPersistence || !finalSaveToCMS) return;
    
    if (!isAdminUser()) {
      console.warn('🚫 Manual save denied: Only admin users can save pivot configurations');
      throw new Error('Access denied: Only admin users can save pivot configurations');
    }
    
    setIsSavingPivotConfig(true);
    try {
      // console.log('💾 MANUAL SAVE TO CMS - Config Key:', pivotConfigKey);
      // console.log('📊 MANUAL SAVE TO CMS - Pivot Config:', localPivotConfig);
      
      await finalSaveToCMS(pivotConfigKey, localPivotConfig);
      
      // console.log('✅ MANUAL CMS SAVE SUCCESSFUL!');
    } catch (error) {
      console.error('❌ MANUAL CMS SAVE FAILED:', error);
      throw error;
    } finally {
      setIsSavingPivotConfig(false);
    }
  }, [localPivotConfig, enablePivotPersistence, finalSaveToCMS, pivotConfigKey, isAdminUser]);

  const getColumnType = useCallback((column) => {
    const key = column.key;

    if (dropdownFilterColumns?.includes(key)) return 'dropdown';
    if (numberFilterColumns?.includes(key)) return 'number';
    if (datePickerFilterColumns?.includes(key)) return 'date';
    if (booleanFilterColumns?.includes(key)) return 'boolean';
    if (textFilterColumns?.includes(key)) return 'text';

    return column.type || 'text'; // fallback
  }, [dropdownFilterColumns, numberFilterColumns, datePickerFilterColumns, booleanFilterColumns, textFilterColumns]);

  // Function to generate the correct filter UI for a column based on its type and data
  const getColumnFilterElement = useCallback((column, filterValue, filterCallback) => {
    const columnType = getColumnType(column);
    const columnKey = column.key;

    switch (columnType) {
      case 'dropdown':
      case 'select':
      case 'categorical': {
        const uniqueValues = getUniqueValues(tableData, columnKey);
        const options = [
          { label: 'All', value: null },
          ...uniqueValues.map(val => ({ label: String(val), value: val }))
        ];
        return (
          <Dropdown
            value={filterValue}
            options={options}
            onChange={(e) => filterCallback(e.value)}
            placeholder="Select..."
            className="p-column-filter"
            showClear
          />
        );
      }

      case 'date':
      case 'datetime':
        return (
          <Calendar
            value={filterValue || null}
            onChange={(e) => filterCallback(e.value)}
            placeholder="Select date range"
            className="p-column-filter"
            dateFormat="yy-mm-dd"
            selectionMode="range"
            showIcon
          />
        );

      case 'number':
        return (
          <InputNumber
            value={filterValue || null}
            onValueChange={(e) => filterCallback(e.value)}
            placeholder={`Enter ${column.title}`}
            className="p-column-filter"
            inputStyle={{ width: '100%' }}
          />
        );

      case 'boolean':
        return (
          <Dropdown
            value={filterValue}
            options={[
              { label: 'All', value: null },
              { label: 'True', value: true },
              { label: 'False', value: false }
            ]}
            onChange={(e) => filterCallback(e.value)}
            placeholder="Select..."
            className="p-column-filter"
            showClear
          />
        );

      default:
        return (
          <InputText
            value={filterValue || ''}
            onChange={(e) => filterCallback(e.target.value || null)}
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
          />
        );
    }
  }, [tableData, getColumnType]);





  // Enhanced column generation with data type detection
  const defaultColumns = useMemo(() => {
    let cols = [];

    // Debug logging
    // console.log('Pivot Transformation:', {
    //   isPivot: pivotTransformation.isPivot,
    //   pivotColumnsLength: pivotTransformation.pivotColumns.length,
    //   pivotColumns: pivotTransformation.pivotColumns,
    //   mergedPivotConfig: mergedPivotConfig
    // });

    // Use pivot columns if pivot is enabled and available
    if (pivotTransformation.isPivot && pivotTransformation.pivotColumns.length > 0) {
      // console.log('Using pivot columns:', pivotTransformation.pivotColumns);
      cols = pivotTransformation.pivotColumns.map(col => ({
        ...col,
        sortable: col.sortable !== false,
        filterable: col.filterable !== false,
        type: col.type || 'text'
      }));
    } else if (columns.length > 0) {
      // ✅ Normalize keys from field/header if missing
      const normalizedColumns = columns.map(col => {
        const key = col.key || col.field || col.header || col.name;
        return {
          key,
          title: col.title || col.header || key,
          sortable: col.sortable !== false,
          filterable: col.filterable !== false,
          type: col.type || 'text',
          ...col,
          key // override or re-add key to make sure it's set
        };
      });

      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => normalizedColumns.find(col => col.key === key)).filter(Boolean)
        : normalizedColumns;

      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    } else if (finalTableData.length > 0) {
      const sampleRow = finalTableData[0];
      const autoColumns = Object.keys(sampleRow).map(key => {
        const value = sampleRow[key];
        let type = 'text';
        if (typeof value === 'number') type = 'number';
        else if (typeof value === 'boolean') type = 'boolean';
        else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) type = 'date';
        else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) type = 'datetime';

        return {
          key,
          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          filterable: true,
          type
        };
      });

      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => autoColumns.find(col => col.key === key)).filter(Boolean)
        : autoColumns;

      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    }

    if (fields && Array.isArray(fields) && fields.length > 0) {
      cols = cols.filter(col => fields.includes(col.key));
    }

    // NEW: Add ROI column if ROI calculation is enabled
    if (enableROICalculation && roiConfig?.showROIColumn) {
      const roiColumn = {
        key: roiConfig.roiColumnKey,
        title: roiConfig.roiColumnTitle,
        sortable: true,
        filterable: true,
        type: 'roi',
        isROIColumn: true
      };
      
      // Add ROI column to the end of the columns
      cols.push(roiColumn);
    }

    return cols;
  }, [columns, finalTableData, hiddenColumns, columnOrder, fields, pivotTransformation.isPivot, pivotTransformation.pivotColumns, enableROICalculation, roiConfig]);

  // Auto-detect column grouping patterns
  const autoDetectedColumnGroups = useMemo(() => {
    if (!enableAutoColumnGrouping || !tableData.length) {
      return { groups: [], ungroupedColumns: defaultColumns };
    }

    const { groupSeparator, ungroupedColumns, totalColumns, groupingPatterns, customGroupMappings } = groupConfig;
    const groups = [];
    const processedColumns = new Set();
    const remainingColumns = [];

    // Step 1: Handle explicitly ungrouped columns
    const explicitlyUngroupedColumns = defaultColumns.filter(col => 
      ungroupedColumns.includes(col.key)
    );
    explicitlyUngroupedColumns.forEach(col => processedColumns.add(col.key));

    // Step 2: Post-merge column grouping based on keywords
    // This groups columns after merging based on their names containing keywords like "service", "support", etc.
    const keywordGroups = {};
    
    // Auto-detect group keywords from column names
    const detectGroupKeywords = () => {
      const allColumnKeys = defaultColumns.map(col => col.key.toLowerCase());
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
    
    // Get auto-detected groups
    const autoDetectedGroups = detectGroupKeywords();
    
    defaultColumns.forEach(col => {
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
        } else if (colKey.includes('empVisit')) {
          assignedGroup = 'EmpVisit';
        } else if (colKey.includes('drVisit')) {
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
    defaultColumns.forEach(col => {
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
      defaultColumns.forEach(col => {
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
    const totalCols = defaultColumns.filter(col => 
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
    defaultColumns.forEach(col => {
      if (!processedColumns.has(col.key)) {
        remainingColumns.push(col);
      }
    });

    return {
      groups,
      ungroupedColumns: [...explicitlyUngroupedColumns, ...remainingColumns]
    };
  }, [enableAutoColumnGrouping, defaultColumns, tableData, groupConfig]);

  // Final column structure with grouping
  const finalColumnStructure = useMemo(() => {
    if (!enableColumnGrouping) {
      return { columns: defaultColumns, hasGroups: false };
    }

    if (enableAutoColumnGrouping) {
      return {
        columns: defaultColumns,
        hasGroups: autoDetectedColumnGroups.groups.length > 0,
        groups: autoDetectedColumnGroups.groups,
        ungroupedColumns: autoDetectedColumnGroups.ungroupedColumns
      };
    }

    // Use manual column groups
    return {
      columns: defaultColumns,
      hasGroups: columnGroups.length > 0,
      groups: columnGroups,
      ungroupedColumns: defaultColumns
    };
  }, [enableColumnGrouping, enableAutoColumnGrouping, defaultColumns, autoDetectedColumnGroups, columnGroups]);


  // Initialize filters based on columns
  useEffect(() => {
    const initialFilters = {
      global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS }
    };
    
    defaultColumns.forEach(col => {
      if (col.filterable && enableColumnFilter) {
        // Use advanced filter structure for all columns to match official PrimeReact design
        initialFilters[col.key] = { 
          operator: FilterOperator.AND, 
          constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] 
        };
      }
    });
    setFilters(initialFilters);
  }, [defaultColumns, enableColumnFilter, globalFilterValue]);

  // Parse customFormatters from strings to functions using useMemo
  const parsedCustomFormatters = useMemo(() => {
    const parsedFormatters = {};
    
    // Safety check - ensure customFormatters is an object
    if (!customFormatters || typeof customFormatters !== 'object') {
      return parsedFormatters;
    }
    
    Object.keys(customFormatters).forEach(key => {
      const formatter = customFormatters[key];
      
      if (typeof formatter === 'function') {
        // Already a function, use as is
        parsedFormatters[key] = formatter;
      } else if (typeof formatter === 'string') {
        // String function, try to parse it
        try {
          // Handle different function formats
          let functionBody, paramNames;
          
          if (formatter.includes('function(')) {
            // Standard function format: function(value, rowData) { return ... }
            functionBody = formatter.replace(/^function\s*\([^)]*\)\s*\{/, '').replace(/\}$/, '');
            const params = formatter.match(/function\s*\(([^)]*)\)/);
            paramNames = params ? params[1].split(',').map(p => p.trim()) : ['value', 'rowData'];
          } else if (formatter.includes('=>')) {
            // Arrow function format: (value, rowData) => ...
            const arrowMatch = formatter.match(/\(([^)]*)\)\s*=>\s*(.+)/);
            if (arrowMatch) {
              paramNames = arrowMatch[1].split(',').map(p => p.trim());
              functionBody = `return ${arrowMatch[2]}`;
            } else {
              // Simple arrow function: value => ...
              paramNames = ['value'];
              functionBody = `return ${formatter.replace(/^[^=]*=>\s*/, '')}`;
            }
          } else {
            // Simple expression, treat as value => expression
            paramNames = ['value'];
            functionBody = `return ${formatter}`;
          }
          
          // Create the function
          const func = new Function(...paramNames, functionBody);
          parsedFormatters[key] = func;
        } catch (error) {
          console.warn(`Failed to parse customFormatter for ${key}:`, error);
          // Fallback to simple string return
          parsedFormatters[key] = (value) => String(value || '');
        }
      } else {
        // Fallback for other types
        parsedFormatters[key] = (value) => String(value || '');
      }
    });
    
    return parsedFormatters;
  }, [customFormatters]);



  // Enhanced event handlers
  const handleSort = useCallback((event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
    
    if (onSortChange) {
      onSortChange(event.sortField, event.sortOrder === 1 ? 'asc' : 'desc');
    }
  }, [onSortChange]);

  const handleFilter = useCallback((event) => {
    setFilters(event.filters);
    
    if (onFilterChange) {
      onFilterChange(event.filters);
    }
  }, [onFilterChange]);

  const handleSearch = useCallback((value) => {
    setGlobalFilterValue(value);
    
    // Update filters with the new global filter value
    let _filters = { ...filters };
    if (!_filters['global']) {
      _filters['global'] = { value: null, matchMode: FilterMatchMode.CONTAINS };
    }
    _filters['global'].value = value;
    setFilters(_filters);
    
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch, filters]);

  const handleBulkAction = useCallback((action) => {
    if (onBulkAction) {
      onBulkAction(action, selectedRows);
    }
  }, [onBulkAction, selectedRows]);

  const clearAllFilters = useCallback(() => {
    setGlobalFilterValue("");
    
    // Reset all filters to default state
    const clearedFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
    
    // Reset column filters to default state
    defaultColumns.forEach(col => {
      if (col.filterable && enableColumnFilter) {
        clearedFilters[col.key] = { 
          operator: FilterOperator.AND, 
          constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] 
        };
      }
    });
    
    setFilters(clearedFilters);
    setSortField(null);
    setSortOrder(1);
    
    // Clear filtered data for totals
    if (enableFooterTotals) {
      setFilteredDataForTotals(tableData.filter(row => row && typeof row === 'object'));
    }
  }, [defaultColumns, enableColumnFilter, enableFooterTotals, tableData]);

  const handleRowSelect = useCallback((event) => {
    setSelectedRows(event.value);
    
    if (onRowSelect) {
      onRowSelect(event.value);
    }
  }, [onRowSelect]);

  const handleExport = useCallback(() => {
    if (!enableExport) return;
    
    if (onExport) {
      onExport(tableData);
    } else {
      // Enhanced export with multiple formats
      switch (exportFileType) {
        case 'excel':
          if (enableExcelExport) {
            // Excel export using jspdf-autotable
            const csvContent = [
              defaultColumns.map(col => col.title).join(','),
              ...tableData.map(row => 
                defaultColumns.map(col => `"${row[col.key] || ''}"`).join(',')
              )
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportFilename}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;
        case 'pdf':
          if (enablePdfExport) {
            // PDF export using jspdf-autotable
            const csvContent = [
              defaultColumns.map(col => col.title).join(','),
              ...tableData.map(row => 
                defaultColumns.map(col => `"${row[col.key] || ''}"`).join(',')
              )
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${exportFilename}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;
        default:
          // Default CSV export
          const csvContent = [
            defaultColumns.map(col => col.title).join(','),
            ...tableData.map(row => 
              defaultColumns.map(col => `"${row[col.key] || ''}"`).join(',')
            )
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${exportFilename}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          break;
      }
    }
  }, [enableExport, tableData, onExport, exportFileType, enableExcelExport, enablePdfExport, exportFilename, defaultColumns]);

  const handleRefresh = useCallback(async () => {
    if (!enableRefresh) return;
    
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [enableRefresh, onRefresh]);

  // Inline editing handlers
  const handleRowEditSave = useCallback((event) => {
    if (onRowEditSave) {
      onRowEditSave(event);
    }
  }, [onRowEditSave]);

  const handleRowEditCancel = useCallback((event) => {
    if (onRowEditCancel) {
      onRowEditCancel(event);
    }
  }, [onRowEditCancel]);

  const handleRowEditInit = useCallback((event) => {
    if (onRowEditInit) {
      onRowEditInit(event);
    }
  }, [onRowEditInit]);

  const handleEditingRowsChange = useCallback((event) => {
    setLocalEditingRows(event.value);
    if (onEditingRowsChange) {
      onEditingRowsChange(event);
    }
  }, [onEditingRowsChange]);

  // Context menu handlers
  const handleContextMenuSelectionChange = useCallback((event) => {
    setLocalContextMenuSelection(event.value);
    if (onContextMenuSelectionChange) {
      onContextMenuSelectionChange(event);
    }
  }, [onContextMenuSelectionChange]);

  const handleContextMenu = useCallback((event) => {
    if (onContextMenu) {
      onContextMenu(event);
    }
  }, [onContextMenu]);

  const handlePageChange = useCallback((event) => {
    setLocalCurrentPage(event.page + 1);
    setLocalPageSize(event.rows);
    
    if (onPageChange) {
      onPageChange(event.page + 1);
    }
  }, [onPageChange]);

  // Custom cell renderers
  const imageBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    if (!value) return '-';
    
    const isPopup = popupImageFields && Array.isArray(popupImageFields) && popupImageFields.includes(column.key);
    
    return (
      <Image
        src={value}
        alt={column.key}
        width={50}
        height={50}
        style={{ objectFit: 'cover', cursor: isPopup ? 'pointer' : 'default' }}
        onClick={isPopup ? () => { 
          setImageModalSrc(value); 
          setImageModalAlt(column.key); 
          setShowImageModal(true); 
        } : undefined}
      />
    );
  };



  const dateBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    if (!value) return '-';
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    } else if (column.type === 'datetime') {
      return new Date(value).toLocaleString();
    }
    return value;
  };

  const numberBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    if (value === null || value === undefined) return '-';
    return Number(value).toLocaleString();
  };

  const booleanBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    return (
      <i className={classNames('pi', { 
        'text-green-500 pi-check-circle': value, 
        'text-red-500 pi-times-circle': !value 
      })}></i>
    );
  };

  // NEW: ROI Body Template
  const roiBodyTemplate = (rowData, column) => {
    const roiValue = rowData[column.key];
    
    if (roiValue === null || roiValue === undefined) {
      return <span>N/A</span>;
    }

    const formattedValue = formatROIValue(roiValue);
    const color = getROIColor(roiValue);

    return (
      <span style={{ 
        color: color || 'inherit',
        fontWeight: 'bold'
      }}>
        {formattedValue}
      </span>
    );
  };

  // Pivot table specific formatters
  const pivotValueBodyTemplate = useCallback((rowData, column) => {
    const value = rowData[column.key];
    if (value === null || value === undefined) return '-';
    
    // Check if this row is a grand total
    const isGrandTotal = rowData.isGrandTotal;
    
    // Format number based on pivot config with safe fallbacks
    let formattedValue;
    
    const isCurrencyColumn = currencyColumns.includes(column.key) || (column.pivotField && currencyColumns.includes(column.pivotField));
    const currency = adjustedPivotConfig.currency || 'USD';
    const numberFormat = adjustedPivotConfig.numberFormat || 'en-US';
    const precision = adjustedPivotConfig.precision || 2;
    
    try {
      if (isCurrencyColumn && currency) {
        formattedValue = new Intl.NumberFormat(numberFormat, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(value);
      } else {
        formattedValue = new Intl.NumberFormat(numberFormat, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(value);
      }
    } catch (error) {
      console.warn('Pivot value formatting error:', error, { currency, numberFormat, precision });
      // Fallback to simple number formatting
      formattedValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    
    // Apply special styling for totals
    const className = classNames({
      'font-bold': isGrandTotal || column.isPivotTotal,
      'text-blue-600': column.isPivotTotal && !isGrandTotal,
      'text-green-600 font-semibold': isGrandTotal,
      'bg-blue-50': column.isPivotTotal && !isGrandTotal,
      'bg-green-50': isGrandTotal
    });
    
    return (
      <span className={className}>
        {formattedValue}
      </span>
    );
  }, [adjustedPivotConfig, currencyColumns]);

  const pivotRowBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    const isGrandTotal = rowData.isGrandTotal;
    
    const className = classNames({
      'font-bold text-green-600': isGrandTotal,
      'font-medium': !isGrandTotal
    });
    
    return (
      <span className={className}>
        {value || '-'}
      </span>
    );
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div>
        {rowActions.map((action, actionIndex) => (
          <Button
            key={actionIndex}
            icon={action.icon}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(rowData);
            }}
            tooltip={action.title}
            tooltipOptions={{ position: 'top' }}
            className="p-button-text p-button-sm"
          />
        ))}
      </div>
    );
  };

  // Advanced filter components


  // Filter templates - Using native PrimeReact design
  const filterClearTemplate = (options) => {
    if (!enableFilterClear) return null;
    return (
      <Button
        type="button"
        icon="pi pi-times"
        onClick={options.filterClearCallback}
        className="p-button-text p-button-sm"
        tooltip="Clear filter"
        tooltipOptions={{ position: 'top' }}
      />
    );
  };

  const filterApplyTemplate = (options) => {
    if (!enableFilterApply) return null;
    return (
      <Button
        type="button"
        icon="pi pi-check"
        onClick={options.filterApplyCallback}
        className="p-button-text p-button-sm"
        tooltip="Apply filter"
        tooltipOptions={{ position: 'top' }}
      />
    );
  };

  const filterFooterTemplate = (column) => {
    if (!enableFilterFooter) return null;
    return (
      <div className="p-column-filter-footer">
        Filter by {column.title}
      </div>
    );
  };

  // State to store filtered data for footer totals
  const [filteredDataForTotals, setFilteredDataForTotals] = useState(() =>
    tableData.filter(row => row && typeof row === 'object')
  );

  // Helper function to match filter values
  const matchFilterValue = useCallback((cellValue, filterValue, matchMode) => {
    // Handle null/undefined values
    if (cellValue === null || cellValue === undefined) {
      return filterValue === null || filterValue === undefined || filterValue === '';
    }
    
    // Handle exact matches for non-string types
    if (typeof cellValue === 'number' || typeof cellValue === 'boolean') {
      switch (matchMode) {
        case FilterMatchMode.EQUALS:
          return cellValue === filterValue;
        case FilterMatchMode.NOT_EQUALS:
          return cellValue !== filterValue;
        case FilterMatchMode.LESS_THAN:
          return cellValue < filterValue;
        case FilterMatchMode.LESS_THAN_OR_EQUAL_TO:
          return cellValue <= filterValue;
        case FilterMatchMode.GREATER_THAN:
          return cellValue > filterValue;
        case FilterMatchMode.GREATER_THAN_OR_EQUAL_TO:
          return cellValue >= filterValue;
        default:
          return cellValue === filterValue;
      }
    }
    
    // Handle string comparisons
    const cellStr = String(cellValue).toLowerCase();
    const filterStr = String(filterValue).toLowerCase();
    
    switch (matchMode) {
      case FilterMatchMode.STARTS_WITH:
        return cellStr.startsWith(filterStr);
      case FilterMatchMode.ENDS_WITH:
        return cellStr.endsWith(filterStr);
      case FilterMatchMode.EQUALS:
        return cellStr === filterStr;
      case FilterMatchMode.NOT_EQUALS:
        return cellStr !== filterStr;
      case FilterMatchMode.CONTAINS:
      default:
        return cellStr.includes(filterStr);
    }
  }, []);

  // Apply filters to data manually when PrimeReact doesn't provide filtered data
  const applyFiltersToData = useCallback((data, filters) => {
    if (!filters || Object.keys(filters).length === 0) return data;
    
    return data.filter(row => {
      // Ensure row is not null or undefined
      if (!row || typeof row !== 'object') return false;
      // Check global filter
      if (filters.global && filters.global.value) {
        const globalValue = String(filters.global.value).toLowerCase();
        const globalMatch = defaultColumns.some(col => {
          const cellValue = String(row[col.key] || '').toLowerCase();
          return cellValue.includes(globalValue);
        });
        if (!globalMatch) return false;
      }
      
      // Check column filters
      for (const [columnKey, filterConfig] of Object.entries(filters)) {
        if (columnKey === 'global') continue;
        
        const cellValue = row[columnKey];
        
        // Handle advanced filter structure
        if (filterConfig.operator && filterConfig.constraints) {
          const constraintResults = filterConfig.constraints.map(constraint => {
            if (!constraint.value && constraint.value !== 0 && constraint.value !== false) return true;
            
            const constraintValue = constraint.value;
            const matchMode = constraint.matchMode || FilterMatchMode.CONTAINS;
            
            return matchFilterValue(cellValue, constraintValue, matchMode);
          });
          
          const result = filterConfig.operator === FilterOperator.AND
            ? constraintResults.every(Boolean)
            : constraintResults.some(Boolean);
            
          if (!result) return false;
        } else {
          // Handle simple filter structure
          if (filterConfig.value !== null && filterConfig.value !== undefined && filterConfig.value !== '') {
            const matchMode = filterConfig.matchMode || FilterMatchMode.CONTAINS;
            if (!matchFilterValue(cellValue, filterConfig.value, matchMode)) {
              return false;
            }
          }
        }
      }
      
      return true;
    });
  }, [defaultColumns, matchFilterValue]);

  // Update filtered data when filters or tableData change
  useEffect(() => {
    // Apply current filters to get filtered data for totals
    const filteredData = applyFiltersToData(tableData, filters);
    // Ensure filtered data contains only valid objects
    const validFilteredData = filteredData.filter(row => row && typeof row === 'object');
    setFilteredDataForTotals(validFilteredData);
  }, [tableData, filters, applyFiltersToData]);

  // Calculate footer totals for numeric columns based on filtered data
  const calculateFooterTotals = useMemo(() => {
    if (!enableFooterTotals || !filteredDataForTotals.length) {
      return { totals: {}, averages: {}, counts: {} };
    }

    const totals = {};
    const averages = {};
    const counts = {};

    defaultColumns.forEach(column => {
      // Dynamic numeric column detection (same logic as footerTemplate)
      const isNumericColumn = (() => {
        // Check if column type is explicitly set to 'number'
        if (column.type === 'number') return true;
        
        // Check if column key is in currencyColumns
        if (currencyColumns.includes(column.key)) return true;
        
        // Check if column key contains numeric indicators
        if (column.key && typeof column.key === 'string') {
          const key = column.key.toLowerCase();
          if (key.includes('amount') || 
              key.includes('total') || 
              key.includes('sum') ||
              key.includes('revenue') ||
              key.includes('cost') ||
              key.includes('profit') ||
              key.includes('price') ||
              key.includes('value') ||
              key.includes('service') ||
              key.includes('emi') ||
              key.includes('cheque')) {
            return true;
          }
        }
        
        // Check if column data contains numeric values
        if (filteredDataForTotals && filteredDataForTotals.length > 0) {
          const sampleValues = filteredDataForTotals.slice(0, 10).map(row => row[column.key]);
          const hasNumericValues = sampleValues.some(val => 
            typeof val === 'number' && !isNaN(val)
          );
          if (hasNumericValues) return true;
        }
        
        return false;
      })();
      
      if (isNumericColumn) {
        const values = filteredDataForTotals
          .filter(row => row && typeof row === 'object' && column.key in row)
          .map(row => {
            const value = row?.[column.key];
            return typeof value === 'number' && !isNaN(value) ? value : null;
          })
          .filter(val => val !== null);

        if (values.length > 0) {
          const total = values.reduce((sum, val) => sum + val, 0);
          if (footerTotalsConfig.showTotals) {
            totals[column.key] = total;
          }

          if (footerTotalsConfig.showAverages) {
            averages[column.key] = total / values.length;
          }

          if (footerTotalsConfig.showCounts) {
            counts[column.key] = values.length;
          }
        }
      }
    });

    return { totals, averages, counts };
  }, [filteredDataForTotals, defaultColumns, enableFooterTotals, footerTotalsConfig]);



  // Generate filter options for categorical columns
  const generateFilterOptions = useCallback((column) => {
    if (!column.filterable || !enableColumnFilter) return undefined;
    
    const columnKey = column.key;
    
    // Check if custom filter options are provided for this column
    if (customFilterOptions[columnKey]) {
      return customFilterOptions[columnKey];
    }
    
    // If column has predefined options, use them
    if (column.filterOptions) return column.filterOptions;
    
    // Check if column is explicitly configured as dropdown
    if (dropdownFilterColumns.includes(columnKey)) {
      const uniqueValues = [...new Set(tableData.map(row => row[columnKey]).filter(val => val !== null && val !== undefined))];
      return uniqueValues.map(value => ({
        label: String(value),
        value: value
      }));
    }
    
    // For categorical columns, generate options from unique values
    if (column.isCategorical || column.type === 'select' || column.type === 'dropdown' || column.type === 'categorical') {
      const uniqueValues = [...new Set(tableData.map(row => row[columnKey]).filter(val => val !== null && val !== undefined))];
      return uniqueValues.map(value => ({
        label: String(value),
        value: value
      }));
    }
    
    // Auto-detect categorical columns based on data analysis
    const uniqueValues = [...new Set(tableData.map(row => row[columnKey]).filter(val => val !== null && val !== undefined))];
    
    // If column has limited unique values (categorical data)
    if (uniqueValues.length > 0 && uniqueValues.length <= 30) {
      return uniqueValues.map(value => ({
        label: String(value),
        value: value
      }));
    }
    
    // If column has many unique values but they're all strings (not numbers), it might still be categorical
    if (uniqueValues.length > 30 && uniqueValues.length <= 50) {
      const allStrings = uniqueValues.every(val => typeof val === 'string' && !isNaN(val) === false);
      if (allStrings) {
        return uniqueValues.map(value => ({
          label: String(value),
          value: value
        }));
      }
    }
    
    return undefined;
  }, [tableData, enableColumnFilter, customFilterOptions, dropdownFilterColumns]);

  // Footer template for column totals
  const footerTemplate = (column) => {
    if (!effectiveTotalSettings.showFooterTotals) return null;
    
    // Dynamic numeric column detection
    const isNumericColumn = (() => {
      // Check if column type is explicitly set to 'number'
      if (column.type === 'number') return true;
      
      // Check if column key is in currencyColumns
      if (currencyColumns.includes(column.key)) return true;
      
      // Check if column key contains numeric indicators
      if (column.key && typeof column.key === 'string') {
        const key = column.key.toLowerCase();
        if (key.includes('amount') || 
            key.includes('total') || 
            key.includes('sum') ||
            key.includes('revenue') ||
            key.includes('cost') ||
            key.includes('profit') ||
            key.includes('price') ||
            key.includes('value') ||
            key.includes('service') ||
            key.includes('emi') ||
            key.includes('cheque')) {
          return true;
        }
      }
      
      // Check if column data contains numeric values
      if (tableData && tableData.length > 0) {
        const sampleValues = tableData.slice(0, 10).map(row => row[column.key]);
        const hasNumericValues = sampleValues.some(val => 
          typeof val === 'number' && !isNaN(val)
        );
        if (hasNumericValues) return true;
      }
      
      return false;
    })();
    
    if (!isNumericColumn) return null;
    
    const { totals, averages, counts } = calculateFooterTotals;
    const total = totals[column.key];
    const average = averages[column.key];
    const count = counts[column.key];
    
    if (total === undefined && average === undefined && count === undefined) return null;
    
    const formatNumber = (value, column) => {
      if (typeof value !== 'number') return '';

      const currency = footerTotalsConfig.currency || 'USD';
      const numberFormat = footerTotalsConfig.numberFormat || 'en-US';
      const precision = footerTotalsConfig.precision || 2;

      try {
        if (currencyColumns.includes(column.key) && currency) {
          return new Intl.NumberFormat(numberFormat, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
          }).format(value);
        }

        return new Intl.NumberFormat(numberFormat, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(value);
      } catch (error) {
        console.warn('Footer formatting error:', error, { currency, numberFormat, precision });
        // Fallback to simple formatting
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }
    };

    
    return (
      <div>
        {footerTotalsConfig.showTotals && total !== undefined && (
          <div>Total: {formatNumber(total, column)}</div> // ✅ pass column
        )}
        {footerTotalsConfig.showAverages && average !== undefined && (
          <div>Avg: {formatNumber(average, column)}</div> // ✅ pass column
        )}
        {footerTotalsConfig.showCounts && count !== undefined && (
          <div>Count: {count}</div>
        )}
      </div>
    );
  };

  // Toolbar components
  const leftToolbarTemplate = () => (
    <div>
      {enableSearch && enableGlobalFilter && (
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder={globalFilterPlaceholder}
            value={globalFilterValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </IconField>
      )}

      {globalFilterValue && (
        <Button
          icon="pi pi-filter-slash"
          label="Clear"
          onClick={clearAllFilters}
          className="p-button-outlined p-button-danger p-button-sm"
        />
      )}
    </div>
  );

  const rightToolbarTemplate = () => (
    <div>
      {selectedRows.length > 0 && enableBulkActions && bulkActions.length > 0 && (
        <div>
          <span>
            {selectedRows.length} selected
          </span>
          {bulkActions.map((action, index) => (
            <Button
              key={index}
              label={action.title}
              onClick={() => handleBulkAction(action)}
              className="p-button-sm"
            />
          ))}
        </div>
      )}

      {/* NEW: Pivot Configuration Button */}
      {enablePivotUI && (
        <Button
          icon={isLoadingPivotConfig ? "pi pi-spin pi-spinner" : "pi pi-chart-bar"}
          label={isLoadingPivotConfig ? "Loading..." : "Pivot"}
          onClick={() => setShowPivotConfig(!showPivotConfig)}
          className={`p-button-outlined p-button-sm ${isPivotEnabled ? 'p-button-success' : ''}`}
          tooltip={isLoadingPivotConfig ? "Loading pivot configuration..." : "Configure pivot table"}
          tooltipOptions={{ position: 'top' }}
          disabled={isLoadingPivotConfig}
        />
      )}

      {enableColumnManagement && (
        <Button
          icon="pi pi-columns"
          label="Columns"
          onClick={() => setShowColumnManager(!showColumnManager)}
          className="p-button-outlined p-button-sm"
        />
      )}

      {/* Clear Filters Button - Always show when column filtering is enabled */}
      {enableColumnFilter && (
        <Button
          icon="pi pi-filter-slash"
          label="Clear Filters"
          onClick={clearAllFilters}
          className="p-button-outlined p-button-warning p-button-sm"
          tooltip="Clear all column filters and search"
          tooltipOptions={{ position: 'top' }}
        />
      )}

      {enableExport && (
        <Button
          icon="pi pi-download"
          label="Export"
          onClick={handleExport}
          className="p-button-outlined p-button-sm"
        />
      )}

      {enableRefresh && (
        <Button
          icon="pi pi-refresh"
          label="Refresh"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-button-outlined p-button-sm"
          loading={isRefreshing}
        />
      )}
    </div>
  );

  // Generate column groups from configuration
  const generateColumnGroups = useCallback(() => {
    if (!enableColumnGrouping || !finalColumnStructure.hasGroups) {
      return null;
    }

    const { groups, ungroupedColumns } = finalColumnStructure;

    // Create header rows for grouped columns
    const headerRows = [];

    // First row: Main group headers + ungrouped column headers
    const firstRowColumns = [];
    
    // Add ungrouped columns to first row
    ungroupedColumns.forEach(col => {
      firstRowColumns.push(
        <Column
          key={`ungrouped-${col.key}`}
          header={col.title}
          field={col.key}
          rowSpan={2} // Span both header rows since ungrouped
        />
      );
    });

    // Add group headers to first row
    groups.forEach(group => {
      firstRowColumns.push(
        <Column
          key={`group-${group.header}`}
          header={group.header}
          colSpan={group.columns.length}
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            ...groupConfig.headerGroupStyle
          }}
        />
      );
    });

    headerRows.push(
      <Row key="group-headers">
        {firstRowColumns}
      </Row>
    );

    // Second row: Sub-column headers for grouped columns
    const secondRowColumns = [];
    
    groups.forEach(group => {
      group.columns.forEach(col => {
        secondRowColumns.push(
          <Column
            key={`sub-${col.originalKey || col.key}`}
            header={col.subHeader || col.title}
            field={col.originalKey || col.key}
            style={{
              textAlign: 'center',
              fontSize: '0.9em',
              backgroundColor: 'var(--surface-50)',
              ...groupConfig.groupStyle
            }}
          />
        );
      });
    });

    headerRows.push(
      <Row key="sub-headers">
        {secondRowColumns}
      </Row>
    );

    return (
      <ColumnGroup>
        {headerRows}
      </ColumnGroup>
    );
  }, [enableColumnGrouping, finalColumnStructure, groupConfig]);

  // Generate footer groups from configuration
  const generateFooterGroups = useCallback(() => {
    if (!enableColumnGrouping || !groupConfig.enableFooterGroups || !finalColumnStructure.hasGroups) {
      return null;
    }

    // If custom footer group is provided, use it
    if (footerColumnGroup) {
      return footerColumnGroup;
    }

    const { groups, ungroupedColumns } = finalColumnStructure;

    // Create footer row
    const footerColumns = [];
    
    // Add ungrouped columns to footer
    ungroupedColumns.forEach(col => {
      footerColumns.push(
        <Column
          key={`footer-ungrouped-${col.key}`}
          footer={effectiveTotalSettings.showFooterTotals && col.type === 'number' ? () => footerTemplate(col) : null}
          field={col.key}
        />
      );
    });

    // Add grouped columns to footer
    groups.forEach(group => {
      group.columns.forEach(col => {
        footerColumns.push(
          <Column
            key={`footer-grouped-${col.originalKey || col.key}`}
            footer={effectiveTotalSettings.showFooterTotals && col.type === 'number' ? () => footerTemplate(col) : null}
            field={col.originalKey || col.key}
          />
        );
      });
    });

    return (
      <ColumnGroup>
        <Row>
          {footerColumns}
        </Row>
      </ColumnGroup>
    );
  }, [enableColumnGrouping, footerColumnGroup, finalColumnStructure, groupConfig.enableFooterGroups, effectiveTotalSettings.showFooterTotals, footerTemplate]);

  // Helper function to create column groups easily
  const createColumnGroup = useCallback((groups) => {
    return (
      <ColumnGroup>
        {groups.map((group, groupIndex) => (
          <Row key={groupIndex}>
            {group.columns.map((col, colIndex) => (
              <Column
                key={colIndex}
                header={col.header}
                field={col.field}
                sortable={col.sortable}
                colSpan={col.colSpan}
                rowSpan={col.rowSpan}

                footer={col.footer}
                body={col.body}
                bodyTemplate={col.bodyTemplate}
              />
            ))}
          </Row>
        ))}
      </ColumnGroup>
    );
  }, []);
  
  // Loading and error states
  if (isLoading) {
    return (
      <div className={className} style={style}>
        <div>
          <RefreshCw size={24} className="animate-spin" />
          Loading data...
        </div>
      </div>
    );
  }

  if (tableError) {
    return (
      <div className={className} style={style}>
        <div>
          <X size={24} />
          Error: {tableError}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>

      

      
      {/* Toolbar */}
      <Toolbar
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
        className="mb-4"
      />

      {/* DataTable */}
      <DataTable
        value={finalTableData}
        loading={isLoading}
        filters={filters}
        filterDisplay={
          enableColumnFilter 
            ? (enableColumnGrouping && finalColumnStructure.hasGroups && !forceFilterDisplayWithGrouping 
                ? "row" 
                : filterDisplay)
            : undefined
        }
        globalFilterFields={globalFilterFields.length > 0 ? globalFilterFields : defaultColumns.map(col => col.key)}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onFilter={(e) => {
          // Update filters first
          handleFilter(e);
          
          // Update filtered data for totals calculation
          if (enableFooterTotals) {
            // Get the filtered data from PrimeReact event
            let filteredRows = finalTableData;
            
            // Try to get filtered data from various event properties
            if (e.filteredValue && Array.isArray(e.filteredValue)) {
              filteredRows = e.filteredValue;
            } else if (e.value && Array.isArray(e.value)) {
              filteredRows = e.value;
            } else if (e.data && Array.isArray(e.data)) {
              filteredRows = e.data;
            } else {
              // Apply filters manually using the updated filters
              filteredRows = applyFiltersToData(finalTableData, e.filters);
            }
            
            // Ensure filtered rows are valid objects
            const validFilteredRows = filteredRows.filter(row => row && typeof row === 'object');
            setFilteredDataForTotals(validFilteredRows);
          }
        }}
        onRowClick={onRowClick ? (e) => onRowClick(e.data, e.index) : undefined}
        selection={enableRowSelection ? selectedRows : null}
        onSelectionChange={enableRowSelection ? handleRowSelect : undefined}
        dataKey="id"
        paginator={enablePagination}
        rows={localPageSize}
        rowsPerPageOptions={pageSizeOptions}
        onPage={handlePageChange}
        first={(localCurrentPage - 1) * localPageSize}
        totalRecords={finalTableData.length}
        showGridlines={enableGridLines}
        stripedRows={enableStripedRows}
        size={tableSize}
        
        // Enhanced pagination
        showFirstLastIcon={showFirstLastIcon}
        showPageLinks={showPageLinks}
        showCurrentPageReport={showCurrentPageReport}
        currentPageReportTemplate={currentPageReportTemplate}
        
        // Enhanced filtering
        filterDelay={filterDelay}
        globalFilterPlaceholder={globalFilterPlaceholder}
        filterLocale={filterLocale}
        
        // Inline editing
        editingRows={enableInlineEditing ? localEditingRows : undefined}
        onRowEditSave={enableInlineEditing ? handleRowEditSave : undefined}
        onRowEditCancel={enableInlineEditing ? handleRowEditCancel : undefined}
        onRowEditInit={enableInlineEditing ? handleRowEditInit : undefined}
        onEditingRowsChange={enableInlineEditing ? handleEditingRowsChange : undefined}
        

        contextMenu={enableContextMenu ? contextMenu : undefined}
        contextMenuSelection={enableContextMenu ? localContextMenuSelection : undefined}
        onContextMenuSelectionChange={enableContextMenu ? handleContextMenuSelectionChange : undefined}
        onContextMenu={enableContextMenu ? handleContextMenu : undefined}
        
        // Advanced selection
        selectionMode={enableRowSelection ? selectionMode : undefined}
        metaKeySelection={enableRowSelection ? metaKeySelection : undefined}
        selectOnEdit={enableRowSelection ? selectOnEdit : undefined}

        emptyMessage="No data found. Try adjusting your filters."
        resizableColumns={enableResizableColumns}
        reorderableColumns={enableReorderableColumns}
        virtualScrollerOptions={enableVirtualScrolling ? { itemSize: 46 } : undefined}
        lazy={enableLazyLoading}
        rowGroupMode={enableRowGrouping ? 'subheader' : undefined}
        expandableRowGroups={enableRowGrouping}
        rowExpansionTemplate={enableRowExpansion ? (data) => <div>Expanded content for {data.name}</div> : undefined}
        frozenColumns={enableFrozenColumns ? 1 : undefined}
        frozenRows={enableFrozenRows ? 1 : undefined}
        showFilterMatchModes={showFilterMatchModes}
        headerColumnGroup={enableColumnGrouping ? (headerColumnGroup || generateColumnGroups()) : undefined}
        footerColumnGroup={enableColumnGrouping ? (footerColumnGroup || generateFooterGroups()) : undefined}
      >
        {enableRowSelection && (
          <Column
            selectionMode="multiple"

            frozen={enableFrozenColumns}
          />
        )}

        {(() => {
          // Generate columns in the correct order for grouping
          const columnsToRender = [];
          
          if (enableColumnGrouping && finalColumnStructure.hasGroups) {
            const { groups, ungroupedColumns } = finalColumnStructure;
            
            // First, add ungrouped columns
            ungroupedColumns.forEach(column => {
              columnsToRender.push(column);
            });
            
            // Then, add grouped columns in order
            groups.forEach(group => {
              group.columns.forEach(groupedColumn => {
                // Find the original column definition
                const originalColumn = defaultColumns.find(col => 
                  col.key === (groupedColumn.originalKey || groupedColumn.key)
                );
                if (originalColumn) {
                  columnsToRender.push({
                    ...originalColumn,
                    key: groupedColumn.originalKey || groupedColumn.key,
                    isGrouped: true,
                    groupName: group.header
                  });
                }
              });
            });
          } else {
            // No grouping, use default columns
            columnsToRender.push(...defaultColumns);
          }

          return columnsToRender.map(column => {
            const isImageField = imageFields && Array.isArray(imageFields) && imageFields.includes(column.key);
            const columnKey = column.key;
            const columnType = getColumnType(column);
            
            // Enhanced categorical detection including explicit configuration
            const uniqueValues = getUniqueValues(finalTableData, columnKey);
            const isCategorical = (
              dropdownFilterColumns.includes(columnKey) ||
              (uniqueValues.length > 0 && uniqueValues.length <= 30) ||
              column.type === 'dropdown' ||
              column.type === 'select' ||
              column.isCategorical
            );

            return (
              <Column
                key={column.key}
                field={column.key}
                header={column.title} // Keep headers for filters even with grouping
                sortable={column.sortable !== false && enableSorting}
                filter={column.filterable !== false && enableColumnFilter}
                filterElement={column.filterable !== false && enableColumnFilter ? (options) => getColumnFilterElement(
                  column,
                  options.value,
                  options.filterCallback
                ) : undefined}
                filterPlaceholder={`Filter ${column.title}...`}
                filterClear={enableFilterClear ? filterClearTemplate : undefined}
                filterApply={enableFilterApply ? filterApplyTemplate : undefined}
                filterFooter={enableFilterFooter ? () => filterFooterTemplate(column) : undefined}
                footer={effectiveTotalSettings.showFooterTotals ? () => footerTemplate(column) : undefined}

                showFilterMatchModes={
                  enableFilterMatchModes && 
                  !['dropdown', 'select', 'categorical', 'date', 'datetime', 'number', 'boolean'].includes(columnType)
                }
                filterMatchMode={
                  column.filterMatchMode || (
                    ['dropdown', 'select', 'categorical'].includes(columnType)
                      ? FilterMatchMode.EQUALS
                      : ['date', 'datetime'].includes(columnType)
                      ? FilterMatchMode.BETWEEN
                      : columnType === 'number'
                      ? FilterMatchMode.EQUALS
                      : columnType === 'boolean'
                      ? FilterMatchMode.EQUALS
                      : FilterMatchMode.CONTAINS
                  )
                }

                filterMaxLength={column.filterMaxLength}
                filterMinLength={column.filterMinLength}
                filterOptions={generateFilterOptions(column)}
                filterOptionLabel={column.filterOptionLabel || 'label'}
                filterOptionValue={column.filterOptionValue || 'value'}
                filterShowClear={enableFilterClear}
                filterShowApply={enableFilterApply}
                filterShowMenu={enableFilterMenu}
                filterShowMatchModes={enableFilterMatchModes}

                body={
                  // Pivot table specific templates
                  pivotTransformation.isPivot && column.isPivotValue ? (rowData) => pivotValueBodyTemplate(rowData, column) :
                  pivotTransformation.isPivot && column.isPivotTotal ? (rowData) => pivotValueBodyTemplate(rowData, column) :
                  pivotTransformation.isPivot && column.isPivotRow ? (rowData) => pivotRowBodyTemplate(rowData, column) :
                  
                  // Regular templates
                  isImageField ? (rowData) => imageBodyTemplate(rowData, column) :
                  columnType === 'date' || columnType === 'datetime' ? (rowData) => dateBodyTemplate(rowData, column) :
                  columnType === 'number' ? (rowData) => numberBodyTemplate(rowData, column) :
                  columnType === 'boolean' ? (rowData) => booleanBodyTemplate(rowData, column) :
                  columnType === 'roi' || column.isROIColumn ? (rowData) => roiBodyTemplate(rowData, column) :
                  parsedCustomFormatters[column.key] ? (rowData) => parsedCustomFormatters[column.key](rowData[column.key], rowData) :
                  customTemplates[column.key] ? (rowData) => customTemplates[column.key](rowData, column) :
                  column.render ? (rowData) => column.render(rowData[column.key], rowData) : undefined
                }

                frozen={enableFrozenColumns && column.key === defaultColumns[0]?.key}
              />
            );
          });
        })()}

        {enableRowActions && rowActions.length > 0 && (
          <Column
            body={actionsBodyTemplate}
            header="Actions"

            frozen={enableFrozenColumns ? "right" : undefined}
          />
        )}
      </DataTable>

      {/* Image Modal */}
      <Dialog
        visible={showImageModal}
        onHide={() => setShowImageModal(false)}
        header={imageModalAlt}

        modal
        className="p-fluid"
      >
        <Image
          src={imageModalSrc}
          alt={imageModalAlt}
          width={800}
          height={600}
          style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
        />
      </Dialog>

      {/* Column Manager Dialog */}
      <Dialog
        visible={showColumnManager}
        onHide={() => setShowColumnManager(false)}
        header="Manage Columns"

        modal
      >
        <div>
          {defaultColumns.map(column => (
            <div key={column.key}>
              <Checkbox
                checked={!hiddenColumns.includes(column.key)}
                onChange={(e) => {
                  if (e.checked) {
                    setHiddenColumns(prev => prev.filter(col => col !== column.key));
                  } else {
                    setHiddenColumns(prev => [...prev, column.key]);
                  }
                }}
              />
              <span>{column.title}</span>
            </div>
          ))}
        </div>
      </Dialog>

      {/* NEW: Pivot Configuration Dialog */}
      <Dialog
        visible={showPivotConfig}
        onHide={() => setShowPivotConfig(false)}
        header="Configure Pivot Table"
        style={{ width: '90vw', maxWidth: '800px' }}
        modal
        closable
        draggable={false}
        resizable={false}
        className="pivot-config-dialog"
      >
        <div className="pivot-config-content">
          {/* Pivot Table Enable/Disable */}
          <div className="pivot-enable-section">
            <div className="field-checkbox">
              <Checkbox
                inputId="enablePivot"
                checked={localPivotConfig.enabled}
                onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, enabled: e.checked }))}
              />
              <label htmlFor="enablePivot" className="ml-2">Enable Pivot Table</label>
            </div>
          </div>

          {localPivotConfig.enabled && (
            <div className="pivot-config-grid">
              {/* Rows Configuration */}
              <div className="pivot-section">
                <div className="pivot-section-header rows-header">
                  <i className="pi pi-bars"></i>
                  <span className="pivot-section-label">Rows (Group By)</span>
                </div>
                <Dropdown
                  value={null}
                  options={getCategoricalFields}
                  onChange={(e) => {
                    if (e.value && !localPivotConfig.rows.includes(e.value)) {
                      setLocalPivotConfig(prev => ({
                        ...prev,
                        rows: [...prev.rows, e.value]
                      }));
                    }
                  }}
                  placeholder="Add row grouping..."
                  className="w-full"
                />
                <div className="pivot-selected-items">
                  {localPivotConfig.rows.length === 0 ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>No row grouping selected</div>
                    </div>
                  ) : (
                    localPivotConfig.rows.map((row, index) => (
                      <div key={index} className="pivot-selected-item rows-item">
                        <span className="pivot-selected-item-label">
                          {getCategoricalFields.find(f => f.value === row)?.label || row}
                        </span>
                        <Button
                          icon="pi pi-times"
                          className="p-button-text p-button-sm p-button-danger"
                          onClick={() => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              rows: prev.rows.filter((_, i) => i !== index)
                            }));
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Columns Configuration */}
              <div className="pivot-section">
                <div className="pivot-section-header columns-header">
                  <i className="pi pi-table"></i>
                  <span className="pivot-section-label">Columns (Pivot By)</span>
                </div>
                <Dropdown
                  value={null}
                  options={getCategoricalFields}
                  onChange={(e) => {
                    if (e.value && !localPivotConfig.columns.includes(e.value)) {
                      setLocalPivotConfig(prev => ({
                        ...prev,
                        columns: [...prev.columns, e.value]
                      }));
                    }
                  }}
                  placeholder="Add column grouping..."
                  className="w-full"
                />
                <div className="pivot-selected-items">
                  {localPivotConfig.columns.length === 0 ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>No column grouping selected</div>
                    </div>
                  ) : (
                    localPivotConfig.columns.map((col, index) => (
                      <div key={index} className="pivot-selected-item columns-item">
                        <span className="pivot-selected-item-label">
                          {getCategoricalFields.find(f => f.value === col)?.label || col}
                        </span>
                        <Button
                          icon="pi pi-times"
                          className="p-button-text p-button-sm p-button-danger"
                          onClick={() => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              columns: prev.columns.filter((_, i) => i !== index)
                            }));
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Values Configuration */}
              <div className="pivot-section pivot-values-section">
                <div className="pivot-section-header values-header">
                  <i className="pi pi-calculator"></i>
                  <span className="pivot-section-label">Values (Aggregations)</span>
                </div>
                <Dropdown
                  value={null}
                  options={getNumericFields}
                  onChange={(e) => {
                    if (e.value && !localPivotConfig.values.find(v => v.field === e.value)) {
                      setLocalPivotConfig(prev => ({
                        ...prev,
                        values: [...prev.values, { field: e.value, aggregation: 'sum' }]
                      }));
                    }
                  }}
                  placeholder="Add value field..."
                  className="w-full"
                />
                <div className="pivot-selected-items">
                  {localPivotConfig.values.length === 0 ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>No value fields selected</div>
                    </div>
                  ) : (
                    localPivotConfig.values.map((value, index) => (
                      <div key={index} className="pivot-value-item">
                        <div className="pivot-value-item-header">
                          <span className="pivot-value-item-label">
                            {getNumericFields.find(f => f.value === value.field)?.label || value.field}
                          </span>
                          <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm p-button-danger"
                            onClick={() => {
                              setLocalPivotConfig(prev => ({
                                ...prev,
                                values: prev.values.filter((_, i) => i !== index)
                              }));
                            }}
                          />
                        </div>
                        <Dropdown
                          value={value.aggregation}
                          options={aggregationOptions}
                          onChange={(e) => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              values: prev.values.map((v, i) => 
                                i === index ? { ...v, aggregation: e.value } : v
                              )
                            }));
                          }}
                          className="w-full"
                          placeholder="Select aggregation..."
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Value Aggregations (Meta-Aggregations) */}
              <div className="pivot-section pivot-meta-aggregations-section">
                <div className="pivot-section-header meta-aggregations-header">
                  <i className="pi pi-chart-bar"></i>
                  <span className="pivot-section-label">Value Aggregations</span>
                  <span className="pivot-section-subtitle" style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                    Aggregate the already-aggregated values
                  </span>
                </div>
                
                {/* Available Value Aggregations Dropdown */}
                {localPivotConfig.values.length > 0 && (
                  <Dropdown
                    value={null}
                    options={localPivotConfig.values.map(v => ({
                      label: `${getNumericFields.find(f => f.value === v.field)?.label || v.field} (${v.aggregation})`,
                      value: `${v.field}_${v.aggregation}`
                    }))}
                    onChange={(e) => {
                      if (e.value && !localPivotConfig.metaAggregations?.find(ma => ma.sourceKey === e.value)) {
                        const [field, aggregation] = e.value.split('_');
                        setLocalPivotConfig(prev => ({
                          ...prev,
                          metaAggregations: [
                            ...(prev.metaAggregations || []),
                            { 
                              sourceKey: e.value,
                              field: field,
                              sourceAggregation: aggregation,
                              metaAggregation: 'max'
                            }
                          ]
                        }));
                      }
                    }}
                    placeholder="Add aggregation for value..."
                    className="w-full"
                  />
                )}
                
                <div className="pivot-selected-items">
                  {(!localPivotConfig.metaAggregations || localPivotConfig.metaAggregations.length === 0) ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>
                        {localPivotConfig.values.length === 0 
                          ? "Add value fields first to enable value aggregations"
                          : "No value aggregations selected"
                        }
                      </div>
                    </div>
                  ) : (
                    localPivotConfig.metaAggregations.map((metaAgg, index) => (
                      <div key={index} className="pivot-value-item">
                        <div className="pivot-value-item-header">
                          <span className="pivot-value-item-label">
                            {getNumericFields.find(f => f.value === metaAgg.field)?.label || metaAgg.field} ({metaAgg.sourceAggregation})
                          </span>
                          <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm p-button-danger"
                            onClick={() => {
                              setLocalPivotConfig(prev => ({
                                ...prev,
                                metaAggregations: prev.metaAggregations.filter((_, i) => i !== index)
                              }));
                            }}
                          />
                        </div>
                        <Dropdown
                          value={metaAgg.metaAggregation}
                          options={aggregationOptions}
                          onChange={(e) => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              metaAggregations: prev.metaAggregations.map((ma, i) => 
                                i === index ? { ...ma, metaAggregation: e.value } : ma
                              )
                            }));
                          }}
                          className="w-full"
                          placeholder="Select meta-aggregation..."
                        />
                        <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                          {metaAgg.metaAggregation?.toUpperCase()} of {getNumericFields.find(f => f.value === metaAgg.field)?.label || metaAgg.field} {metaAgg.sourceAggregation?.toUpperCase()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Display Options */}
              <div className="pivot-display-section">
                <div className="pivot-display-header">
                  <i className="pi pi-cog"></i>
                  <span className="pivot-section-label">Display Options</span>
                </div>
                <div className="pivot-display-options">
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showGrandTotals"
                      checked={localPivotConfig.showGrandTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showGrandTotals: e.checked }))}
                    />
                    <label htmlFor="showGrandTotals">Grand Totals</label>
                  </div>
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showRowTotals"
                      checked={localPivotConfig.showRowTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showRowTotals: e.checked }))}
                    />
                    <label htmlFor="showRowTotals">Row Totals</label>
                  </div>
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showColumnTotals"
                      checked={localPivotConfig.showColumnTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showColumnTotals: e.checked }))}
                    />
                    <label htmlFor="showColumnTotals">Column Totals</label>
                  </div>
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showSubTotals"
                      checked={localPivotConfig.showSubTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showSubTotals: e.checked }))}
                    />
                    <label htmlFor="showSubTotals">Sub Totals</label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pivot-actions">
            <Button
              label="Reset"
              icon="pi pi-refresh"
              className="p-button-outlined p-button-secondary"
              onClick={resetPivotConfig}
              disabled={isSavingPivotConfig}
            />
            
            {/* Manual Save Button - only show if auto-save is disabled */}
            {enablePivotPersistence && finalSaveToCMS && !autoSavePivotConfig && (
              <Button
                label={isSavingPivotConfig ? "Saving..." : "Save"}
                icon={isSavingPivotConfig ? "pi pi-spin pi-spinner" : "pi pi-save"}
                className="p-button-outlined p-button-info"
                onClick={savePivotConfigManually}
                disabled={isSavingPivotConfig}
              />
            )}
            
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-outlined"
              onClick={() => setShowPivotConfig(false)}
              disabled={isSavingPivotConfig}
            />
            
            {/* Apply (Temporary UI Only) */}
            <Button
              label="Apply"
              icon="pi pi-eye"
              className="p-button-outlined p-button-info"
              onClick={applyPivotConfig}
              disabled={
                localPivotConfig.enabled && (localPivotConfig.rows.length === 0 || localPivotConfig.values.length === 0)
              }
              tooltip="Apply temporarily (not saved to CMS)"
              tooltipOptions={{ position: 'top' }}
            />
            
            {/* Apply & Save (Persistent) */}
            {enablePivotPersistence && finalSaveToCMS && (
              <Button
                label={isSavingPivotConfig ? "Applying & Saving..." : "Apply & Save"}
                icon={isSavingPivotConfig ? "pi pi-spin pi-spinner" : "pi pi-check"}
                className="p-button-success"
                onClick={applyAndSavePivotConfig}
                disabled={
                  isSavingPivotConfig || 
                  (localPivotConfig.enabled && (localPivotConfig.rows.length === 0 || localPivotConfig.values.length === 0))
                }
                tooltip="Apply and save to CMS for persistence"
                tooltipOptions={{ position: 'top' }}
              />
            )}
          </div>
      </Dialog>
            </div>
  );
};

export default PrimeDataTable; 