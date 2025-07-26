import React from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

// Your actual data structure
const yourData = [
  {
    drCode: "00000001",
    drName: "Yuvaraj",
    salesTeam: "Elbrit Coimbatore",
    "2025-04-01__serviceAmount": 0,
    "2025-04-01__supportValue": 16521,
    "serviceAmount Total": 0,
    "supportValue Total": 16521
  },
  {
    drCode: "00000002", 
    drName: "Yuvaraj",
    salesTeam: "CND Coimbatore",
    "2025-04-01__serviceAmount": 5000,
    "2025-04-01__supportValue": 12000,
    "serviceAmount Total": 5000,
    "supportValue Total": 12000
  },
  {
    drCode: "00000003",
    drName: "Yuvaraj", 
    salesTeam: "Vasco Coimbatore",
    "2025-04-01__serviceAmount": 3500,
    "2025-04-01__supportValue": 8500,
    "serviceAmount Total": 3500,
    "supportValue Total": 8500
  },
  {
    drCode: "00000004",
    drName: "Yasmine Basha",
    salesTeam: "Elbrit Chennai", 
    "2025-04-01__serviceAmount": 7500,
    "2025-04-01__supportValue": 14500,
    "serviceAmount Total": 7500,
    "supportValue Total": 14500
  },
  {
    drCode: "00000005",
    drName: "Vinothkumar",
    salesTeam: "Elbrit Bangalore",
    "2025-04-01__serviceAmount": 4000, 
    "2025-04-01__supportValue": 9000,
    "serviceAmount Total": 4000,
    "supportValue Total": 9000
  }
];

const YourDataPivotExample = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Your Data Pivot Examples</h1>
      
      {/* Example 1: Simple Grouping (Recommended) */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Example 1: Group by Doctor and Sales Team</h2>
        <p className="mb-4 text-gray-600">
          This is the recommended configuration for your data structure
        </p>
        <PrimeDataTable
          data={yourData}
          enablePivotTable={true}
          pivotConfig={{
            enabled: true,
            rows: ["drName", "salesTeam"], // Group by doctor name and sales team
            columns: [], // No column pivoting
            values: [
              { field: "supportValue Total", aggregation: "sum" },
              { field: "serviceAmount Total", aggregation: "sum" }
            ],
            showGrandTotals: true,
            showRowTotals: false, // Not needed when no column pivoting
            numberFormat: "en-US",
            currency: "USD",
            precision: 0
          }}
          currencyColumns={["supportValue Total", "serviceAmount Total"]}
          enableExport={true}
          enableSearch={true}
          enableColumnFilter={true}
        />
      </div>

      {/* Example 2: Pivot on drCode (Might not make sense for your data) */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Example 2: Pivot on drCode</h2>
        <p className="mb-4 text-gray-600">
          This creates columns for each unique drCode value (might not be useful)
        </p>
        <PrimeDataTable
          data={yourData}
          enablePivotTable={true}
          pivotConfig={{
            enabled: true,
            rows: ["drName", "salesTeam"], // Group by doctor name and sales team
            columns: ["drCode"], // Pivot on drCode
            values: [
              { field: "supportValue Total", aggregation: "sum" }
            ],
            showGrandTotals: true,
            showRowTotals: true,
            numberFormat: "en-US",
            currency: "USD",
            precision: 0
          }}
          currencyColumns={["supportValue Total"]}
          enableExport={true}
          enableSearch={true}
          enableColumnFilter={true}
        />
      </div>

      {/* Example 3: Use Column Grouping Instead (Alternative approach) */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Example 3: Column Grouping (Alternative)</h2>
        <p className="mb-4 text-gray-600">
          Use column grouping to organize your complex field names
        </p>
        <PrimeDataTable
          data={yourData}
          enablePivotTable={false} // Disable pivot table
          enableColumnGrouping={true}
          enableAutoColumnGrouping={true}
          groupConfig={{
            enableHeaderGroups: true,
            enableFooterGroups: true,
            fieldSeparator: "__",
            dateFieldPattern: /^\d{4}-\d{2}-\d{2}$/,
            customGroupMappings: {
              "service": "Service Metrics",
              "support": "Support Metrics"
            }
          }}
          currencyColumns={["serviceAmount Total", "supportValue Total"]}
          numberFilterColumns={["serviceAmount Total", "supportValue Total"]}
          enableSearch={true}
          enableExport={true}
        />
      </div>

      {/* Configuration Guide */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Recommended Configuration for Your Data</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">✅ Recommended (Example 1)</h4>
            <code className="text-sm bg-white p-2 rounded block">
              pivotRows: ["drName", "salesTeam"]<br/>
              pivotColumns: []<br/>
              pivotValues: [<br/>
              &nbsp;&nbsp;{"field": "supportValue Total", "aggregation": "sum"},<br/>
              &nbsp;&nbsp;{"field": "serviceAmount Total", "aggregation": "sum"}<br/>
              ]
            </code>
            <p className="text-sm text-gray-600 mt-1">Groups by doctor and team, shows totals</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">❌ Your Current Config</h4>
            <code className="text-sm bg-white p-2 rounded block">
              pivotRows: []<br/>
              pivotColumns: ["drCode"]<br/>
              pivotValues: [<br/>
              &nbsp;&nbsp;{"field": "supportValue Total", "aggregation": "sum"}<br/>
              ]
            </code>
            <p className="text-sm text-gray-600 mt-1">This doesn't work well with your data structure</p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">Why Your Current Config Doesn't Work</h4>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Each row has a different <code>drCode</code> value</li>
            <li>Pivoting on <code>drCode</code> creates columns for each unique code</li>
            <li>But each row already has its own <code>supportValue Total</code></li>
            <li>This results in sparse data with mostly empty cells</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default YourDataPivotExample; 