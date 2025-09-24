import React, { useState, useEffect } from "react";
import { DataProvider } from "@plasmicapp/host";
import DrawerContentRenderer from "../components/DrawerContentRenderer";

const PdfPreview = () => {
  const [timelineData, setTimelineData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerProps, setDrawerProps] = useState({});

  useEffect(() => {
    // Get data from URL parameters (timestamp)
    const urlParams = new URLSearchParams(window.location.search);
    const timestamp = urlParams.get('t');
    
    if (timestamp) {
      try {
        // Get data from localStorage using timestamp
        const storedData = localStorage.getItem(`pdfPreview_${timestamp}`);
        if (storedData) {
          const pdfData = JSON.parse(storedData);
          setTimelineData(pdfData.timelineData);
          setSelectedItem(pdfData.selectedItem);
          setDrawerProps(pdfData.drawerProps);
          
          // Clean up localStorage after use
          localStorage.removeItem(`pdfPreview_${timestamp}`);
        } else {
          console.error('No PDF data found for timestamp:', timestamp);
        }
      } catch (e) {
        console.error('Error parsing PDF data:', e);
      }
    } else {
      // Fallback: try to get data from URL parameters (for backward compatibility)
      const data = urlParams.get('data');
      const item = urlParams.get('item');
      const props = urlParams.get('props');
      
      if (data) {
        try {
          setTimelineData(JSON.parse(decodeURIComponent(data)));
        } catch (e) {
          console.error('Error parsing timeline data:', e);
        }
      }
      
      if (item) {
        try {
          setSelectedItem(JSON.parse(decodeURIComponent(item)));
        } catch (e) {
          console.error('Error parsing selected item:', e);
        }
      }

      if (props) {
        try {
          setDrawerProps(JSON.parse(decodeURIComponent(props)));
        } catch (e) {
          console.error('Error parsing drawer props:', e);
        }
      }
    }

    // No need to auto-open drawer since we're showing content directly
  }, []);

  const renderDrawerContent = () => {
    if (!selectedItem) return null;

    // If useEmptyDrawer is true, show a simplified but styled version
    if (drawerProps.useEmptyDrawer) {
      return (
        <DataProvider name="currentItem" data={selectedItem}>
          <DataProvider name="allEvents" data={timelineData || []}>
            <DataProvider name="slip" data={selectedItem}>
              <div style={{ 
                width: "100%", 
                height: "100%", 
                minHeight: "200px",
                padding: "2rem",
                fontFamily: "Arial, sans-serif"
              }}>
                {/* Payslip-style header */}
                <div style={{
                  textAlign: "center",
                  marginBottom: "2rem",
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: "1rem"
                }}>
                  <h1 style={{ 
                    margin: "0 0 0.5rem 0", 
                    color: "#1f2937",
                    fontSize: "1.5rem",
                    fontWeight: "bold"
                  }}>
                    {selectedItem?.title || selectedItem?.status || 'Salary Slip'}
                  </h1>
                  <p style={{ 
                    margin: "0", 
                    color: "#6b7280",
                    fontSize: "1rem"
                  }}>
                    {selectedItem?.date || 'Pay Period'}
                  </p>
                </div>

                {/* Employee details section */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                  marginBottom: "2rem"
                }}>
                  <div>
                    <h3 style={{ margin: "0 0 1rem 0", color: "#374151", fontSize: "1.1rem" }}>Employee Details</h3>
                    <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                      {selectedItem?.employee_id && <p style={{ margin: "0 0 0.5rem 0" }}><strong>Employee ID:</strong> {selectedItem.employee_id}</p>}
                      {selectedItem?.employee_name && <p style={{ margin: "0 0 0.5rem 0" }}><strong>Name:</strong> {selectedItem.employee_name}</p>}
                      {selectedItem?.department && <p style={{ margin: "0 0 0.5rem 0" }}><strong>Department:</strong> {selectedItem.department}</p>}
                      {selectedItem?.designation && <p style={{ margin: "0 0 0.5rem 0" }}><strong>Designation:</strong> {selectedItem.designation}</p>}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 1rem 0", color: "#374151", fontSize: "1.1rem" }}>Pay Period</h3>
                    <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                      {selectedItem?.start_date && <p style={{ margin: "0 0 0.5rem 0" }}><strong>From:</strong> {selectedItem.start_date}</p>}
                      {selectedItem?.end_date && <p style={{ margin: "0 0 0.5rem 0" }}><strong>To:</strong> {selectedItem.end_date}</p>}
                      {selectedItem?.working_days && <p style={{ margin: "0 0 0.5rem 0" }}><strong>Working Days:</strong> {selectedItem.working_days}</p>}
                    </div>
                  </div>
                </div>

                {/* Earnings and Deductions */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                  marginBottom: "2rem"
                }}>
                  <div>
                    <h3 style={{ margin: "0 0 1rem 0", color: "#374151", fontSize: "1.1rem" }}>Earnings</h3>
                    <div style={{ 
                      backgroundColor: "#f9fafb", 
                      padding: "1rem", 
                      borderRadius: "6px",
                      fontSize: "0.9rem"
                    }}>
                      {selectedItem?.basic && <p style={{ margin: "0 0 0.5rem 0", display: "flex", justifyContent: "space-between" }}>Basic: <span>₹{selectedItem.basic}</span></p>}
                      {selectedItem?.hra && <p style={{ margin: "0 0 0.5rem 0", display: "flex", justifyContent: "space-between" }}>HRA: <span>₹{selectedItem.hra}</span></p>}
                      {selectedItem?.gross_pay && <p style={{ margin: "1rem 0 0 0", paddingTop: "0.5rem", borderTop: "1px solid #d1d5db", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>Gross Pay: <span>₹{selectedItem.gross_pay}</span></p>}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 1rem 0", color: "#374151", fontSize: "1.1rem" }}>Deductions</h3>
                    <div style={{ 
                      backgroundColor: "#f9fafb", 
                      padding: "1rem", 
                      borderRadius: "6px",
                      fontSize: "0.9rem"
                    }}>
                      {selectedItem?.epf && <p style={{ margin: "0 0 0.5rem 0", display: "flex", justifyContent: "space-between" }}>EPF: <span>₹{selectedItem.epf}</span></p>}
                      {selectedItem?.professional_tax && <p style={{ margin: "0 0 0.5rem 0", display: "flex", justifyContent: "space-between" }}>Professional Tax: <span>₹{selectedItem.professional_tax}</span></p>}
                      {selectedItem?.total_deduction && <p style={{ margin: "1rem 0 0 0", paddingTop: "0.5rem", borderTop: "1px solid #d1d5db", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>Total Deduction: <span>₹{selectedItem.total_deduction}</span></p>}
                    </div>
                  </div>
                </div>

                {/* Net Pay Summary */}
                <div style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>Net Pay</h2>
                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: "bold" }}>
                    ₹{selectedItem?.net_pay || '0'}
                  </p>
                  {selectedItem?.total_in_words && (
                    <p style={{ margin: "0", fontSize: "0.9rem", opacity: "0.9" }}>
                      {selectedItem.total_in_words}
                    </p>
                  )}
                </div>

                {/* Footer note */}
                <div style={{
                  marginTop: "2rem",
                  padding: "1rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: "#6b7280"
                }}>
                  <p style={{ margin: "0" }}>This is a PDF preview of your salary slip design</p>
                  <p style={{ margin: "0.5rem 0 0 0" }}>Data available: currentItem, allEvents, slip (state data)</p>
                </div>
              </div>
            </DataProvider>
          </DataProvider>
        </DataProvider>
      );
    }

    // For non-empty drawer modes, use the DrawerContentRenderer
    return (
      <DrawerContentRenderer
        item={selectedItem}
        events={timelineData || []}
        {...drawerProps}
      />
    );
  };

  return (
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      backgroundColor: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      {/* Show only the drawer content without the drawer container */}
      <div style={{
        width: "100%",
        maxWidth: "50rem",
        minHeight: "80vh",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        borderRadius: "8px",
        overflow: "hidden"
      }}>
        {renderDrawerContent()}
      </div>
    </div>
  );
};

export default PdfPreview;
