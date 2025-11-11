import React, { useState, useMemo, useCallback } from 'react';

/**
 * CompactDataTable - Ultra-lightweight, mobile-first responsive table
 * 
 * Minimal design with maximum performance
 * All sizing in rem/em for perfect responsiveness
 * 
 * @param {Array} data - Table data
 * @param {Array} columns - Column definitions
 * @param {String} expandKey - Key for nested data (default: 'items')
 */
const CompactDataTable = ({ 
  data = [], 
  columns = [], 
  expandKey = 'items',
  onExport,
  className = ''
}) => {
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ key: null, asc: true });

  // Filter & sort data
  const processed = useMemo(() => {
    let result = [...data];

    // Global search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(row =>
        columns.some(col => String(row[col.key] || '').toLowerCase().includes(s))
      );
    }

    // Column filters
    Object.keys(filters).forEach(key => {
      const f = filters[key];
      if (f) {
        result = result.filter(row =>
          String(row[key] || '').toLowerCase().includes(f.toLowerCase())
        );
      }
    });

    // Sort
    if (sort.key) {
      result.sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (typeof av === 'number' && typeof bv === 'number') {
          return sort.asc ? av - bv : bv - av;
        }
        const as = String(av || '').toLowerCase();
        const bs = String(bv || '').toLowerCase();
        return sort.asc ? as.localeCompare(bs) : bs.localeCompare(as);
      });
    }

    return result;
  }, [data, search, filters, sort, columns]);

  // Toggle expand
  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  // Expand/collapse all
  const expandAll = () => {
    const all = {};
    data.forEach((r, i) => {
      if (r[expandKey]?.length) all[i] = true;
    });
    setExpanded(all);
  };
  const collapseAll = () => setExpanded({});

  // Export CSV
  const exportCsv = useCallback(() => {
    if (onExport) return onExport(processed);
    
    const csv = [
      columns.map(c => c.title).join(','),
      ...processed.map(r => columns.map(c => String(r[c.key] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
  }, [processed, columns, onExport]);

  return (
    <div className={`compact-table ${className}`}>
      {/* Toolbar */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="🔍 Search all..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search"
        />
        <div className="actions">
          <button onClick={expandAll} className="btn">⬇️ Expand</button>
          <button onClick={collapseAll} className="btn">⬆️ Collapse</button>
          <button onClick={exportCsv} className="btn primary">📥 Export</button>
        </div>
      </div>

      {/* Table */}
      <div className="scroll">
        <table>
          <thead>
            {/* Headers */}
            <tr>
              <th style={{ width: '2.5em' }}></th>
              {columns.map((col, i) => (
                <th
                  key={i}
                  onClick={() => setSort({ key: col.key, asc: sort.key === col.key ? !sort.asc : true })}
                  style={{ textAlign: col.align || 'left', cursor: 'pointer' }}
                >
                  {col.title}
                  {sort.key === col.key && (sort.asc ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
            {/* Filters */}
            <tr className="filter-row">
              <th></th>
              {columns.map((col, i) => (
                <th key={i}>
                  <input
                    type="text"
                    placeholder={`Filter...`}
                    value={filters[col.key] || ''}
                    onChange={e => setFilters(p => ({ ...p, [col.key]: e.target.value }))}
                    className="filter-input"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processed.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '2em', color: '#999' }}>
                  No data found
                </td>
              </tr>
            ) : (
              processed.map((row, idx) => {
                const hasNested = row[expandKey]?.length > 0;
                const isExpanded = expanded[idx];

                return (
                  <React.Fragment key={idx}>
                    {/* Main row */}
                    <tr className={idx % 2 === 0 ? 'even' : 'odd'}>
                      <td
                        onClick={() => hasNested && toggle(idx)}
                        style={{
                          cursor: hasNested ? 'pointer' : 'default',
                          textAlign: 'center',
                          color: hasNested ? '#3b82f6' : '#ddd'
                        }}
                      >
                        {hasNested && (isExpanded ? '▼' : '▶')}
                      </td>
                      {columns.map((col, i) => {
                        let val = row[col.key];
                        if (col.format) val = col.format(val);
                        else if (typeof val === 'number') val = val.toLocaleString();
                        return (
                          <td key={i} style={{ textAlign: col.align || 'left' }}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Nested rows */}
                    {hasNested && isExpanded && (
                      <tr>
                        <td colSpan={columns.length + 1} className="nested-cell">
                          <div className="nested-container">
                            <table className="nested-table">
                              <thead>
                                <tr>
                                  {columns.map((col, i) => (
                                    <th key={i} style={{ textAlign: col.align || 'left' }}>
                                      {col.title}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {row[expandKey].map((nested, ni) => (
                                  <tr key={ni}>
                                    {columns.map((col, ci) => {
                                      let val = nested[col.key];
                                      if (col.format) val = col.format(val);
                                      else if (typeof val === 'number') val = val.toLocaleString();
                                      return (
                                        <td key={ci} style={{ textAlign: col.align || 'left' }}>
                                          {val}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="footer">
        Showing {processed.length} of {data.length} records
      </div>

      {/* Styles */}
      <style jsx>{`
        .compact-table {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.875rem;
        }

        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          align-items: center;
        }

        .search {
          flex: 1 1 15rem;
          min-width: 12rem;
          padding: 0.625rem 0.875rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }

        .search:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.625rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .btn.primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .btn.primary:hover {
          background: #2563eb;
        }

        .scroll {
          overflow: auto;
          max-height: 70vh;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          background: white;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        thead {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #f8fafc;
        }

        th {
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
          white-space: nowrap;
          user-select: none;
        }

        th:hover {
          background: #f1f5f9;
        }

        .filter-row th {
          padding: 0.5rem;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 3rem;
        }

        .filter-input {
          width: 100%;
          padding: 0.375rem 0.5rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.25rem;
          font-size: 0.8125rem;
          outline: none;
        }

        .filter-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }

        tr.even {
          background: white;
        }

        tr.odd {
          background: #f9fafb;
        }

        tbody tr:hover {
          background: #f1f5f9;
        }

        .nested-cell {
          padding: 0 !important;
          background: #f8fafc !important;
        }

        .nested-container {
          padding: 1rem 1rem 1rem 3rem;
        }

        .nested-table {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          overflow: hidden;
          font-size: 0.8125rem;
        }

        .nested-table thead {
          background: #f1f5f9;
          position: static;
        }

        .nested-table th {
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }

        .nested-table td {
          padding: 0.5rem 0.75rem;
          color: #64748b;
        }

        .footer {
          padding: 0.75rem 1rem;
          text-align: center;
          font-size: 0.8125rem;
          color: #64748b;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .compact-table {
            font-size: 0.75rem;
          }

          .toolbar {
            padding: 0.75rem;
          }

          .search {
            min-width: 100%;
            font-size: 0.75rem;
            padding: 0.5rem 0.75rem;
          }

          .actions {
            width: 100%;
            justify-content: space-between;
          }

          .btn {
            flex: 1;
            padding: 0.5rem 0.75rem;
            font-size: 0.75rem;
          }

          th, td {
            padding: 0.5rem;
            font-size: 0.75rem;
          }

          .filter-row th {
            padding: 0.375rem;
          }

          .nested-container {
            padding: 0.75rem 0.75rem 0.75rem 2rem;
          }

          .scroll {
            max-height: 60vh;
          }
        }

        @media (max-width: 480px) {
          .compact-table {
            font-size: 0.6875rem;
          }

          th, td {
            padding: 0.375rem 0.5rem;
            font-size: 0.6875rem;
          }

          .btn {
            padding: 0.375rem 0.5rem;
            font-size: 0.6875rem;
          }

          .nested-container {
            padding: 0.5rem 0.5rem 0.5rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CompactDataTable;

