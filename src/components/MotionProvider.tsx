"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Hace que todas las animaciones de Framer Motion respeten la preferencia
 * "reducir movimiento" del sistema del usuario (accesibilidad, WCAG 2.3.3).
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
