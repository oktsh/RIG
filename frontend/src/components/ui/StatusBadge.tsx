import { ContentStatus } from "@/types";

interface StatusBadgeProps {
  status: ContentStatus;
}

const statusClasses: Record<ContentStatus, string> = {
  published: "bg-[#B4FF00]",
  draft: "bg-[#DDD]",
  pending: "bg-[#FFE600]",
};

const statusText: Record<ContentStatus, string> = {
  published: "Published",
  draft: "Draft",
  pending: "Pending Review",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`text-[9px] px-[6px] py-[2px] border border-black font-mono font-bold uppercase ${statusClasses[status]}`}
    >
      {statusText[status]}
    </span>
  );
}
