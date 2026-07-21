import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { FILE_STATUS_COLORS } from "@/lib/fileStatus";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[0.625rem] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-2.5!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border bg-secondary text-secondary-foreground dark:bg-input/30 [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// colorScheme prop: "primary" → dark blue text on light blue bg
//                  "secondary" → light blue text on dark blue bg
const COLOR_SCHEME_STYLES = {
  primary: {
    backgroundColor: "#E0F2FE",
    color: "#075985",
    borderColor: "#075985",
  },
  secondary: {
    backgroundColor: "#075985",
    color: "#E0F2FE",
    borderColor: "#075985",
  },
  accent: {
    backgroundColor: "#ff99001a",
    color: "#FF9900",
    borderColor: "#FF9900",
  },
  ghost: {
    backgroundColor: "#0089d61a",
    color: "#0089D6",
    borderColor: "#0089D6",
  },
};
function Badge({
  className,
  variant = "default",
  color,
  render,
  style,
  status,
  ...props
}) {
  const colorStyle = color ? COLOR_SCHEME_STYLES[color] : undefined;
  const statusColors = status ? FILE_STATUS_COLORS[status] : undefined;

  const statusStyle = statusColors
    ? { backgroundColor: statusColors.bg, color: statusColors.text }
    : undefined;

  return useRender({
    defaultTagName: "span",
    props: mergeProps(
      {
        className: cn(
          badgeVariants({ variant }),
          (color || status) && "border-transparent",
          className,
        ),
        style: { ...colorStyle, ...statusStyle, ...style },
      },
      props,
    ),
    render,
    state: { slot: "badge", variant },
  });
}

export { Badge, badgeVariants };
