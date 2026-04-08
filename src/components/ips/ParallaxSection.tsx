import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Background image URL for parallax effect */
  bgImage?: string;
  /** Background gradient overlay */
  overlay?: "dark" | "light" | "accent" | "none";
  /** Parallax speed: negative = slower than scroll, positive = faster */
  speed?: number;
  /** Whether to apply fade-in on scroll */
  fadeIn?: boolean;
}

const overlayMap = {
  dark: "bg-primary/70",
  light: "bg-background/60",
  accent: "bg-gradient-to-br from-accent/20 via-primary/40 to-background/80",
  none: "",
};

const ParallaxSection = ({
  children,
  className,
  bgImage,
  overlay = "none",
  speed = -0.15,
  fadeIn = true,
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {bgImage && (
        <>
          <motion.div
            className="absolute inset-0 -inset-y-20 bg-cover bg-center bg-no-repeat"
            style={{ y, backgroundImage: `url(${bgImage})` }}
          />
          {overlay !== "none" && (
            <div className={cn("absolute inset-0", overlayMap[overlay])} />
          )}
        </>
      )}
      <motion.div
        className="relative z-10"
        style={fadeIn ? { opacity } : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxSection;
