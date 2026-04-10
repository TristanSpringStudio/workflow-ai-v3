import {
  DollarSign,
  Megaphone,
  TrendingUp,
  Wrench,
  FlaskConical,
  PackageSearch,
  Users,
  Headphones,
  Share2,
  Palette,
  Scale,
  Building2,
  type LucideIcon,
} from "lucide-react";

export interface DeptIcon {
  Icon: LucideIcon;
  bg: string;
}

/**
 * Canonical department → icon/color map. Every place in the UI that renders
 * a department chip or badge should pull from here via `getDeptIcon()` so
 * the "design request processing" chip on Home and a Design badge on the
 * department page never drift or fall back to an invisible empty span.
 *
 * Keys are matched case-insensitively. Unknown departments get
 * `DEFAULT_DEPT_ICON` (a gray Building2).
 */
const DEPT_ICON_MAP: Record<string, DeptIcon> = {
  sales: { Icon: DollarSign, bg: "#22c55e" },
  marketing: { Icon: Megaphone, bg: "#a855f7" },
  finance: { Icon: TrendingUp, bg: "#3b82f6" },
  operations: { Icon: Wrench, bg: "#f59e0b" },
  engineering: { Icon: FlaskConical, bg: "#6366f1" },
  product: { Icon: PackageSearch, bg: "#ec4899" },
  design: { Icon: Palette, bg: "#f43f5e" },
  hr: { Icon: Users, bg: "#3b82f6" },
  "human resources": { Icon: Users, bg: "#3b82f6" },
  it: { Icon: Share2, bg: "#dc2626" },
  legal: { Icon: Scale, bg: "#64748b" },
  support: { Icon: Headphones, bg: "#ca8a04" },
  "customer success": { Icon: Headphones, bg: "#ca8a04" },
  "customer support": { Icon: Headphones, bg: "#ca8a04" },
};

export const DEFAULT_DEPT_ICON: DeptIcon = { Icon: Building2, bg: "#6b7280" };

/**
 * Always returns a valid DeptIcon — never undefined. Case-insensitive.
 */
export function getDeptIcon(name: string | null | undefined): DeptIcon {
  if (!name) return DEFAULT_DEPT_ICON;
  return DEPT_ICON_MAP[name.trim().toLowerCase()] || DEFAULT_DEPT_ICON;
}
