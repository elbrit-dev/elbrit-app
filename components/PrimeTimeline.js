import React, { useState } from "react";
import { Timeline } from "primereact/timeline";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Image } from "primereact/image";

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
  markerSize = 32,
  markerTextColor = "#ffffff",
  readMoreTarget = "_self",
  imageWidth = "100%",
  imagePreview = true,
  enableDialog = false,
  dialogHeaderField = null,
  dialogContentField = null,
  dialogWidth = "30rem",
  dialogMode = "content", // content | twoCards
  leftCardTitle = "",
  rightCardTitle = "",
  leftFields = [], // [{label:"Gross pay", field:"gross_pay"}]
  rightFields = [],
  columnGap = "1rem",
  cardPadding = "1rem",
  summaryTitle = "",
  summaryFields = [], // [{label:"Gross pay", field:"gross_pay"}]

  // Events
  onReadMore,
  onItemClick,
  onImageClick,
  onDialogOpen
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogItem, setDialogItem] = useState(null);

  const getValue = (obj, path) => {
    if (!obj || !path) return undefined;
    if (path.indexOf(".") === -1) return obj?.[path];
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  };
  const renderMarker = (item) => {
    const backgroundColor = item?.[markerColorField] || "#3b82f6";
    const icon = item?.[iconField];

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
        {icon ? <i className={icon} /> : null}
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
        style={{ borderRadius: 8, border: "1px solid var(--surface-border)", background: "var(--surface-card)" }}
        onClick={() => onItemClick && onItemClick({ item })}
      >
        {title ? <h6 style={{ margin: 0, fontSize: 14 }}>{title}</h6> : null}
        {date ? <small className="text-color-secondary" style={{ display: "block", marginTop: 4 }}>{date}</small> : null}
        {description ? <p style={{ margin: "8px 0 12px 0" }}>{description}</p> : null}
        {summaryFields && summaryFields.length > 0 ? (
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

  return (
    <div className={className} style={style}>
      <Timeline
        value={Array.isArray(events) ? events : []}
        align={align}
        layout={layout}
        marker={renderMarker}
        content={renderContent}
        opposite={renderOpposite}
        className="w-full"
      />
      {enableDialog && (
        <Dialog
          header={dialogItem ? (dialogHeaderField ? dialogItem?.[dialogHeaderField] : dialogItem?.[titleField]) : ""}
          visible={dialogVisible}
          style={{ width: dialogWidth }}
          modal
          onHide={() => setDialogVisible(false)}
        >
          {dialogItem ? (
            dialogMode === "twoCards" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: columnGap }}>
                <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: cardPadding }}>
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
                </div>
                <div style={{ border: "1px solid var(--surface-border)", borderRadius: 8, padding: cardPadding }}>
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
                </div>
              </div>
            ) : (
              <div className="flex flex-column gap-3">
                {imageField && dialogItem?.[imageField] ? (
                  <Image src={dialogItem[imageField]} alt={dialogItem?.[imageAltField || ""] || ""} preview={imagePreview} />
                ) : null}
                <div>
                  {dialogContentField
                    ? dialogItem?.[dialogContentField]
                    : dialogItem?.[descriptionField]}
                </div>
              </div>
            )
          ) : null}
        </Dialog>
      )}
    </div>
  );
};

export default PrimeTimeline;


