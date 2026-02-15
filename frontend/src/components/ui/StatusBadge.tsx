import { ContentStatus } from "@/types";

interface StatusBadgeProps {
  status: ContentStatus;
}

const statusClasses: Record<ContentStatus, string> = {
  published: "bg-[#B4FF00]",
  draft: "bg-[#DDD]",
  pending: "bg-[#FFE600]",
  rejected: "bg-[#FF6B6B]",
};

const statusText: Record<ContentStatus, string> = {
  published: "Published",
  draft: "Draft",
  pending: "Pending Review",
  rejected: "Rejected",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`text-[9px] px-[6px] py-[2px] border border-black font-mono font-bold uppercase ${statusClasses[status] || "bg-[#DDD]"}`}
    >
      {statusText[status] || status}
    </span>
  );
}
