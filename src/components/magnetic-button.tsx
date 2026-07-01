import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MagneticButton({
  children,
  className,
  strength = 22,
  as: Comp = "button" as const,
  ...props
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: React.ElementType;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 14, mass: 0.35 });
  const y = useSpring(my, { stiffness: 180, damping: 14, mass: 0.35 });
  const rx = useTransform(y, (v) => v / -6);
  const ry = useTransform(x, (v) => v / 6);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set(((e.clientX - (r.left + r.width / 2)) / r.width) * strength);
    my.set(((e.clientY - (r.top + r.height / 2)) / r.height) * strength);
  };
  const reset = () => { mx.set(0); my.set(0); };

  const MotionComp = motion(Comp);

  return (
    <MotionComp
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x, y, rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className={cn("relative inline-flex", className)}
      {...props}
    >
      {children}
    </MotionComp>
  );
}
