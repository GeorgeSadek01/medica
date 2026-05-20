import { useState, useCallback, useRef } from 'react';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
}

const useConfirm = () => {
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
  });

  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const showConfirm = useCallback((title: string, message: string): Promise<boolean> => {
    setConfirm({ open: true, title, message });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    setConfirm((prev) => ({ ...prev, open: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setConfirm((prev) => ({ ...prev, open: false }));
  }, []);

  return { confirm, showConfirm, handleConfirm, handleCancel };
};

export default useConfirm;
