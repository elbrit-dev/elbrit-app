import React, { useState } from "react";

export const RavenChatEmbed = ({
  url = "https://erp.elbrit.org/raven",
  height = 720,
  showBorder = false,
  borderRadius = 10,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      style={{
        width: "100%",
        height,
        border: showBorder ? "1px solid #ddd" : "none",
        borderRadius,
        overflow: "hidden",
        position: "relative",
        background: "#f5f5f5",
      }}
    >
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            fontSize: 14,
          }}
        >
          Loading Raven Chat...
        </div>
      )}
      <iframe
        src={url}
        title="Raven Chat"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius,
        }}
        onLoad={() => setLoaded(true)}
        allow="clipboard-write; fullscreen"
      />
    </div>
  );
};
