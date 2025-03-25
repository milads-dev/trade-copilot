import { type ComponentProps } from "react";

import { type Variants, motion } from "framer-motion";

type PropsT = {
  children: React.ReactNode;
  direction: number;
} & ComponentProps<"div">;

export default function AnimatedDiv({
  children,
  className,
  direction,
}: PropsT) {
  const anim = (variants: Variants, custom: number) => {
    return {
      initial: "initial",
      animate: "enter",
      exit: "exit",
      variants,
      custom,
    };
  };

  const nextStep: Variants = {
    initial: (direction) => ({
      opacity: 0,
      x: `${100 * direction}%`,
    }),

    enter: {
      x: "0%",
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },

    exit: (direction) => ({
      opacity: 0,
      x: `${-100 * direction}%`,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <motion.div {...anim(nextStep, direction)} className={className}>
      {children}
    </motion.div>
  );
}
