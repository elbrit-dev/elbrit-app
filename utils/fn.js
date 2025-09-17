// Centralized utilities exposed to Plasmic via DataProvider `fn`.
// Extracted from pages/_app.js to avoid shipping this code on every page.

import { advancedMerge } from '../components/utils/dataUtils';

// Advanced universal deep flattener with renaming and dynamic prefix mapping
const flatten = (renameMapOrData, maybeData, options = {}) => {
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

  const generatePrefixMap = (prefix = 'node_items_', replacement = null, count = 25) => {
    const map = {};
    for (let i = 0; i < count; i++) {
      map[`${prefix}${i}_`] = replacement;
    }
    return map;
  };

  let renameMap = {};
  let input = renameMapOrData;
  if (maybeData !== undefined) {
    renameMap = renameMapOrData || {};
    input = maybeData;
  }

  const prefixMap =
    typeof options.prefixMap === 'function' ? options.prefixMap(generatePrefixMap) : options.prefixMap || {};

  if (Array.isArray(input)) {
    return input.map((entry) => {
      const flatRow = flat(entry);
      const renamed = {};
      Object.entries(flatRow).forEach(([k, v]) => {
        let newKey = renameMap[k];
        if (!newKey) {
          const matchedPrefix = Object.entries(prefixMap).find(([p]) => k.startsWith(p));
          if (matchedPrefix) {
            const [p, replacement] = matchedPrefix;
            newKey = replacement === null ? k.replace(p, '') : k.replace(p, replacement);
          } else {
            newKey = k;
          }
        }
        renamed[newKey] = v;
      });
      return renamed;
    });
  }

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
              const matchedPrefix = Object.entries(prefixMap).find(([p]) => k.startsWith(p));
              if (matchedPrefix) {
                const [p, replacement] = matchedPrefix;
                newKey = replacement === null ? k.replace(p, '') : k.replace(p, replacement);
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

const fn = {
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
          ...groupBy.reduce((acc, k) => ({
            ...acc,
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
    if (!Array.isArray(data)) return [];
    const toNumber = v => +String(v || "").replace(/,/g, "") || 0;
    const numericKeys = Object.keys(data[0] || {}).filter(k => !by.includes(k) && data.some(r => !Number.isNaN(toNumber(r[k]))));
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
          acc[key][f] += toNumber(row[f])
        })
      }
      return acc
    }, {});
    return Object.values(grouped)
  },

  pivote: (by, keys, values, mode = "sum", ignoreZeros = true) => data => {
    if (!Array.isArray(data)) return [];
    const singleValue = values.length === 1;
    const toNumber = v => +String(v || "").replace(/,/g, "") || 0;
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
        const val = mode === "count" ? 1 : toNumber(r[v]);
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
      itemPath = "node.items",
      parentPrefix = "",
      childPrefix = "",
      includeParentPaths = []
    } = options;

    const get = (obj, path) =>
      path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

    const flat = (obj, prefix = '', res = {}) => {
      if (!obj || typeof obj !== 'object') return res;
      for (const [k, v] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}_${k}` : k;
        if (Array.isArray(v)) continue;
        if (v && typeof v === 'object') {
          flat(v, newKey, res);
        } else {
          res[newKey] = v;
        }
      }
      return res;
    };

    return data.flatMap(entry => {
      const parentObject = get(entry, itemPath.split('.').slice(0, -1).join('.')) || {};
      const parentFlatFull = flat(parentObject, parentPrefix);
      const parentFlat = includeParentPaths.length > 0
        ? Object.fromEntries(
            Object.entries(parentFlatFull).filter(([k]) =>
              includeParentPaths.includes(k)
            )
          )
        : parentFlatFull;
      const items = get(entry, itemPath) || [];
      return items.map(child => {
        const childFlat = flat(child, childPrefix);
        return {
          ...parentFlat,
          ...childFlat
        };
      });
    });
  },

  // URL encoding/decoding helpers
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

  // Expose flatten
  flatten
};

export default fn;


