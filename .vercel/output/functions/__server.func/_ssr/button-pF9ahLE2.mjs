import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-pF9ahLE2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-[var(--color-fg)] text-[var(--color-accent-fg)] hover:bg-white",
			secondary: "bg-[var(--color-bg-subtle)] text-[var(--color-fg)] border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)]",
			ghost: "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-white/5",
			outline: "border border-[var(--color-border-strong)] bg-transparent text-[var(--color-fg)] hover:bg-white/5"
		},
		size: {
			default: "h-10 px-4 py-2 min-h-11",
			sm: "h-9 px-3 text-xs min-h-9",
			lg: "h-11 px-5 min-h-11",
			icon: "h-10 w-10 min-h-11 min-w-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { cn as n, Button as t };
