import React from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const GroupedDataExample = () => {
  // Example grouped data structure like your $queries.serviceVsSupport.data.response.data
  const groupedData = {
    service: [
      {
        drCode: "00034943",
        drName: "TARUN PRAKESH PARASHAR",
        hq: "Jaipur",
        salesTeam: "Elbrit Rajasthan",
        serviceAmount: 20000,
        serviceId: "250400137",
        serviceMonth: "Apr-2025",
        serviceDate: "2025-04-18",
        date: "2025-04-01"
      },
      {
        drCode: "00034944",
        drName: "JOHN DOE",
        hq: "Mumbai",
        salesTeam: "Elbrit Maharashtra",
        serviceAmount: 15000,
        serviceId: "250400138",
        serviceMonth: "Apr-2025",
        serviceDate: "2025-04-19",
        date: "2025-04-01"
      }
    ],
    support: [
      {
        drCode: "00059156",
        drName: "JANE SMITH",
        salesTeam: "Elbrit Delhi",
        supportValue: 3314,
        supportType: "Technical",
        supportPriority: "High",
        date: "2025-03-01"
      },
      {
        drCode: "00059157",
        drName: "BOB JOHNSON",
        salesTeam: "Elbrit Bangalore",
        supportValue: 2500,
        supportType: "General",
        supportPriority: "Medium",
        date: "2025-03-02"
      }
    ],
    marketing: [
      {
        drCode: "00078901",
        drName: "ALICE WILSON",
        salesTeam: "Elbrit Mumbai",
        marketingBudget: 5000,
        campaignType: "Digital",
        targetAudience: "B2B",
        date: "2025-04-01"
      }
    ]
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Auto-Grouped Data Example</h1>
      <p>This example shows how the table automatically detects and groups data when passed in the format with multiple arrays:</p>
      <pre>{`{
  service: [/* service rows */],
  support: [/* support rows */],
  marketing: [/* marketing rows */]
}`}</pre>
      <p><strong>Features:</strong></p>
      <ul>
        <li>✅ <strong>Auto-detection:</strong> Detects when data has multiple arrays (groups)</li>
        <li>✅ <strong>Common columns:</strong> Shows columns that exist in ALL groups first (drCode, drName, salesTeam, date)</li>
        <li>✅ <strong>Unique columns:</strong> Shows group-specific columns (serviceAmount, supportValue, marketingBudget, etc.)</li>
        <li>✅ <strong>Visual distinction:</strong> Common columns have green headers, unique columns have blue headers</li>
        <li>✅ <strong>Group headers:</strong> Shows group names with record counts</li>
      </ul>
      
      <PrimeDataTable
        data={groupedData}
        enableSearch={true}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={true}
        enableExport={true}
        pageSize={10}
        tableSize="normal"
      />
    </div>
  );
};

export default GroupedDataExample; 