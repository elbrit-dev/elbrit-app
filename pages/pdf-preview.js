import React, { useState, useEffect } from "react";
import { Sidebar } from "primereact/sidebar";
import { DataProvider } from "@plasmicapp/host";
import DrawerContentRenderer from "../components/DrawerContentRenderer";

const PdfPreview = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
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

    // Auto-open drawer after a short delay
    setTimeout(() => {
      setDrawerVisible(true);
    }, 500);
  }, []);

  const renderDrawerContent = () => {
    if (!selectedItem) return null;

    // If useEmptyDrawer is true, show a simplified version since we can't render Plasmic slots
    if (drawerProps.useEmptyDrawer) {
      return (
        <DataProvider name="currentItem" data={selectedItem}>
          <DataProvider name="allEvents" data={timelineData || []}>
            <DataProvider name="slip" data={selectedItem}>
              <div style={{ 
                width: "100%", 
                height: "100%", 
                minHeight: "200px",
                padding: "1rem"
              }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}>
                  <h3 style={{ margin: 0, color: "var(--text-color)" }}>
                    {selectedItem?.status || selectedItem?.title || 'Timeline Item'}
                  </h3>
                  
                  {selectedItem?.date && (
                    <p style={{ margin: 0, color: "var(--text-color-secondary)" }}>
                      Date: {selectedItem.date}
                    </p>
                  )}
                  
                  {selectedItem?.description && (
                    <p style={{ margin: 0, color: "var(--text-color)" }}>
                      {selectedItem.description}
                    </p>
                  )}
                  
                  {selectedItem?.start_date && (
                    <p style={{ margin: 0, color: "var(--text-color-secondary)" }}>
                      Period: {selectedItem.start_date} to {selectedItem.end_date}
                    </p>
                  )}
                  
                  {/* Show all available data in a simple format */}
                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--text-color)" }}>Item Details:</h4>
                    <div style={{ 
                      backgroundColor: "var(--surface-100)", 
                      padding: "1rem", 
                      borderRadius: "8px",
                      fontSize: "0.875rem"
                    }}>
                      {Object.entries(selectedItem).map(([key, value]) => (
                        <div key={key} style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          marginBottom: "0.25rem",
                          padding: "0.25rem 0",
                          borderBottom: "1px solid var(--surface-border)"
                        }}>
                          <span style={{ fontWeight: 500, color: "var(--text-color-secondary)" }}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </span>
                          <span style={{ color: "var(--text-color)" }}>
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ 
                    marginTop: "2rem", 
                    padding: "1rem", 
                    backgroundColor: "var(--primary-50)", 
                    borderRadius: "8px",
                    textAlign: "center"
                  }}>
                    <p style={{ margin: 0, color: "var(--primary-700)" }}>
                      PDF Preview - Empty Slot Content
                    </p>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "var(--primary-600)" }}>
                      This shows the data that would be available in your custom Plasmic slot design
                    </p>
                    <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", color: "var(--primary-500)" }}>
                      Data available: currentItem, allEvents, slip (state data)
                    </p>
                  </div>
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
      backgroundColor: "#f5f5f5",
      position: "relative"
    }}>
      {/* Main content area */}
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        marginRight: "0"
      }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>PDF Preview Mode</h2>
          <p>This shows how the drawer content will appear in PDF format</p>
          <p>Selected Item: <strong>{selectedItem?.status || 'None'}</strong></p>
        </div>
      </div>

      {/* Right drawer - this will contain the actual content */}
      <Sidebar
        visible={drawerVisible}
        position="right"
        onHide={() => setDrawerVisible(false)}
        style={{ 
          width: "50rem",
          height: "100vh"
        }}
        header={`PDF Preview - ${selectedItem?.status || 'Timeline Item'}`}
        showCloseIcon={false}
      >
        {renderDrawerContent()}
      </Sidebar>
    </div>
  );
};

export default PdfPreview;
