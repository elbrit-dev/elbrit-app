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
  drawerSize = "30rem",
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

  // Events
  onReadMore,
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
      return window.innerWidth >= 768 ? "right" : "bottom";
    }
    return "right"; // fallback
  };

  const getValue = (obj, path) => {
    if (!obj || !path) return undefined;
    if (path.indexOf(".") === -1) return obj?.[path];
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  };
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
          padding: cardPadding
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
              {summaryFields.map((f, idx) => (
                <div key={idx} style={{ display: "flex", gap: 6, alignItems: "baseline", wordBreak: "break-word" }}>
                  <span style={{ fontWeight: 500 }}>{f?.label || f?.field}:</span>
                  <span>{String(getValue(item, f?.field))}</span>
                </div>
              ))}
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
      </div>
    );
  };

  const renderOpposite = (item) => {
    if (!showOpposite || layout === "horizontal") return null;
    const content = item?.[oppositeField];
    return content ? <small className="text-color-secondary">{content}</small> : null;
  };

  const renderDialogContent = () => {
    if (!dialogItem) return null;

    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const drawerPos = getDrawerPosition();
    const isVerticalDrawer = drawerPos === "right" || drawerPos === "left";
    
    // Centering wrapper for desktop vertical drawers
    const wrapperStyle = isDesktop && isVerticalDrawer ? {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      padding: "2rem"
    } : {
      padding: "1rem"
    };

    if (dialogMode === "twoCards") {
      return (
        <div style={wrapperStyle}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: columnGap,
            minHeight: "300px",
            width: "100%",
            maxWidth: isDesktop ? "800px" : "100%"
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
                {showTableTotals ? (
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
                    <span>{leftTotalLabel}</span>
                    <span>{String(getValue(dialogItem, leftTotalField))}</span>
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
                {showTableTotals ? (
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
                    <span>{rightTotalLabel}</span>
                    <span>{String(getValue(dialogItem, rightTotalField))}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          </div>
        </div>
      );
    } else if (dialogMode === "twoTables") {
      return (
        <div style={wrapperStyle}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: columnGap,
            minHeight: "400px",
            overflow: "hidden",
            width: "100%",
            maxWidth: isDesktop ? "900px" : "100%"
          }}>
          <div>
            {leftCardTitle ? <div style={{ fontWeight: 600, marginBottom: 8 }}>{leftCardTitle}</div> : null}
            {leftListField && Array.isArray(getValue(dialogItem, leftListField)) ? (
              <DataTable
                value={[
                  ...getValue(dialogItem, leftListField),
                  ...(showTableTotals ? [{
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
                  minWidth: "200px" // Prevent tables from getting too narrow
                }}
                rowClassName={(rowData) => rowData._isTotal ? "font-bold bg-primary-50" : ""}
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
                    <Column field={leftListItemValueField} header="Amount" style={{ textAlign: "right" }} />
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
                  ...(showTableTotals ? [{
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
                  minWidth: "200px" // Prevent tables from getting too narrow
                }}
                rowClassName={(rowData) => rowData._isTotal ? "font-bold bg-primary-50" : ""}
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
                    <Column field={rightListItemValueField} header="Amount" style={{ textAlign: "right" }} />
                  </>
                )}
              </DataTable>
            ) : (
              <div style={{ color: "var(--text-color-secondary)" }}>No data available</div>
            )}
          </div>
          </div>
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
    <div className={className} style={{ ...style, width: containerWidth, height: containerHeight }}>
      <Timeline
        value={Array.isArray(events) ? events : []}
        align={finalAlign}
        layout={finalLayout}
        marker={renderMarker}
        content={renderContent}
        opposite={oppositeProp}
        className={`w-full ${timelineClassName}`.trim()}
      />
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
  );
};

export default PrimeTimeline;


