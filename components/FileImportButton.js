import React, { useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, FileText, CheckCircle, XCircle, Loader } from "lucide-react";

// Dynamic imports for PrimeReact components
const Button = dynamic(() => import('primereact/button').then(m => m.Button), { ssr: false });
const FileUpload = dynamic(() => import('primereact/fileupload').then(m => m.FileUpload), { ssr: false });
const Dialog = dynamic(() => import('primereact/dialog').then(m => m.Dialog), { ssr: false });
const ProgressBar = dynamic(() => import('primereact/progressbar').then(m => m.ProgressBar), { ssr: false });

/**
 * FileImportButton - A component to upload and import CSV/Excel files
 * 
 * Features:
 * - Upload CSV (.csv) and Excel (.xlsx, .xls) files
 * - Automatically converts files to JSON array
 * - Preview imported data
 * - Save data to global state or use via callback
 * - Progress indicator during import
 * 
 * Props:
 * @param {Function} onImportComplete - Callback function called with imported data array
 * @param {string} stateKey - Optional key to save data to global state ($ctx.state[stateKey])
 * @param {Function} setState - Optional setState function (bind to $ctx.fn.setState in Plasmic)
 * @param {string} label - Button label (default: 'Import File')
 * @param {string} icon - Icon to display (default: Upload from lucide-react)
 * @param {string} iconPosition - Icon position: 'left' or 'right' (default: 'left')
 * @param {boolean} iconOnly - Show only icon without label (default: false)
 * @param {string} className - Custom class name for button
 * @param {string} size - Button size: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} disabled - Disable button (default: false)
 * @param {string} variant - Button variant: 'primary', 'secondary', 'outline', 'light' (default: 'primary')
 * @param {boolean} showPreview - Show preview dialog after import (default: true)
 * @param {number} maxFileSize - Maximum file size in MB (default: 10)
 * @param {boolean} firstRowAsHeader - Use first row as headers (default: true)
 * @param {Function} onError - Callback for error handling
 */

const FileImportButton = ({
  onImportComplete,
  stateKey = null,
  setState = null,
  label = 'Import File',
  iconPosition = 'left',
  iconOnly = false,
  className = '',
  size = 'medium',
  disabled = false,
  variant = 'primary',
  showPreview = true,
  maxFileSize = 10,
  firstRowAsHeader = true,
  onError,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedData, setImportedData] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  // Get setState function from props or try to access from global context
  const getSetState = useCallback(() => {
    // First, use the setState prop if provided
    if (setState && typeof setState === 'function') {
      return setState;
    }
    // Try to access from window if available (for Plasmic context)
    if (typeof window !== 'undefined') {
      // Try multiple possible locations
      if (window.__plasmicContext?.fn?.setState) {
        return window.__plasmicContext.fn.setState;
      }
      // Try accessing via DataProvider context (if available)
      if (window.plasmicDataContext?.fn?.setState) {
        return window.plasmicDataContext.fn.setState;
      }
    }
    return null;
  }, [setState]);

  // Parse CSV file
  const parseCSV = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          // Parse CSV (handles quoted values and commas)
          const parseCSVLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              
              if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  current += '"';
                  i++; // Skip next quote
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };

          const rows = lines.map(line => parseCSVLine(line));
          
          let headers = [];
          let dataRows = rows;

          if (firstRowAsHeader && rows.length > 0) {
            headers = rows[0].map(h => h.trim());
            dataRows = rows.slice(1);
          } else {
            // Generate headers if not using first row
            const maxCols = Math.max(...rows.map(r => r.length));
            headers = Array.from({ length: maxCols }, (_, i) => `Column${i + 1}`);
          }

          // Convert to JSON array
          const jsonData = dataRows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Error parsing CSV: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Error reading CSV file'));
      reader.readAsText(file);
    });
  }, [firstRowAsHeader]);

  // Parse Excel file
  const parseExcel = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: '', // Default value for empty cells
            raw: false, // Convert dates and numbers to strings
          });

          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty or has no data'));
            return;
          }

          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Error parsing Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Error reading Excel file'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (event) => {
    const file = event.files[0];
    
    if (!file) {
      setError('No file selected');
      return;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      const errorMsg = `File size exceeds maximum allowed size of ${maxFileSize}MB`;
      setError(errorMsg);
      if (onError) onError(new Error(errorMsg));
      return;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    
    if (!allowedExtensions.includes(fileExtension)) {
      const errorMsg = `Unsupported file type. Please upload CSV or Excel files (.csv, .xlsx, .xls)`;
      setError(errorMsg);
      if (onError) onError(new Error(errorMsg));
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setError(null);
    setFileName(file.name);

    try {
      setImportProgress(30);
      
      let jsonData;
      
      if (fileExtension === 'csv') {
        jsonData = await parseCSV(file);
      } else {
        jsonData = await parseExcel(file);
      }

      setImportProgress(80);
      
      // Set imported data
      setImportedData(jsonData);
      
      // Save to global state if stateKey is provided
      if (stateKey) {
        const setState = getSetState();
        if (setState) {
          setState(stateKey, jsonData, (newValue) => {
            console.log(`Data saved to $ctx.state.${stateKey}`, newValue.length, 'rows');
          });
        } else {
          console.warn('setState not available. Make sure you are using this component within Plasmic context.');
        }
      }

      // Call callback if provided
      if (onImportComplete) {
        onImportComplete(jsonData, file.name);
      }

      setImportProgress(100);
      
      // Show preview dialog if enabled
      if (showPreview) {
        setTimeout(() => {
          setShowPreviewDialog(true);
          setIsImporting(false);
        }, 500);
      } else {
        setIsImporting(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      setError(error.message || 'An error occurred while importing the file');
      setIsImporting(false);
      if (onError) onError(error);
    }
  }, [parseCSV, parseExcel, onImportComplete, stateKey, showPreview, maxFileSize, onError, getSetState]);

  // Get file icon based on type
  const getFileIcon = (fileName) => {
    if (!fileName) return <Upload size={20} />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'csv') return <FileText size={20} />;
    return <FileSpreadsheet size={20} />;
  };

  // Button size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
  };

  return (
    <div className="file-import-button-wrapper">
      <div className="relative inline-block">
        <FileUpload
          mode="basic"
          name="file"
          accept=".csv,.xlsx,.xls"
          maxFileSize={maxFileSize * 1024 * 1024}
          customUpload
          uploadHandler={handleFileUpload}
          auto
          chooseLabel={iconOnly ? '' : label}
          chooseOptions={{
            icon: iconOnly ? getFileIcon(fileName) : undefined,
            iconPos: iconPosition,
            label: iconOnly ? '' : label,
            className: `
              ${sizeClasses[size] || sizeClasses.medium}
              ${variantClasses[variant] || variantClasses.primary}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              rounded-md font-medium transition-colors duration-200
              flex items-center gap-2
              ${className}
            `,
            disabled: disabled || isImporting
          }}
          disabled={disabled || isImporting}
        />
        
        {isImporting && (
          <div className="absolute -bottom-8 left-0 right-0 mt-2">
            <ProgressBar value={importProgress} showValue={false} className="h-1" />
            <p className="text-xs text-gray-600 mt-1 text-center">
              Importing... {Math.round(importProgress)}%
            </p>
          </div>
        )}

        {error && (
          <div className="absolute -bottom-8 left-0 right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
            <div className="flex items-center gap-2">
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      {showPreview && importedData && (
        <Dialog
          visible={showPreviewDialog}
          onHide={() => setShowPreviewDialog(false)}
          header={`Import Successful - ${fileName}`}
          modal
          style={{ width: '90vw', maxWidth: '1200px' }}
          className="file-import-preview-dialog"
        >
          <div className="p-4">
            <div className="mb-4 flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span className="font-medium">
                Successfully imported {importedData.length} row{importedData.length !== 1 ? 's' : ''}
              </span>
            </div>

            {stateKey && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
                <strong>Data saved to:</strong> $ctx.state.{stateKey}
              </div>
            )}

            <div className="max-h-96 overflow-auto border rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {Object.keys(importedData[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importedData.slice(0, 100).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap"
                        >
                          {String(value || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {importedData.length > 100 && (
                <div className="p-2 bg-gray-50 text-center text-xs text-gray-600">
                  Showing first 100 rows of {importedData.length} total rows
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                label="Close"
                onClick={() => setShowPreviewDialog(false)}
                className="p-button-secondary"
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default FileImportButton;

