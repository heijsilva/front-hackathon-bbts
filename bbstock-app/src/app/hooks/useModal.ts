import { useCallback, useState } from 'react';

export function useModal<T = void>() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const show = useCallback((payload?: T) => {
  
    setData(payload ?? null);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    setData(null);
  }, []);

  return { open, show, hide, data };
}