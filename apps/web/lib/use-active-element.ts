import { useState, useEffect } from "react";

export const useActiveElement = () => {
  const [active, setActive] = useState(document.activeElement);

  const handleFocusIn = (e: any) => {
    setActive(document.activeElement);
  };

  useEffect(() => {
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  return active;
};
