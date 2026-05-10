export type ToastVariant = "success" | "error" | "info";

export type ToastPayload = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastHandler = (payload: ToastPayload) => void;

let handler: ToastHandler | null = null;

export function registerToastHandler(h: ToastHandler | null) {
  handler = h;
}

export const toast = {
  success(message: string, title?: string) {
    handler?.({ message, title, variant: "success", durationMs: 4200 });
  },
  error(message: string, title?: string) {
    handler?.({ message, title, variant: "error", durationMs: 5200 });
  },
  info(message: string, title?: string) {
    handler?.({ message, title, variant: "info", durationMs: 4000 });
  },
  custom(payload: ToastPayload) {
    handler?.(payload);
  },
};
