import React, { useState, useEffect, useRef } from "react";
import { bankService, type Bank } from "../services/bank.service";

interface BankSelectorProps {
  value: string;
  onChange: (bankName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const BankSelector: React.FC<BankSelectorProps> = ({
  value,
  onChange,
  placeholder = "Chọn ngân hàng",
  disabled = false,
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load banks on mount
  useEffect(() => {
    const loadBanks = async () => {
      setLoading(true);
      try {
        const banksData = await bankService.getBanks();
        setBanks(banksData);
        setFilteredBanks(banksData);
      } catch (error) {
        console.error("Error loading banks:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBanks();
  }, []);

  // Filter banks based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBanks(banks);
    } else {
      const filtered = banks.filter(
        (bank) =>
          bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBanks(filtered);
    }
  }, [searchTerm, banks]);

  // Set selected bank when value changes
  useEffect(() => {
    if (value) {
      const bank = banks.find((b) => b.name === value || b.shortName === value);
      setSelectedBank(bank || null);
    } else {
      setSelectedBank(null);
    }
  }, [value, banks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    onChange(bank.shortName || bank.name);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={
            searchTerm ||
            (selectedBank ? selectedBank.shortName || selectedBank.name : "")
          }
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          </div>
        )}
        {!loading && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredBanks.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {searchTerm ? "Không tìm thấy ngân hàng" : "Đang tải..."}
            </div>
          ) : (
            <div>
              {filteredBanks.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => handleBankSelect(bank)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                >
                  {bank.logo && (
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {bank.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {bank.shortName} ({bank.code})
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BankSelector;
