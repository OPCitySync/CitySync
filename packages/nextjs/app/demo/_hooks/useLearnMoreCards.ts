"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useLearnMoreCards<K extends string>(activeTab: string) {
  const [openInfoCards, setOpenInfoCards] = useState<K[]>([]);
  const previousActiveTabRef = useRef(activeTab);

  const openLearnMore = useCallback((selection: K | K[]) => {
    setOpenInfoCards(Array.isArray(selection) ? selection : [selection]);
  }, []);

  const closeLearnMore = useCallback((key: K) => {
    setOpenInfoCards(prev => prev.filter(item => item !== key));
  }, []);

  const clearLearnMore = useCallback(() => {
    setOpenInfoCards([]);
  }, []);

  useEffect(() => {
    if (previousActiveTabRef.current !== activeTab) {
      setOpenInfoCards([]);
      previousActiveTabRef.current = activeTab;
    }
  }, [activeTab]);

  return {
    openInfoCards,
    openLearnMore,
    closeLearnMore,
    clearLearnMore,
  };
}
