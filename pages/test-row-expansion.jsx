import React, { useState } from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const TestRowExpansion = () => {
  const [expandedRows, setExpandedRows] = useState({});

  // Sample data matching your structure
  const sampleData = [
    {
      id: "EBS042",
      Customer: "AADITYA PHARMEX",
      EBSCode: "EBS042",
      HQ: "Chennai",
      Incentive: 2000,
      CreditNote: -500,
      invoices: [
        {
          Invoice: "INV-25-10451",
          PostingDate: "2025-07-05",
          HQ: "HQ-Madurai",
          Incentive: 1200,
          CreditNote: 0
        },
        {
          Invoice: "INV-25-10452",
          PostingDate: "2025-07-06",
          HQ: "HQ-Chennai",
          Incentive: 800,
          CreditNote: -500
        }
      ]
    },
    {
      id: "EBS043",
      Customer: "MEDICARE PLUS",
      EBSCode: "EBS043",
      HQ: "Mumbai",
      Incentive: 1500,
      CreditNote: 0,
      invoices: [
        {
          Invoice: "INV-25-10453",
          PostingDate: "2025-07-07",
          HQ: "HQ-Mumbai",
          Incentive: 1500,
          CreditNote: 0
        }
      ]
    }
  ];

  const handleRowToggle = (e) => {
    setExpandedRows(e.data);
    console.log('Row toggle:', e.data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Row Expansion Test</h1>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          Instructions:
        </h2>
        <ul className="text-blue-700 space-y-1">
          <li>• Click the expand icon (▶️) in the first column to expand rows</li>
          <li>• The expanded content will show a nested table with invoice details</li>
          <li>• This should work without the React error #31</li>
        </ul>
      </div>
      
      <PrimeDataTable
        data={sampleData}
        enableRowExpansion={true}
        expandedRows={expandedRows}
        onRowToggle={handleRowToggle}
        
        // Basic table features
        enableSearch={true}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={true}
        pageSize={10}
        
        // Styling
        enableGridLines={true}
        enableStripedRows={true}
        enableHoverEffect={true}
        tableSize="normal"
        
        // Export
        enableExport={true}
        exportFilename="test-data"
        
        // Column management
        enableColumnManagement={true}
      />
    </div>
  );
};

export default TestRowExpansion;
