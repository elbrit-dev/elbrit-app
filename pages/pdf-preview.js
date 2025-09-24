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

    // If useEmptyDrawer is true, try to render the actual drawer content
    if (drawerProps.useEmptyDrawer) {
      // Check if we have captured drawer content to render
      if (drawerProps.capturedDrawerContent) {
        // Try to render the captured drawer content
        try {
          return (
            <div style={{ 
              width: "100%", 
              height: "100%", 
              minHeight: "200px"
            }}>
              {drawerProps.capturedDrawerContent}
            </div>
          );
        } catch (error) {
          console.error('Error rendering captured drawer content:', error);
          // Fall back to simplified view
        }
      }
      
      // Check if we have drawer content to render
      if (drawerProps.drawerContent) {
        // Try to render the actual drawer content
        try {
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
                    {drawerProps.drawerContent}
                  </div>
                </DataProvider>
              </DataProvider>
            </DataProvider>
          );
        } catch (error) {
          console.error('Error rendering drawer content:', error);
          // Fall back to simplified view
        }
      }
      
      // Fallback: show a message that the drawer content needs to be captured
      return (
        <DataProvider name="currentItem" data={selectedItem}>
          <DataProvider name="allEvents" data={timelineData || []}>
            <DataProvider name="slip" data={selectedItem}>
              <div style={{ 
                width: "100%", 
                height: "100%", 
                minHeight: "200px",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center"
              }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "var(--text-color)" }}>
                  PDF Preview - Drawer Content
                </h3>
                <p style={{ margin: "0 0 1rem 0", color: "var(--text-color-secondary)" }}>
                  To show the exact drawer design, we need to capture the rendered drawer content.
                </p>
                <div style={{ 
                  backgroundColor: "var(--surface-100)", 
                  padding: "1rem", 
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  maxWidth: "400px"
                }}>
                  <p style={{ margin: "0 0 0.5rem 0", fontWeight: 600 }}>Available Data:</p>
                  <p style={{ margin: "0 0 0.25rem 0" }}>• currentItem: {selectedItem?.title || selectedItem?.status || 'Timeline Item'}</p>
                  <p style={{ margin: "0 0 0.25rem 0" }}>• allEvents: {timelineData?.length || 0} items</p>
                  <p style={{ margin: "0" }}>• slip: Same as currentItem</p>
                </div>
                <p style={{ margin: "1rem 0 0 0", fontSize: "0.75rem", color: "var(--primary-600)" }}>
                  This data is available for your custom Plasmic slot design
                </p>
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
