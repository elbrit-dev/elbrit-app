import React, { useState } from "react";
import { Timeline } from "primereact/timeline";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Sidebar } from "primereact/sidebar";
import { Image } from "primereact/image";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

/**
 * PrimeTimeline
 * 
 * A Plasmic-ready wrapper around PrimeReact Timeline with a customizable template
 * that renders styled markers, headers, dates, descriptions, and an optional
 * "Read more" action. Pass an array of event objects via the `events` prop and
 * configure which fields to use via the mapping props.
 */
const PrimeTimeline = ({
  // Data
  events = [
    { status: "Ordered", date: "15/10/2020 10:30", description: "Order placed.", icon: "pi pi-shopping-cart", color: "#9C27B0", link: null },
    { status: "Processing", date: "15/10/2020 14:00", description: "Order is being prepared.", icon: "pi pi-cog", color: "#673AB7", link: null },
    { status: "Shipped", date: "15/10/2020 16:15", description: "Package handed to courier.", icon: "pi pi-envelope", color: "#FF9800", link: null },
    { status: "Delivered", date: "16/10/2020 10:00", description: "Package delivered to customer.", icon: "pi pi-check", color: "#607D8B", link: null }
  ],

  // Field mappings (item[field])
  titleField = "status",
  dateField = "date",
  descriptionField = "description",
  iconField = "icon",
  markerColorField = "color",
  linkField = "link",
  oppositeField = "date",
  imageField = null,
  imageAltField = null,

  // Timeline layout
  align = "alternate", // left | right | alternate
  layout = "vertical", // vertical | horizontal

  // UI
  showOpposite = true, // show date on the opposite side (vertical only)
  showReadMore = true,
  readMoreLabel = "Read more",
  showPdfButton = true,
  pdfButtonLabel = "View as PDF",
  pdfData = null,
  pdfDataField = null,

  // Styling
  className = "",
  style = {},
  containerWidth = "auto",
  containerHeight = "auto",
  markerSize = 32,
  markerTextColor = "#ffffff",
  readMoreTarget = "_self",
  styleMode = "verticalAlternate", // verticalBasic | verticalRight | verticalOpposite | verticalAlternate | horizontalTop | horizontalBottom | horizontalAlternate
  markerVariant = "icon", // icon | dot | none
  timelineClassName = "",
  imageWidth = "100%",
  imagePreview = true,
  enableDialog = false,
  dialogHeaderField = null,
  dialogContentField = null,
  dialogWidth = "30rem",
  dialogMode = "content", // content | twoCards | twoTables
  displayMode = "dialog", // dialog | drawer
  drawerPosition = "auto", // auto | right | left | top | bottom
  drawerSize = "50rem", // Wider default for better table display
  leftCardTitle = "",
  rightCardTitle = "",
  leftFields = [], // [{label:"Gross pay", field:"gross_pay"}]
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
  summaryFields = [], // [{label:"Gross pay", field:"gross_pay"}]
  cardWidth = "auto",
  cardHeight = "auto",
  cardPadding = "12px",
  cardBorderRadius = "8px",
  leftTableColumns = [], // [{field: 'salary_component__name', header: 'Component'}, {field: 'amount', header: 'Amount'}]
  rightTableColumns = [],
  tableSize = "small", // small | normal | large
  showTableBorders = true,
  tableStripedRows = true,
  showTableTotals = true,
  leftTotalField = "gross_pay",
  leftTotalLabel = "Gross Pay",
  rightTotalField = "total_deduction", 
  rightTotalLabel = "Total Deduction",
  
  // Total row colors
  leftTotalColor = "#e3f2fd", // Light blue background for gross pay
  leftTotalTextColor = "#1976d2", // Dark blue text for gross pay
  rightTotalColor = "#ffebee", // Light red background for total deduction
  rightTotalTextColor = "#d32f2f", // Dark red text for total deduction

  // Events
  onReadMore,
  onPdfView,
  onItemClick,
  onImageClick,
  onDialogOpen
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogItem, setDialogItem] = useState(null);
  
  // Responsive drawer position
  const getDrawerPosition = () => {
    if (drawerPosition !== "auto") return drawerPosition;
    
    // Auto mode: right for desktop, bottom for mobile
    if (typeof window !== "undefined") {
      return window.innerWidth >= 968 ? "right" : "bottom";
    }
    return "right"; // fallback
  };

  const getValue = (obj, path) => {
    if (!obj || !path) return undefined;
    if (path.indexOf(".") === -1) return obj?.[path];
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  };

  // PDF generation is intentionally removed. The PDF button will emit data via onPdfView.
  const renderMarker = (item) => {
    const backgroundColor = item?.[markerColorField] || "#3b82f6";
    const icon = item?.[iconField];

    if (markerVariant === "none") {
      return null;
    }

    return (
      <span
        className="p-shadow-2"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: markerSize,
          height: markerSize,
          borderRadius: "50%",
          backgroundColor,
          color: markerTextColor
        }}
      >
        {markerVariant === "icon" && icon ? <i className={icon} /> : null}
      </span>
    );
  };

  const renderContent = (item) => {
    const title = item?.[titleField];
    const date = item?.[dateField];
    const description = item?.[descriptionField];
    const href = item?.[linkField];
    const img = imageField ? item?.[imageField] : null;
    const imgAlt = imageAltField ? (item?.[imageAltField] ?? "") : "";

    return (
      <div
        className="p-3"
        style={{ 
          borderRadius: cardBorderRadius, 
          border: "1px solid var(--surface-border)", 
          background: "var(--surface-card)",
          width: cardWidth,
          height: cardHeight,
          padding: cardPadding,
          minWidth: "250px", // Ensure consistent minimum width for better alignment
          boxSizing: "border-box"
        }}
        onClick={() => onItemClick && onItemClick({ item })}
      >
        {title ? <h6 style={{ margin: 0, fontSize: 14 }}>{title}</h6> : null}
        {date ? <small className="text-color-secondary" style={{ display: "block", marginTop: 4 }}>{date}</small> : null}
        {description ? <p style={{ margin: "8px 0 12px 0" }}>{description}</p> : null}
        {showSummary && summaryFields && summaryFields.length > 0 ? (
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            {summaryTitle ? <div style={{ fontWeight: 600, marginBottom: 6 }}>{summaryTitle}</div> : null}
            <div className="flex flex-column" style={{ gap: 6 }}>
              {summaryFields.map((f, idx) => {
                const fieldName = f?.field;
                const isGrossPay = fieldName === leftTotalField;
                const isTotalDeduction = fieldName === rightTotalField;
                
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      display: "flex", 
                      gap: 6, 
                      alignItems: "baseline", 
                      wordBreak: "break-word",
                      ...(isGrossPay && { 
                        backgroundColor: leftTotalColor, 
                        padding: "4px 8px", 
                        borderRadius: "4px",
                        fontWeight: "bold"
                      }),
                      ...(isTotalDeduction && { 
                        backgroundColor: rightTotalColor, 
                        padding: "4px 8px", 
                        borderRadius: "4px",
                        fontWeight: "bold"
                      })
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{f?.label || f?.field}:</span>
                    <span style={{ color: isGrossPay ? leftTotalTextColor : (isTotalDeduction ? rightTotalTextColor : undefined) }}>
                      {String(getValue(item, f?.field))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
        {img ? (
          <div style={{ marginBottom: 12 }}>
            <Image
              src={img}
              alt={imgAlt}
              width={typeof imageWidth === "number" ? undefined : undefined}
              style={{ width: imageWidth }}
              preview={imagePreview}
              onClick={(e) => {
                e.stopPropagation();
                if (onImageClick) onImageClick({ item, src: img });
              }}
            />
          </div>
        ) : null}
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          {showReadMore ? (
            <Button
              label={readMoreLabel}
              text
              size="small"
              onClick={() => {
                if (onReadMore) {
                  onReadMore({ item, href });
                } else if (href) {
                  if (readMoreTarget === "_blank") {
                    window.open(href, "_blank");
                  } else {
                    window.location.href = href;
                  }
                } else if (enableDialog) {
                  setDialogItem(item);
                  setDialogVisible(true);
                  if (onDialogOpen) onDialogOpen({ item });
                }
              }}
            />
          ) : null}
          {showPdfButton ? (
            <Button
              label={pdfButtonLabel}
              severity="primary"
              size="small"
              icon="pi pi-file-pdf"
              onClick={() => {
                const resolvedData =
                  typeof pdfData === "function"
                    ? pdfData(item)
                    : (pdfDataField ? getValue(item, pdfDataField) : pdfData);
                if (onPdfView) onPdfView({ item, data: resolvedData });
              }}
            />
          ) : null}
        </div>
      </div>
    );
  };

  const renderOpposite = (item) => {
    if (!showOpposite || layout === "horizontal") return null;
    
    // Determine current alignment (same logic as below)
    let computedAlign = align;
    switch (styleMode) {
      case "verticalBasic":
        computedAlign = "left";
        break;
      case "verticalRight":
        computedAlign = "right";
        break;
      case "verticalOpposite":
      case "verticalAlternate":
        computedAlign = "alternate";
        break;
      default:
        break;
    }
    const currentAlign = align || computedAlign;
    
    // For alternate alignment, always provide content to maintain proper alignment
    if (currentAlign === "alternate") {
      const content = item?.[oppositeField];
      return (
        <div style={{ 
          textAlign: "start", 
          padding: "8px", 
          minHeight: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "start"
        }}>
          {content ? (
            <small className="text-color-secondary">{content}</small>
          ) : (
            <small className="text-color-secondary" style={{ opacity: 0.5 }}>•</small>
          )}
        </div>
      );
    }
    
    // For non-alternate layouts, use original behavior
    const content = item?.[oppositeField];
    return content ? <small className="text-color-secondary">{content}</small> : null;
  };

  const renderDialogContent = () => {
    if (!dialogItem) return null;

    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const drawerPos = getDrawerPosition();
    const isVerticalDrawer = drawerPos === "right" || drawerPos === "left";
    const showBottomTotalsSeparately = displayMode === "drawer" && showTableTotals;
    
    // Centering wrapper for desktop vertical drawers
    const wrapperStyle = isDesktop && isVerticalDrawer ? {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start", // Start from top instead of center
      alignItems: "center",
      minHeight: "100vh",
      padding: "3rem 2rem", // More top padding
      paddingTop: "4rem" // Extra top space
    } : {
      padding: "1rem"
    };

    if (dialogMode === "twoCards") {
      return (
        <div style={wrapperStyle}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", // Side-by-side on desktop, stacked on mobile
          gridTemplateRows: isDesktop ? "1fr" : "auto auto", // Single row on desktop, two rows on mobile
          gap: columnGap,
          minHeight: "300px",
          width: "100%",
          maxWidth: isDesktop ? "100%" : "100%" // Use full drawer width
        }}>
          <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: dialogCardPadding }}>
            {leftCardTitle ? <div style={{ fontWeight: 600, marginBottom: 8 }}>{leftCardTitle}</div> : null}
            {leftFields && leftFields.length > 0 ? (
              <div className="flex flex-column" style={{ gap: 6 }}>
                {leftFields.map((f, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 6, alignItems: "baseline", wordBreak: "break-word" }}>
                    <span style={{ fontWeight: 500 }}>{f?.label || f?.field}:</span>
                    <span>{String(getValue(dialogItem, f?.field))}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--text-color-secondary)" }}>No fields configured.</div>
            )}
            {leftListField && Array.isArray(getValue(dialogItem, leftListField)) ? (
              <div className="flex flex-column" style={{ gap: 6, marginTop: 8 }}>
                {getValue(dialogItem, leftListField).map((row, i) => (
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
                    <span style={{ color: leftTotalTextColor }}>{String(getValue(dialogItem, leftTotalField))}</span>
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
                    <span>{String(getValue(dialogItem, f?.field))}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--text-color-secondary)" }}>No fields configured.</div>
            )}
            {rightListField && Array.isArray(getValue(dialogItem, rightListField)) ? (
              <div className="flex flex-column" style={{ gap: 6, marginTop: 8 }}>
                {getValue(dialogItem, rightListField).map((row, i) => (
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
                    <span style={{ color: rightTotalTextColor }}>{String(getValue(dialogItem, rightTotalField))}</span>
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
                  <span style={{ color: leftTotalTextColor }}>{String(getValue(dialogItem, leftTotalField))}</span>
                </div>
                <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: dialogCardPadding, backgroundColor: rightTotalColor, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                  <span>{rightTotalLabel}</span>
                  <span style={{ color: rightTotalTextColor }}>{String(getValue(dialogItem, rightTotalField))}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      );
    } else if (dialogMode === "twoTables") {
      return (
        <div style={wrapperStyle}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", // Side-by-side on desktop, stacked on mobile
            gridTemplateRows: isDesktop ? "1fr" : "auto auto", // Single row on desktop, two rows on mobile
            gap: columnGap,
            minHeight: "400px",
            overflow: "hidden",
            width: "100%",
            maxWidth: isDesktop ? "100%" : "100%" // Use full drawer width for tables
          }}>
          <div>
            {leftCardTitle ? <div style={{ fontWeight: 600, marginBottom: 8 }}>{leftCardTitle}</div> : null}
            {leftListField && Array.isArray(getValue(dialogItem, leftListField)) ? (
              <DataTable
                value={[
                  ...getValue(dialogItem, leftListField),
                  ...(showTableTotals && !showBottomTotalsSeparately ? [{
                    [leftListItemLabelField]: leftTotalLabel,
                    [leftListItemValueField]: getValue(dialogItem, leftTotalField),
                    _isTotal: true
                  }] : [])
                ]}
                size={tableSize}
                showGridlines={showTableBorders}
                stripedRows={tableStripedRows}
                style={{ 
                  fontSize: "0.875rem",
                  width: "100%",
                  minWidth: "300px" // Wider minimum for better readability
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
            {rightListField && Array.isArray(getValue(dialogItem, rightListField)) ? (
              <DataTable
                value={[
                  ...getValue(dialogItem, rightListField),
                  ...(showTableTotals && !showBottomTotalsSeparately ? [{
                    [rightListItemLabelField]: rightTotalLabel,
                    [rightListItemValueField]: getValue(dialogItem, rightTotalField),
                    _isTotal: true
                  }] : [])
                ]}
                size={tableSize}
                showGridlines={showTableBorders}
                stripedRows={tableStripedRows}
                style={{ 
                  fontSize: "0.875rem",
                  width: "100%",
                  minWidth: "300px" // Wider minimum for better readability
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
                  <span style={{ color: leftTotalTextColor }}>{String(getValue(dialogItem, leftTotalField))}</span>
                </div>
                <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: dialogCardPadding, backgroundColor: rightTotalColor, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
                  <span>{rightTotalLabel}</span>
                  <span style={{ color: rightTotalTextColor }}>{String(getValue(dialogItem, rightTotalField))}</span>
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
            {imageField && dialogItem?.[imageField] ? (
              <Image src={dialogItem[imageField]} alt={dialogItem?.[imageAltField || ""] || ""} preview={imagePreview} />
            ) : null}
            <div>
              {dialogContentField
                ? dialogItem?.[dialogContentField]
                : dialogItem?.[descriptionField]}
            </div>
          </div>
        </div>
      );
    }
  };

  // Resolve styleMode to effective layout/align/opposite defaults (explicit props still override)
  let computedLayout = layout;
  let computedAlign = align;
  let computedShowOpposite = showOpposite;
  switch (styleMode) {
    case "verticalBasic":
      computedLayout = "vertical";
      computedAlign = "left";
      computedShowOpposite = false;
      break;
    case "verticalRight":
      computedLayout = "vertical";
      computedAlign = "right";
      computedShowOpposite = false;
      break;
    case "verticalOpposite":
      computedLayout = "vertical";
      computedAlign = "left";
      computedShowOpposite = true;
      break;
    case "verticalAlternate":
      computedLayout = "vertical";
      computedAlign = "alternate";
      computedShowOpposite = true;
      break;
    case "horizontalTop":
      computedLayout = "horizontal";
      computedAlign = "top";
      computedShowOpposite = false;
      break;
    case "horizontalBottom":
      computedLayout = "horizontal";
      computedAlign = "bottom";
      computedShowOpposite = false;
      break;
    case "horizontalAlternate":
      computedLayout = "horizontal";
      computedAlign = "alternate";
      computedShowOpposite = false; // handled by empty opposite placeholder per docs
      break;
    default:
      break;
  }

  // Explicit props take precedence
  const finalLayout = layout || computedLayout;
  const finalAlign = align || computedAlign;
  const finalShowOpposite = typeof showOpposite === "boolean" ? showOpposite : computedShowOpposite;

  // For horizontal alternate layout, provide an empty opposite to balance layout
  const oppositeProp = finalLayout === "horizontal" && finalAlign === "alternate" ? <span>&nbsp;</span> : renderOpposite;

  return (
    <>
      <style>{`
        .prime-timeline-centered {
          margin: 0 auto !important;
          padding: 20px !important;
          max-width: 800px !important;
        }

        /* FLEX layout per event: [left] [marker] [right] centered */
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event {
          display: flex !important;
          align-items: flex-start !important;
          justify-content: center !important; /* center row */
          width: 100% !important;
          margin-bottom: 2rem !important;
          gap: 0 !important;
        }

        /* Separator fixed width with 30px inner gap to both sides */
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event .p-timeline-event-separator {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex: 0 0 ${typeof markerSize === 'number' ? `${markerSize}px` : '32px'} !important;
          margin: 0 30px !important;
          z-index: 2 !important;
        }

        /* Remove extra spacing around the date/opposite so it sits close to marker */
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event .p-timeline-event-opposite {
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Odd row order: [left-date][separator][right-content] */
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event:nth-child(odd) { flex-direction: row !important; }
        
        /* Even row order: [left-content][separator][right-date] */
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event:nth-child(even) { flex-direction: row-reverse !important; }
        
        /* LEFT SIDE STYLING - applies to both left dates (odd) and left content (even) */
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event:nth-child(odd) .p-timeline-event-opposite,
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event:nth-child(even) .p-timeline-event-content {
          text-align: right !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: right !important; /* center align with marker */
          align-items: flex-end !important; /* align toward center marker */
        }
        
        /* RIGHT SIDE STYLING - applies to both right content (odd) and right dates (even) */
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event:nth-child(odd) .p-timeline-event-content,
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event:nth-child(even) .p-timeline-event-opposite {
          text-align: left !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: start !important; /* center align with marker */
          align-items: flex-start !important; /* align toward center marker */
        }

        /* Base sizing/centering for sides */
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event .p-timeline-event-opposite {
          flex: 0 0 auto !important; /* don't stretch date */
          display: flex !important;
          align-items: center !important; /* vertical align with marker */
          justify-content: center !important;
          max-width: 220px !important;
          box-sizing: border-box !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .prime-timeline-centered .p-timeline-vertical .p-timeline-event .p-timeline-event-content {
          flex: 1 1 auto !important; /* let card side grow */
          display: flex !important;
          align-items: center !important; /* vertical align with marker */
          justify-content: flex-start !important;
          max-width: 460px !important;
          box-sizing: border-box !important;
          padding: 0 !important;
          margin: 0 !important;
        }
      `}</style>
      <div className={className} style={{ ...style, width: containerWidth, height: containerHeight }}>
        <div style={{ 
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "center"
        }}>
        <Timeline
          value={Array.isArray(events) ? events : []}
          align={finalAlign}
          layout={finalLayout}
          marker={renderMarker}
          content={renderContent}
          opposite={oppositeProp}
          className={`prime-timeline-centered ${timelineClassName}`.trim()}
          style={{
            width: "100%",
            maxWidth: "800px" // Wider to accommodate alternating content
          }}
        />
      </div>
      {enableDialog && displayMode === "dialog" && (
        <Dialog
          header={dialogItem ? (dialogHeaderField ? dialogItem?.[dialogHeaderField] : dialogItem?.[titleField]) : ""}
          visible={dialogVisible}
          style={{ width: dialogWidth }}
          modal
          onHide={() => setDialogVisible(false)}
        >
          {renderDialogContent()}
        </Dialog>
      )}
      {enableDialog && displayMode === "drawer" && (
        <Sidebar
          visible={dialogVisible}
          position={getDrawerPosition()}
          onHide={() => setDialogVisible(false)}
          style={{ 
            width: getDrawerPosition() === "right" || getDrawerPosition() === "left" ? drawerSize : "100%",
            height: getDrawerPosition() === "right" || getDrawerPosition() === "left" ? "100vh" : drawerSize
          }}
          header={dialogItem ? (dialogHeaderField ? dialogItem?.[dialogHeaderField] : dialogItem?.[titleField]) : ""}
        >
          {renderDialogContent()}
        </Sidebar>
      )}
      </div>
    </>
  );
};

export default PrimeTimeline;


