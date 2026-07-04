import { cn } from "@/lib/utils";

type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
type PaymentStatus = "Belum Bayar" | "DP" | "Lunas";

const statusMap: Record<string, string> = {
  Pending:   "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  Confirmed: "bg-blue-400/15  text-blue-300  border-blue-400/30",
  Completed: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  Cancelled: "bg-red-400/15   text-red-300   border-red-400/30",
};

const payMap: Record<string, string> = {
  "Belum Bayar": "bg-pink-400/15   text-pink-300   border-pink-400/30",
  DP:            "bg-purple-400/15 text-purple-300 border-purple-400/30",
  Lunas:         "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
};

export function StatusBadge({ status }: { status: BookingStatus | string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", statusMap[status] ?? "bg-secondary text-muted-foreground border-border")}>
      {status}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus | string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", payMap[status] ?? "bg-secondary text-muted-foreground border-border")}>
      {status}
    </span>
  );
}
