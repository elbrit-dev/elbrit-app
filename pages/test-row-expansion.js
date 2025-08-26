import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues during build
const PrimeDataTable = dynamic(() => import('../components/PrimeDataTable'), { 
  ssr: false,
  loading: () => <div>Loading table...</div>
});

const TestRowExpansion = () => {
  // Sample data that matches your structure
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Row Expansion Test</h1>
      
      <p className="mb-4 text-gray-600">
        This page tests the automatic row expansion functionality.
      </p>

      <PrimeDataTable
        data={sampleData}
        enableRowExpansion={true}
        showExpandAllButtons={true}
        expandAllLabel="Expand All Customers"
        collapseAllLabel="Collapse All Customers"
        expansionColumnStyle={{ width: '4rem' }}
        expansionColumnPosition="left"
        nestedDataConfig={{
          enableNestedSorting: true,
          enableNestedFiltering: true,
          enableNestedPagination: false,
          nestedPageSize: 10
        }}
        className="shadow-lg"
        enableSearch={true}
        enableColumnFilter={true}
        enableSorting={true}
        enablePagination={true}
        pageSize={10}
      />
    </div>
  );
};

export default TestRowExpansion;
