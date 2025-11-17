import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Lock, Eye } from 'lucide-react';
import { type Provider } from '@/services/adminManager.service';

interface ProviderActionsMenuProps {
  provider: Provider;
  onLockProvider: (provider: Provider) => void;
  onViewTours: (provider: Provider) => void;
}

const ProviderActionsMenu: React.FC<ProviderActionsMenuProps> = ({ provider, onLockProvider, onViewTours }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMenuPosition = () => {
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 192; // w-48 = 192px
        const menuHeight = 50; // Estimated height
        const viewportHeight = window.innerHeight;
        
        let left = buttonRect.right + window.scrollX - menuWidth;
        let top = buttonRect.bottom + window.scrollY + 8;
        
        // Kiểm tra nếu menu vượt ra ngoài viewport bên phải
        if (buttonRect.right - menuWidth < 0) {
          left = buttonRect.left + window.scrollX;
        }
        
        // Kiểm tra nếu menu vượt ra ngoài viewport bên dưới
        if (buttonRect.bottom + menuHeight > viewportHeight) {
          top = buttonRect.top + window.scrollY - menuHeight - 8;
        }
        
        setMenuPosition({ top, left });
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && buttonRef.current) {
      updateMenuPosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updateMenuPosition, true);
      window.addEventListener('resize', updateMenuPosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  }, [isOpen]);

  const handleLockClick = () => {
    onLockProvider(provider);
    setIsOpen(false);
  };

  const handleViewToursClick = () => {
    onViewTours(provider);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 w-48 rounded-lg border border-gray-200 bg-white shadow-lg"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="py-1">
            <button
              onClick={handleViewToursClick}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Eye className="h-4 w-4" />
              Xem danh sách tour
            </button>
            <button
              onClick={handleLockClick}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Lock className="h-4 w-4" />
              Khóa tài khoản
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProviderActionsMenu;

