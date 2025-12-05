import { MessageCircleMore } from "lucide-react";

export function ChatIcon({ count }) {
  return (
    <div className="relative">
      {/* <div className="p-3 rounded-full shadow-lg cursor-pointer"> */}
      <div >

        <MessageCircleMore color="#000" className="w-4 h-4" />
      </div>
      {/* </div> */}

      {count > 0 && (
        <span className="absolute -top-4 -right-4 bg-red-500 text-white-600
                         text-xs font-bold w-5 h-5 flex items-center justify-center
                         rounded-full shadow">
          {count}
        </span>
      )}
    </div>
  );
}


