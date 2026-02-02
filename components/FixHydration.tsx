"use client";

import { useEffect } from "react";

export function FixHydration() {
  useEffect(() => {
    // Remove once immediately
    if (document.body.hasAttribute("__processed_")) {
      // or check for any attribute starting with __processed_
      const attrs = document.body.getAttributeNames();
      attrs.forEach((attr) => {
        if (attr.startsWith("__processed_")) {
          document.body.removeAttribute(attr);
        }
      });
    }

    // Watch for future additions (some extensions keep trying)
    const observer = new MutationObserver(() => {
      const attrs = document.body.getAttributeNames();
      attrs.forEach((attr) => {
        if (attr.startsWith("__processed_")) {
          document.body.removeAttribute(attr);
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["__processed_"], // can be more generic if needed
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
