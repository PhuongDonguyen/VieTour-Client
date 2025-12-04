import { AnimatePresence } from "framer-motion";
import MessageToastItem, { MessageToastData } from "./ToastMessageItem";

interface Props {
  toasts: MessageToastData[];
  removeToast: (id: string) => void;
}

export default function MessageToastContainer({ toasts, removeToast }: Props) {
  return (
    <div className="fixed top-5 right-5 flex flex-col gap-3 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <MessageToastItem
            key={toast.id}
            data={toast}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
