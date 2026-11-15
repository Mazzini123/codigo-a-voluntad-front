import { useEffect } from "react";

export function SinConfigurarCallback({ alFallar }) {
  useEffect(() => {
    alFallar();
  }, [alFallar]);
  return null;
}
