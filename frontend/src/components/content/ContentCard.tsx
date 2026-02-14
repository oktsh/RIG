import { ContentItem } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";

interface ContentCardProps {
  item: ContentItem;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ContentCard({
  item,
  onEdit,
  onDelete,
}: ContentCardProps) {
  return (
    <div className="bg-white border border-black p-6 flex items-center justify-between group hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-[#F5F5F5] border border-black flex items-center justify-center font-mono text-xl font-bold">
          {item.emoji}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold uppercase tracking-tight">
              {item.title}
            </h3>
            <StatusBadge status={item.status} />
          </div>
          <div className="flex gap-4 font-mono text-[10px] text-gray-500 uppercase">
            <span>ID: {item.id}</span>
            <span>Type: {item.type}</span>
            <span>Updated: {item.updated}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <div className="text-sm font-bold font-mono">
            {item.copies.toLocaleString()}
          </div>
          <div className="text-[9px] text-gray-500 font-bold uppercase">
            КОПИЙ
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-6 py-3 text-xs font-bold uppercase border border-black bg-transparent text-black hover:bg-black hover:text-white transition-all"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-6 py-3 text-xs font-bold uppercase border border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
