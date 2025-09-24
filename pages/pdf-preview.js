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
    // Get data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
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

    // Auto-open drawer after a short delay
    setTimeout(() => {
      setDrawerVisible(true);
    }, 500);
  }, []);

  const renderDrawerContent = () => {
    if (!selectedItem) return null;

    // Render the exact same content as the main drawer using DrawerContentRenderer
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
