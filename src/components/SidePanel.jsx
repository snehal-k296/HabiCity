import { motion } from "framer-motion";

// Shared chrome for anything that used to pop up below the land — the plot
// details, the shop, the new-domain form. All three now dock to the right
// edge of the screen as a scroll, sliding in over a dim backdrop, instead of
// pushing the page content down.
export default function SidePanel({ onClose, ariaLabel, children, className = "" }) {
  return (
    <>
      <motion.div
        className="side-panel-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        className={`side-panel ${className}`}
        initial={{ x: "104%" }}
        animate={{ x: 0 }}
        exit={{ x: "104%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        role="dialog"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </>
  );
}
