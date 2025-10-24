import React, { useState } from "react";

const RavenChatEmbed = (props) => {
  // Safely extract props with proper defaults and type conversion
  const url = props?.url || "https://erp.elbrit.org/raven";
  const height = typeof props?.height === 'number' ? props.height : 720;
  const showBorder = Boolean(props?.showBorder);
  const borderRadius = typeof props?.borderRadius === 'number' ? props.borderRadius : 10;
  
  const [loaded, setLoaded] = useState(false);

  // Ensure height is a valid CSS value
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      style={{
        width: "100%",
        height: heightValue,
        border: showBorder ? "1px solid #ddd" : "none",
        borderRadius: `${borderRadius}px`,
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
          borderRadius: `${borderRadius}px`,
        }}
        onLoad={() => setLoaded(true)}
        allow="clipboard-write; fullscreen"
      />
    </div>
  );
};

export { RavenChatEmbed };
export default RavenChatEmbed;
