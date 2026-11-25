"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type BottomSheetHeight = "auto" | "full";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  height?: BottomSheetHeight;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showHandle?: boolean;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  height = "auto",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showHandle = true,
  showCloseButton = true,
  className,
  contentClassName,
}: BottomSheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeOnEscape, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={cn("fixed inset-0 z-50 flex items-end sm:items-end", className)}
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-transparent [animation:fade-in_150ms_ease-out]"
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex w-full flex-col rounded-t-3xl bg-white shadow-xl outline-none",
          "[animation:slide-up_220ms_ease-out]",
          height === "full"
            ? "h-[92vh] max-h-[92vh]"
            : "max-h-[92vh]",
          contentClassName,
        )}
      >
        {showHandle ? (
          <div className="flex justify-center pt-3 pb-1">
            <span
              aria-hidden="true"
              className="h-1.5 w-12 rounded-full bg-zinc-300"
            />
          </div>
        ) : null}

        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-5 py-3 sm:px-6">
            <div className="min-w-0">
              {title ? (
                <h2
                  id={titleId}
                  className="text-lg font-semibold leading-6 text-zinc-900"
                >
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm text-zinc-600"
                >
                  {description}
                </p>
              ) : null}
            </div>
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            ) : null}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 sm:px-6">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-zinc-200 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {footer}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
