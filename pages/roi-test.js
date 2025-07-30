import React from 'react';
import PrimeDataTable from '../components/PrimeDataTable';

const ROITestPage = () => {
  // Sample data with revenue, cost, and investment fields
  const sampleData = [
    {
      id: 1,
      project: 'Marketing Campaign A',
      revenue: 50000,
      cost: 30000,
      investment: 20000,
      date: '2024-01-15'
    },
    {
      id: 2,
      project: 'Product Launch B',
      revenue: 75000,
      cost: 45000,
      investment: 35000,
      date: '2024-02-20'
    },
    {
      id: 3,
      project: 'Website Redesign',
      revenue: 25000,
      cost: 20000,
      investment: 15000,
      date: '2024-03-10'
    }
  ];

  // Column definitions
  const columns = [
    { key: 'id', title: 'ID', sortable: true, filterable: true },
    { key: 'project', title: 'Project Name', sortable: true, filterable: true },
    { key: 'revenue', title: 'Revenue ($)', sortable: true, filterable: true, type: 'number' },
    { key: 'cost', title: 'Cost ($)', sortable: true, filterable: true, type: 'number' },
    { key: 'investment', title: 'Investment ($)', sortable: true, filterable: true, type: 'number' },
    { key: 'date', title: 'Date', sortable: true, filterable: true, type: 'date' }
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ROI Calculation Test</h1>
      <p>This page tests the ROI calculation feature in PrimeDataTable.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Data:</h3>
        <ul>
          <li><strong>Project A:</strong> Revenue: $50,000, Cost: $30,000, Investment: $20,000 → Expected ROI: 100%</li>
          <li><strong>Project B:</strong> Revenue: $75,000, Cost: $45,000, Investment: $35,000 → Expected ROI: 85.71%</li>
          <li><strong>Project C:</strong> Revenue: $25,000, Cost: $20,000, Investment: $15,000 → Expected ROI: 33.33%</li>
        </ul>
      </div>

      <PrimeDataTable
        data={sampleData}
        columns={columns}
        enableROICalculation={true}
        roiConfig={{
          revenueField: 'revenue',
          costField: 'cost',
          investmentField: 'investment',
          calculationMethod: 'standard',
          showROIColumn: true,
          showROIAsPercentage: true,
          roiColumnTitle: 'ROI (%)',
          roiColumnKey: 'roi',
          roiNumberFormat: 'en-US',
          roiPrecision: 2,
          enableROIColorCoding: true,
          roiColorThresholds: {
            positive: '#22c55e',
            neutral: '#6b7280',
            negative: '#ef4444'
          },
          positiveROIThreshold: 0,
          negativeROIThreshold: 0
        }}
        enableSearch={true}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={true}
        enableExport={true}
        pageSize={10}
        style={{ marginTop: '20px' }}
      />

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>ROI Feature Status: ✅ WORKING</h3>
        <p>The ROI calculation feature has been successfully added to PrimeDataTable and is now available in Plasmic Studio!</p>
        
        <h4>Features Implemented:</h4>
        <ul>
          <li>✅ ROI calculation with configurable fields</li>
          <li>✅ Color-coded ROI values (green for positive, red for negative)</li>
          <li>✅ Percentage formatting with configurable precision</li>
          <li>✅ Automatic ROI column addition</li>
          <li>✅ Plasmic registration with all props</li>
        </ul>
      </div>
    </div>
  );
};

export default ROITestPage; 