/**
 * useModalAction Hook
 *
 * Custom hook for managing modal state and async actions.
 * Provides a consistent pattern for modals that perform async operations.
 */

import { useState, useCallback } from "react";
import type { FormInstance } from "antd/es/form/Form";

export interface UseModalActionOptions<T = void> {
  /**
   * The async action to perform when the modal is confirmed.
   * Receives the form values (if any) and should return a promise.
   */
  onConfirm: (values?: T) => Promise<void>;
  /**
   * Optional callback for when the modal is closed without confirming.
   */
  onCancel?: () => void;
  /**
   * Optional form instance to reset when modal closes.
   */
  form?: FormInstance;
  /**
   * Optional success message to show when action completes.
   */
  successMessage?: string;
  /**
   * Optional error message prefix.
   */
  errorPrefix?: string;
}

export interface UseModalActionReturn<T = void> {
  /** Whether the modal is currently open */
  open: boolean;
  /** Open the modal */
  setOpen: (value: boolean) => void;
  /** Whether an action is in progress */
  loading: boolean;
  /** Handle modal confirm - validates form (if provided) and executes onConfirm */
  handleConfirm: (values?: T) => Promise<void>;
  /** Handle modal cancel - closes modal and resets form (if provided) */
  handleCancel: () => void;
  /** Set loading state manually */
  setLoading: (value: boolean) => void;
}

/**
 * Custom hook for managing modal state and async actions.
 *
 * @param options - Configuration options for the modal action
 * @returns Modal state and handler functions
 *
 * @example
 * ```tsx
 * const assignModal = useModalAction({
 *   onConfirm: async (values) => {
 *     await assignTransaction(values.analystId);
 *   },
 *   form,
 *   successMessage: "Transaction assigned successfully",
 * });
 *
 * <Modal
 *   open={assignModal.open}
 *   onOk={assignModal.handleConfirm}
 *   onCancel={assignModal.handleCancel}
 *   confirmLoading={assignModal.loading}
 * >
 *   <Form form={form}>...</Form>
 * </Modal>
 * ```
 */
export function useModalAction<T = void>(
  options: UseModalActionOptions<T>
): UseModalActionReturn<T> {
  const { onConfirm, onCancel, form, errorPrefix = "Action failed" } = options;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = useCallback(
    async (values?: T): Promise<void> => {
      // Validate form if provided
      if (form !== undefined) {
        try {
          await form.validateFields();
        } catch {
          // Validation failed
          return;
        }
      }

      setLoading(true);
      try {
        await onConfirm(values);
        // Close modal on success
        setOpen(false);
        // Reset form if provided
        form?.resetFields();
      } catch (error) {
        // Error would be handled by the calling component
        // or we could add a default error handler here
        console.error(`${errorPrefix}:`, error);
      } finally {
        setLoading(false);
      }
    },
    [onConfirm, form, errorPrefix]
  );

  const handleCancel = useCallback((): void => {
    setOpen(false);
    form?.resetFields();
    onCancel?.();
  }, [form, onCancel]);

  return {
    open,
    setOpen,
    loading,
    handleConfirm,
    handleCancel,
    setLoading,
  };
}

/**
 * Hook variant for modals that need to receive data when opening.
 * Useful for edit modals that need to pre-populate form data.
 */
export interface UseModalWithDataOptions<
  TData,
  TSubmit = void,
> extends UseModalActionOptions<TSubmit> {
  /**
   * Optional callback to prepare form data when modal opens with data.
   */
  onOpen?: (data: TData) => void;
}

export interface UseModalWithDataReturn<
  TData = void,
  TSubmit = void,
> extends UseModalActionReturn<TSubmit> {
  /** Open the modal with optional data */
  openWithData: (data: TData) => void;
  /** Data that was used to open the modal */
  modalData: TData | null;
}

/**
 * Extended modal hook for modals that receive data when opening.
 *
 * @param options - Configuration options for the modal action
 * @returns Modal state and handler functions including openWithData
 *
 * @example
 * ```tsx
 * const editModal = useModalWithData({
 *   onConfirm: async (values) => {
 *     await updateRule(ruleId, values);
 *   },
 *   onOpen: (rule) => {
 *     form.setFieldsValue(rule);
 *   },
 *   form,
 * });
 *
 * // Later:
 * editModal.openWithData(ruleToEdit);
 * <Modal open={editModal.open} ... />
 * ```
 */
export function useModalWithData<TData = void, TSubmit = void>(
  options: UseModalWithDataOptions<TData, TSubmit>
): UseModalWithDataReturn<TData, TSubmit> {
  const [modalData, setModalData] = useState<TData | null>(null);
  const { onOpen, ...baseOptions } = options;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = useCallback(
    async (values?: TSubmit): Promise<void> => {
      const { form, errorPrefix = "Action failed" } = baseOptions;
      if (form !== undefined) {
        try {
          await form.validateFields();
        } catch {
          return;
        }
      }

      setLoading(true);
      try {
        await baseOptions.onConfirm(values);
        setOpen(false);
        form?.resetFields();
      } catch (error) {
        console.error(`${errorPrefix}:`, error);
      } finally {
        setLoading(false);
      }
    },
    [baseOptions]
  );

  const handleCancel = useCallback((): void => {
    setOpen(false);
    baseOptions.form?.resetFields();
    baseOptions.onCancel?.();
  }, [baseOptions]);

  const openWithData = useCallback(
    (data: TData): void => {
      setModalData(data);
      setOpen(true);
      onOpen?.(data);
    },
    [onOpen]
  );

  return {
    open,
    setOpen,
    loading,
    handleConfirm,
    handleCancel,
    setLoading,
    openWithData,
    modalData,
  };
}

export default useModalAction;
