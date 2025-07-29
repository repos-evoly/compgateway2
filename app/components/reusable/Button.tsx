/* --------------------------------------------------------------------------
   ActionButton.tsx
   – Re-usable, strictly-typed button that can run one or more “actions”.
   – Two visual variants:
     • isTransparent === true  → looks like AddButton (white border, hollow)
     • isTransparent === false → looks like SubmitButton (filled bg-info-main)
   -------------------------------------------------------------------------- */

"use client";

import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

/* ------------------------------------------------------------------ */
/* Action definitions – extend as your app grows                      */
/* ------------------------------------------------------------------ */
export type NavigateAction = { type: "navigate"; href: string };

export type ModalAction<T = unknown> = {
  type: "openModal";
  id: string; // event name: “open-modal:contact-form”
  payload?: T;
};

export type CallbackAction = { type: "callback"; fn: () => void };

export type ButtonAction = NavigateAction | ModalAction | CallbackAction;

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */
type NativeBtn = ComponentPropsWithoutRef<"button">;

export type ActionButtonProps = {
  actions?: ButtonAction | ButtonAction[];
  afterClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** If true → transparent variant (AddButton style) */
  isTransparent?: boolean;
  /** Optional icon (defaults to left arrow like the submit example) */
  icon?: ReactNode;
  children: ReactNode;
  /** Override styles completely if needed */
  className?: string;
} & Omit<NativeBtn, "onClick">;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function Button({
  actions,
  afterClick,
  isTransparent = false,
  icon,
  children,
  className,
  ...rest
}: ActionButtonProps) {
  const router = useRouter();

  /* ---------- execute one action ----------------------------------- */
  const run = (a: ButtonAction) => {
    switch (a.type) {
      case "navigate":
        router.push(a.href);
        break;
      case "openModal":
        window.dispatchEvent(
          new CustomEvent(`open-modal:${a.id}`, { detail: a.payload })
        );
        break;
      case "callback":
        a.fn();
        break;
    }
  };

  /* ---------- click handler ---------------------------------------- */
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (Array.isArray(actions)) actions.forEach(run);
    else if (actions) run(actions);
    afterClick?.(e);
  };

  /* ------------------------------------------------------------------ */
  /* Styling                                                            */
  /* ------------------------------------------------------------------ */
  const transparentClasses =
    "border border-white text-white px-4 py-2 rounded hover:bg-warning-light hover:text-info-dark hover:border-warning-light";

  const filledClasses =
    "flex items-center gap-2 bg-info-main text-white border border-white px-4 py-2 rounded font-semibold transition duration-300 hover:border-transparent hover:bg-warning-light hover:text-info-dark";

  const defaultClasses = isTransparent ? transparentClasses : filledClasses;

  const appliedClasses =
    className && className.trim().length > 0 ? className : defaultClasses;

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <button
      type="button"
      onClick={handleClick}
      className={appliedClasses}
      {...rest}
    >
      {/* icon is optional; defaults to arrow for filled style */}
      {icon ?? (!isTransparent && <FaArrowLeft />)}
      {children}
    </button>
  );
}
