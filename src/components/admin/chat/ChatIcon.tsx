import { MessageCircleMore } from "lucide-react";

export function ChatIcon({ count }) {
  return (
    <div className="relative">
      <div className="p-3 rounded-full shadow-lg cursor-pointer">
        <MessageCircleMore size={28} color="#000" className="scale-120" />
      </div>

      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white-600
                         text-xs font-bold w-5 h-5 flex items-center justify-center
                         rounded-full shadow">
          {count}
        </span>
      )}
    </div>
  );
}


