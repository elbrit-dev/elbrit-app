import '../styles/globals.css';
import '../styles/PrintA3.css';
import { AuthProvider } from '../components/AuthContext';
// Lazy-load Plasmic init so it doesn't block app bootstrap
import dynamic from 'next/dynamic';
const PlasmicInit = dynamic(() => import('../plasmic-init'), { ssr: false });
import { DataProvider } from '@plasmicapp/host';

// PrimeReact CSS imports
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primeicons/primeicons.css';

// Ant Design CSS import
import 'antd/dist/reset.css';

import { advancedMerge } from '../components/utils/dataUtils';

// ✅ Advanced universal deep flattener with renaming and dynamic prefix mapping
const flatten = (renameMapOrData, maybeData, options = {}) => {
  // 🔧 Helper to flatten any nested object or array into underscore-joined keys
  const flat = (obj, prefix = '', res = {}) => {
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => flat(item, `${prefix}${prefix ? '_' : ''}${i}`, res));
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, val]) => flat(val, `${prefix}${prefix ? '_' : ''}${key}`, res));
    } else {
      res[prefix] = obj;
    }
    return res;
  };

  // ✅ Internal utility to generate prefixMap dynamically
  const generatePrefixMap = (prefix = 'node_items_', replacement = null, count = 25) => {
    const map = {};
    for (let i = 0; i < count; i++) {
      map[`${prefix}${i}_`] = replacement;
    }
    return map;
  };

  // 📦 Allow usage: flatten(renameMap, data, { prefixMap }) OR flatten(data)
  let renameMap = {};
  let input = renameMapOrData;

  if (maybeData !== undefined) {
    renameMap = renameMapOrData || {};
    input = maybeData;
  }

  // Allow passing dynamic prefixMap generator inline
  const prefixMap =
    typeof options.prefixMap === 'function' ? options.prefixMap(generatePrefixMap) : options.prefixMap || {};

  // ✅ If input is an array, return flattened and renamed rows
  if (Array.isArray(input)) {
    return input.map((entry) => {
      const flatRow = flat(entry);
      const renamed = {};

      Object.entries(flatRow).forEach(([k, v]) => {
        let newKey = renameMap[k];

        if (!newKey) {
          const matchedPrefix = Object.entries(prefixMap).find(([prefix]) => k.startsWith(prefix));

          if (matchedPrefix) {
            const [prefix, replacement] = matchedPrefix;
            newKey = replacement === null ? k.replace(prefix, '') : k.replace(prefix, replacement);
          } else {
            newKey = k;
          }
        }

        renamed[newKey] = v;
      });

      return renamed;
    });
  }

  // ✅ If input is an object with arrays inside (e.g., { service: [], team: [] })
  if (typeof input === 'object' && input !== null) {
    const result = {};
    Object.entries(input).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        result[key] = value.map((entry) => {
          const flatRow = flat(entry);
          const renamed = {};

          Object.entries(flatRow).forEach(([k, v]) => {
            let newKey = renameMap[k];

            if (!newKey) {
              const matchedPrefix = Object.entries(prefixMap).find(([prefix]) => k.startsWith(prefix));

              if (matchedPrefix) {
                const [prefix, replacement] = matchedPrefix;
                newKey = replacement === null ? k.replace(prefix, '') : k.replace(prefix, replacement);
              } else {
                newKey = k;
              }
            }

            renamed[newKey] = v;
          });

          return renamed;
        });
      } else {
        result[key] = value;
      }
    });
    return result;
  }

  return input;
};

// ✅ All utility functions under "fn"
const a = {
  summarize: (groupBy = [], timeKeys = [], sumKeys = []) => (data = []) => {
    const result = [];
    const getGroupKey = row => groupBy.map(k => row?.[k] ?? "").join("||");
    const getTimeKey = row => timeKeys.map(k => row?.[k] ?? "").join("||");
    const map = new Map();
    data.forEach(row => {
      const gKey = getGroupKey(row);
      const tKey = getTimeKey(row);
      if (!map.has(gKey)) {
        map.set(gKey, {
          ...groupBy.reduce((a, k) => ({
            ...a,
            [k]: row[k]
          }), {})
        })
      }
      const entry = map.get(gKey);
      sumKeys.forEach(k => {
        entry[k + "_Total"] = (entry[k + "_Total"] || 0) + (row[k] || 0);
        if (tKey) {
          const colKey = `${tKey}__${k}`;
          entry[colKey] = (entry[colKey] || 0) + (row[k] || 0)
        }
      });
      map.set(gKey, entry)
    });
    return Array.from(map.values())
  },

  aggregate: (by, mode = "sum") => data => {
    if (!Array.isArray(data))
      return [];
    const num = v => +String(v || "").replace(/,/g, "") || 0;
    const numericKeys = Object.keys(data[0] || {}).filter(k => !by.includes(k) && data.some(r => !Number.isNaN(num(r[k]))));
    const grouped = data.reduce((acc, row) => {
      const key = by.map(k => row[k]).join("__");
      if (!acc[key]) {
        acc[key] = Object.fromEntries(by.map(k => [k, row[k]]));
        if (mode === "count") {
          acc[key]._count = 0
        } else {
          numericKeys.forEach(f => acc[key][f] = 0)
        }
      }
      if (mode === "count") {
        acc[key]._count += 1
      } else {
        numericKeys.forEach(f => {
          acc[key][f] += num(row[f])
        })
      }
      return acc
    }, {});
    return Object.values(grouped)
  },

  pivote: (by, keys, values, mode = "sum", ignoreZeros = true) => data => {
    if (!Array.isArray(data))
      return [];
    const singleValue = values.length === 1;
    const num = v => +String(v || "").replace(/,/g, "") || 0;
    const rowKey = r => by.map(k => r[k]).join("__");
    const colKey = r => keys.map(k => r[k]).join("-");
    const rows = {}, colTotals = {};
    data.forEach(r => {
      const rk = rowKey(r), ck = colKey(r);
      rows[rk] ??= {
        ...Object.fromEntries(by.map(k => [k, r[k]])),
        __cols: {},
        __totals: Object.fromEntries(values.map(v => [`${v} Total`, 0]))
      };
      values.forEach(v => {
        const val = mode === "count" ? 1 : num(r[v]);
        const key = singleValue ? ck : `${ck}__${v}`;
        rows[rk].__cols[key] = (rows[rk].__cols[key] || 0) + val;
        rows[rk].__totals[`${v} Total`] += val;
        colTotals[key] = (colTotals[key] || 0) + val
      })
    });
    const allCols = Object.keys(colTotals);
    const activeCols = ignoreZeros ? allCols.filter(c => colTotals[c] > 0) : allCols;
    return Object.values(rows).map(r => ({
      ...Object.fromEntries(by.map(k => [k, r[k]])),
      ...Object.fromEntries(activeCols.filter(k => k in r.__cols).map(k => [k, r.__cols[k]])),
      ...r.__totals
    })).sort((a, b) => String(a[by[0]]).localeCompare(String(b[by[0]])))
  },

  // Advanced merge usable directly from Plasmic via fn.merge(data)
  merge: (input) => advancedMerge(input),

  explodeWithParent: (data = [], options = {}) => {
    const {
      itemPath = "node.items",         // dot path to array of children
      parentPrefix = "",               // optional prefix for parent fields
      childPrefix = "",                // optional prefix for child fields
      includeParentPaths = []          // optional: only include selected parent paths
    } = options;
  
    // 🔍 Safely resolve dot path
    const get = (obj, path) =>
      path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  
    // 🔃 Flatten nested object into flat { a_b_c: value }, skipping arrays at any depth
    const flatten = (obj, prefix = '', res = {}) => {
      if (!obj || typeof obj !== 'object') return res;
      for (const [k, v] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}_${k}` : k;
        if (Array.isArray(v)) {
          // skip arrays entirely (e.g., parent.items)
          continue;
        }
        if (v && typeof v === 'object') {
          flatten(v, newKey, res);
        } else {
          res[newKey] = v;
        }
      }
      return res;
    };
  
    return data.flatMap(entry => {
      const parentPath = itemPath.split('.').slice(0, -1).join('.');
      const parentObject = parentPath ? get(entry, parentPath) : entry;   // 👈 use whole entry when no parentPath
      const parentFlatFull = flatten(parentObject, parentPrefix);
  
      // If includeParentPaths is defined, filter only selected keys
      const parentFlat = includeParentPaths.length > 0
        ? Object.fromEntries(
            Object.entries(parentFlatFull).filter(([k]) =>
              includeParentPaths.includes(k)
            )
          )
        : parentFlatFull;
  
      const items = get(entry, itemPath) || [];
  
      return items.map(child => {
        const childFlat = flatten(child, childPrefix);
        return {
          ...parentFlat,
          ...childFlat
        };
      });
    });
  }
  ,

  // URL encoding/decoding helpers (names as requested)
  enocdeui: (value) => {
    const text = value == null ? '' : String(value);
    try { return encodeURI(text); } catch (e) { return text; }
  },
  encodeuicompeont: (value) => {
    const text = value == null ? '' : String(value);
    try { return encodeURIComponent(text); } catch (e) { return text; }
  },
  decodeui: (value) => {
    const text = value == null ? '' : String(value);
    try { return decodeURI(text); } catch (e) { return text; }
  },
  decodeuicompoent: (value) => {
    const text = value == null ? '' : String(value);
    try { return decodeURIComponent(text); } catch (e) { return text; }
  },

  // ✅ NEW flatten function for dynamic JSON
  flatten
};

// Global error handler to catch unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Check if it's a TypeError related to authentication
    if (event.reason instanceof TypeError) {
      console.warn('TypeError detected in promise rejection. This might be an authentication race condition.');
      
      // Prevent the error from being logged to console
      event.preventDefault();
      
      // Optionally, you could show a user-friendly message here
      // or trigger a retry mechanism
    }
  });
  
  // Also catch regular errors
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    
    // Check if it's a TypeError
    if (event.error instanceof TypeError) {
      console.warn('TypeError detected in global error handler.');
      // You could add specific handling here if needed
    }
  });
}

function MyApp({ Component, pageProps }) {
  return (
    <DataProvider name="fn" data={a}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </DataProvider>
  );
}

export default MyApp; 