import { Event } from "@/types";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white border border-black p-4 flex items-center gap-4 hover:shadow-[4px_4px_0px_#000] transition-shadow">
      <div className="w-10 h-10 bg-black flex items-center justify-center">
        <span className="font-mono text-xs text-[#FFE600] font-bold">
          {event.date}
        </span>
      </div>
      <div>
        <div className="text-xs text-black font-bold uppercase">
          {event.title}
        </div>
        <div className="text-[10px] text-[#666] font-mono">
          {event.time} • {event.location}
        </div>
      </div>
    </div>
  );
}
