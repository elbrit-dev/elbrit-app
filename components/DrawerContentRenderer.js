import React from "react";
import { DataProvider } from "@plasmicapp/host";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Image } from "primereact/image";

/**
 * DrawerContentRenderer
 * 
 * Renders the same content that would appear in the PrimeTimeline drawer
 * This ensures the PDF preview shows exactly the same content
 */
const DrawerContentRenderer = ({
  item,
  events = [],
  // Dialog mode props
  dialogMode = "content",
  dialogHeaderField = null,
  dialogContentField = null,
  dateField = "date",
  titleField = "status",
  descriptionField = "description",
  imageField = null,
  imageAltField = null,
  imagePreview = true,
  // Two cards mode props
  leftCardTitle = "",
  rightCardTitle = "",
  leftFields = [],
  rightFields = [],
  columnGap = "1rem",
  dialogCardPadding = "1rem",
  leftListField = "",
  leftListItemLabelField = "salary_component__name",
  leftListItemValueField = "amount",
  rightListField = "",
  rightListItemLabelField = "salary_component__name",
  rightListItemValueField = "amount",
  showSummary = false,
  summaryTitle = "Summary",
  summaryFields = [],
  // Two tables mode props
  leftTableColumns = [],
  rightTableColumns = [],
  tableSize = "small",
  showTableBorders = true,
  tableStripedRows = true,
  showTableTotals = true,
  leftTotalField = "gross_pay",
  leftTotalLabel = "Gross Pay",
  rightTotalField = "total_deduction", 
  rightTotalLabel = "Total Deduction",
  leftTotalColor = "#e3f2fd",
  leftTotalTextColor = "#1976d2",
  rightTotalColor = "#ffebee",
  rightTotalTextColor = "#d32f2f",
  // Empty drawer slot content
  drawerContent = null,
  useEmptyDrawer = false,
  // PDF button props
  showPdfButton = true,
  pdfButtonLabel = "View as PDF",
  pdfButtonSeverity = "primary",
  pdfButtonSize = "small",
  pdfButtonStyle = { color: "#ffffff" },
  pdfButtonClassName = "",
  onPdfView
}) => {
  const getValue = (obj, path) => {
    if (!obj || !path) return undefined;
    if (path.indexOf(".") === -1) return obj?.[path];
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  };

  const isDesktop = true; // Always desktop for PDF preview
  const showBottomTotalsSeparately = showTableTotals;
  
  // Centering wrapper for desktop vertical drawers
  const wrapperStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    minHeight: "100vh",
    padding: "3rem 2rem",
    paddingTop: "4rem"
  };

  // If useEmptyDrawer is true, render the drawerContent slot with data context
  if (useEmptyDrawer) {
    return (
      <DataProvider name="currentItem" data={item}>
        <DataProvider name="allEvents" data={events}>
          <div 
            style={{ 
              width: "100%", 
              height: "100%", 
              minHeight: "200px",
              padding: "1rem"
            }}
          >
            {drawerContent || (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-color-secondary)",
                fontSize: "0.875rem",
                textAlign: "center"
              }}>
                Empty drawer - design via drawerContent slot. Use data: currentItem (clicked item) or allEvents (all timeline data)
              </div>
            )}
          </div>
        </DataProvider>
      </DataProvider>
    );
  }

  if (dialogMode === "twoCards") {
    return (
      <div style={wrapperStyle}>
        {/* Header with Date only */}
        {item?.[dateField] ? (
          <div style={{ 
            fontSize: "0.875rem", 
            color: "var(--text-color-secondary)",
            fontWeight: 500,
            marginBottom: "1rem"
          }}>
            {item[dateField]}
          </div>
        ) : null}
        <div style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
          gridTemplateRows: isDesktop ? "1fr" : "auto auto",
          gap: columnGap,
          minHeight: "300px",
          width: "100%",
          maxWidth: isDesktop ? "100%" : "100%"
        }}>
          <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: dialogCardPadding }}>
            {leftCardTitle ? <div style={{ fontWeight: 600, marginBottom: 8 }}>{leftCardTitle}</div> : null}
            {leftFields && leftFields.length > 0 ? (
              <div className="flex flex-column" style={{ gap: 6 }}>
                {leftFields.map((f, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 6, alignItems: "baseline", wordBreak: "break-word" }}>
                    <span style={{ fontWeight: 500 }}>{f?.label || f?.field}:</span>
                    <span>{String(getValue(item, f?.field))}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--text-color-secondary)" }}>No fields configured.</div>
            )}
            {leftListField && Array.isArray(getValue(item, leftListField)) ? (
              <div className="flex flex-column" style={{ gap: 6, marginTop: 8 }}>
                {getValue(item, leftListField).map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span>{String(getValue(row, leftListItemLabelField))}</span>
                    <span style={{ fontWeight: 500 }}>{String(getValue(row, leftListItemValueField))}</span>
                  </div>
                ))}
                {showTableTotals && !showBottomTotalsSeparately ? (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    gap: 12, 
                    marginTop: 8, 
                    paddingTop: 8, 
                    borderTop: "1px solid var(--surface-border)",
                    fontWeight: 600,
                    backgroundColor: "var(--primary-50)",
                    padding: "8px",
                    borderRadius: "4px"
                  }}>
                    <span style={{ color: undefined }}>{leftTotalLabel}</span>
                    <span style={{ color: leftTotalTextColor }}>{String(getValue(item, leftTotalField))}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: dialogCardPadding }}>
            {rightCardTitle ? <div style={{ fontWeight: 600, marginBottom: 8 }}>{rightCardTitle}</div> : null}
            {rightFields && rightFields.length > 0 ? (
              <div className="flex flex-column" style={{ gap: 6 }}>
                {rightFields.map((f, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 6, alignItems: "baseline", wordBreak: "break-word" }}>
                    <span style={{ fontWeight: 500 }}>{f?.label || f?.field}:</span>
                    <span>{String(getValue(item, f?.field))}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--text-color-secondary)" }}>No fields configured.</div>
            )}
            {rightListField && Array.isArray(getValue(item, rightListField)) ? (
              <div className="flex flex-column" style={{ gap: 6, marginTop: 8 }}>
                {getValue(item, rightListField).map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span>{String(getValue(row, rightListItemLabelField))}</span>
                    <span style={{ fontWeight: 500 }}>{String(getValue(row, rightListItemValueField))}</span>
                  </div>
                ))}
                {showTableTotals && !showBottomTotalsSeparately ? (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    gap: 12, 
                    marginTop: 8, 
                    paddingTop: 8, 
                    borderTop: "1px solid var(--surface-border)",
                    fontWeight: 600,
                    backgroundColor: "var(--primary-50)",
                    padding: "8px",
                    borderRadius: "4px"
                  }}>
                    <span style={{ color: undefined }}>{rightTotalLabel}</span>
                    <span style={{ color: rightTotalTextColor }}>{String(getValue(item, rightTotalField))}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        {showBottomTotalsSeparately ? (
          <div style={{ marginTop: 16, width: "100%", maxWidth: isDesktop ? "100%" : "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: columnGap }}>
              <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: dialogCardPadding, backgroundColor: leftTotalColor, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                <span>{leftTotalLabel}</span>
                <span style={{ color: leftTotalTextColor }}>{String(getValue(item, leftTotalField))}</span>
              </div>
              <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: dialogCardPadding, backgroundColor: rightTotalColor, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                <span>{rightTotalLabel}</span>
                <span style={{ color: rightTotalTextColor }}>{String(getValue(item, rightTotalField))}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  } else if (dialogMode === "twoTables") {
    return (
      <div style={wrapperStyle}>
        {/* Header with Date only */}
        {item?.[dateField] ? (
          <div style={{ 
            fontSize: "0.875rem", 
            color: "var(--text-color-secondary)",
            fontWeight: 500,
            marginBottom: "1rem"
          }}>
            {item[dateField]}
          </div>
        ) : null}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
          gridTemplateRows: isDesktop ? "1fr" : "auto auto", 
          gap: columnGap,
          minHeight: "400px",
          overflow: "hidden",
          width: "100%",
          maxWidth: isDesktop ? "100%" : "100%"
        }}>
        <div>
          {leftCardTitle ? <div style={{ fontWeight: 600, marginBottom: 8 }}>{leftCardTitle}</div> : null}
          {leftListField && Array.isArray(getValue(item, leftListField)) ? (
            <DataTable
              value={[
                ...getValue(item, leftListField),
                ...(showTableTotals && !showBottomTotalsSeparately ? [{
                  [leftListItemLabelField]: leftTotalLabel,
                  [leftListItemValueField]: getValue(item, leftTotalField),
                  _isTotal: true
                }] : [])
              ]}
              size={tableSize}
              showGridlines={showTableBorders}
              stripedRows={tableStripedRows}
              style={{ 
                fontSize: "0.875rem",
                width: "100%",
                minWidth: "300px"
              }}
              rowClassName={(rowData) => rowData._isTotal ? "font-bold" : ""}
              rowStyle={(rowData) => rowData._isTotal ? {
                backgroundColor: leftTotalColor,
                fontWeight: 'bold'
              } : {}}
            >
              {leftTableColumns && leftTableColumns.length > 0 ? (
                leftTableColumns.map((col, idx) => (
                  <Column
                    key={idx}
                    field={col.field}
                    header={col.header}
                    style={{ ...(col.style || {}), textAlign: col.align || "left" }}
                    body={col.formatter ? (rowData) => col.formatter(getValue(rowData, col.field), rowData) : undefined}
                  />
                ))
              ) : (
                <>
                  <Column field={leftListItemLabelField} header="Component" />
                  <Column
                    field={leftListItemValueField}
                    header="Amount"
                    style={{ textAlign: "right" }}
                    body={(rowData) => {
                      const isTotal = rowData._isTotal;
                      const value = getValue(rowData, leftListItemValueField);
                      return (
                        <span style={{ color: isTotal ? leftTotalTextColor : undefined }}>
                          {String(value)}
                        </span>
                      );
                    }}
                  />
                </>
              )}
            </DataTable>
          ) : (
            <div style={{ color: "var(--text-color-secondary)" }}>No data available</div>
          )}
        </div>
        <div>
          {rightCardTitle ? <div style={{ fontWeight: 600, marginBottom: 8 }}>{rightCardTitle}</div> : null}
          {rightListField && Array.isArray(getValue(item, rightListField)) ? (
            <DataTable
              value={[
                ...getValue(item, rightListField),
                ...(showTableTotals && !showBottomTotalsSeparately ? [{
                  [rightListItemLabelField]: rightTotalLabel,
                  [rightListItemValueField]: getValue(item, rightTotalField),
                  _isTotal: true
                }] : [])
              ]}
              size={tableSize}
              showGridlines={showTableBorders}
              stripedRows={tableStripedRows}
              style={{ 
                fontSize: "0.875rem",
                width: "100%",
                minWidth: "300px"
              }}
              rowClassName={(rowData) => rowData._isTotal ? "font-bold" : ""}
              rowStyle={(rowData) => rowData._isTotal ? {
                backgroundColor: rightTotalColor,
                fontWeight: 'bold'
              } : {}}
            >
              {rightTableColumns && rightTableColumns.length > 0 ? (
                rightTableColumns.map((col, idx) => (
                  <Column
                    key={idx}
                    field={col.field}
                    header={col.header}
                    style={{ ...(col.style || {}), textAlign: col.align || "left" }}
                    body={col.formatter ? (rowData) => col.formatter(getValue(rowData, col.field), rowData) : undefined}
                  />
                ))
              ) : (
                <>
                  <Column field={rightListItemLabelField} header="Component" />
                  <Column
                    field={rightListItemValueField}
                    header="Amount"
                    style={{ textAlign: "right" }}
                    body={(rowData) => {
                      const isTotal = rowData._isTotal;
                      const value = getValue(rowData, rightListItemValueField);
                      return (
                        <span style={{ color: isTotal ? rightTotalTextColor : undefined }}>
                          {String(value)}
                        </span>
                      );
                    }}
                  />
                </>
              )}
            </DataTable>
          ) : (
            <div style={{ color: "var(--text-color-secondary)" }}>No data available</div>
          )}
        </div>
        </div>
        {showBottomTotalsSeparately ? (
          <div style={{ marginTop: 16, width: "100%", maxWidth: isDesktop ? "100%" : "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: columnGap }}>
              <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: dialogCardPadding, backgroundColor: leftTotalColor, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                <span>{leftTotalLabel}</span>
                <span style={{ color: leftTotalTextColor }}>{String(getValue(item, leftTotalField))}</span>
              </div>
              <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: dialogCardPadding, backgroundColor: rightTotalColor, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                <span>{rightTotalLabel}</span>
                <span style={{ color: rightTotalTextColor }}>{String(getValue(item, rightTotalField))}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  } else {
    return (
      <div style={wrapperStyle}>
        <div className="flex flex-column gap-3" style={{ 
          width: "100%", 
          maxWidth: isDesktop ? "600px" : "100%" 
        }}>
          {imageField && item?.[imageField] ? (
            <Image src={item[imageField]} alt={item?.[imageAltField || ""] || ""} preview={imagePreview} />
          ) : null}
          <div>
            {dialogContentField
              ? item?.[dialogContentField]
              : item?.[descriptionField]}
          </div>
        </div>
      </div>
    );
  }
};

export default DrawerContentRenderer;
