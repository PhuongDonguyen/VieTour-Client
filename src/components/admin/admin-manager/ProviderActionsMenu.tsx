import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Lock } from 'lucide-react';
import { type Provider } from '@/services/adminManager.service';

interface ProviderActionsMenuProps {
  provider: Provider;
  onLockProvider: (provider: Provider) => void;
}

const ProviderActionsMenu: React.FC<ProviderActionsMenuProps> = ({ provider, onLockProvider }) => {
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
          className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="py-1">
            <button
              onClick={handleLockClick}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
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

