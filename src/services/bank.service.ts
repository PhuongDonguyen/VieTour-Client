// Service để lấy danh sách ngân hàng Việt Nam
export interface Bank {
  id: number;
  code: string;
  name: string;
  shortName: string;
  logo: string;
  bin: string;
  transferSupported: number;
  lookupSupported: number;
}

class BankService {
  // Cache danh sách ngân hàng
  private banksCache: Bank[] | null = null;

  // Lấy danh sách ngân hàng từ VietQR API v2
  async getBanksFromVietQR(): Promise<Bank[]> {
    try {
      const response = await fetch("https://api.vietqr.io/v2/banks");
      if (!response.ok) {
        throw new Error("Failed to fetch banks from VietQR");
      }
      const result = await response.json();

      if (result.code === "00" && result.data) {
        return result.data.map((bank: any) => ({
          id: bank.id,
          code: bank.code,
          name: bank.name,
          shortName: bank.shortName,
          logo: bank.logo,
          bin: bank.bin,
          transferSupported: bank.transferSupported,
          lookupSupported: bank.lookupSupported,
        }));
      } else {
        throw new Error("Invalid response from VietQR API");
      }
    } catch (error) {
      console.error("Error fetching banks from VietQR:", error);
      return [];
    }
  }

  // Danh sách ngân hàng dự phòng (fallback)
  getFallbackBanks(): Bank[] {
    return [
      {
        id: 1,
        code: "VCB",
        name: "Ngân hàng TMCP Ngoại thương Việt Nam",
        shortName: "VIETCOMBANK",
        logo: "",
        bin: "970436",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 2,
        code: "TCB",
        name: "Ngân hàng TMCP Kỹ thương Việt Nam",
        shortName: "TECHCOMBANK",
        logo: "",
        bin: "970407",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 3,
        code: "BIDV",
        name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
        shortName: "BIDV",
        logo: "",
        bin: "970418",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 4,
        code: "ACB",
        name: "Ngân hàng TMCP Á Châu",
        shortName: "ACB",
        logo: "",
        bin: "970416",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 5,
        code: "MB",
        name: "Ngân hàng TMCP Quân đội",
        shortName: "MBBANK",
        logo: "",
        bin: "970422",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 6,
        code: "VPB",
        name: "Ngân hàng TMCP Việt Nam Thịnh Vượng",
        shortName: "VPBANK",
        logo: "",
        bin: "970432",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 7,
        code: "STB",
        name: "Ngân hàng TMCP Sài Gòn Thương Tín",
        shortName: "SACOMBANK",
        logo: "",
        bin: "970403",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 8,
        code: "TPB",
        name: "Ngân hàng TMCP Tiên Phong",
        shortName: "TPBANK",
        logo: "",
        bin: "970423",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 9,
        code: "MSB",
        name: "Ngân hàng TMCP Hàng Hải Việt Nam",
        shortName: "MSB",
        logo: "",
        bin: "970426",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 10,
        code: "VIB",
        name: "Ngân hàng TMCP Quốc tế Việt Nam",
        shortName: "VIB",
        logo: "",
        bin: "970441",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 11,
        code: "OCB",
        name: "Ngân hàng TMCP Phương Đông",
        shortName: "OCB",
        logo: "",
        bin: "970448",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 12,
        code: "SCB",
        name: "Ngân hàng TMCP Sài Gòn",
        shortName: "SCB",
        bin: "970429",
        transferSupported: 1,
        lookupSupported: 1,
        logo: "",
      },
      {
        id: 13,
        code: "HDB",
        name: "Ngân hàng TMCP Phát triển TP.HCM",
        shortName: "HDBANK",
        logo: "",
        bin: "970437",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 14,
        code: "SHB",
        name: "Ngân hàng TMCP Sài Gòn - Hà Nội",
        shortName: "SHB",
        logo: "",
        bin: "970443",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 15,
        code: "EIB",
        name: "Ngân hàng TMCP Xuất Nhập khẩu Việt Nam",
        shortName: "EXIMBANK",
        logo: "",
        bin: "970431",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 16,
        code: "CTG",
        name: "Ngân hàng TMCP Công thương Việt Nam",
        shortName: "VIETINBANK",
        logo: "",
        bin: "970415",
        transferSupported: 1,
        lookupSupported: 1,
      },
      {
        id: 17,
        code: "AGB",
        name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam",
        shortName: "AGRIBANK",
        logo: "",
        bin: "970405",
        transferSupported: 1,
        lookupSupported: 1,
      },
    ];
  }

  // Lấy danh sách ngân hàng (với cache)
  async getBanks(): Promise<Bank[]> {
    if (this.banksCache) {
      return this.banksCache;
    }

    // Thử VietQR API v2 trước, nếu lỗi thì dùng fallback
    let banks = await this.getBanksFromVietQR();

    if (banks.length === 0) {
      banks = this.getFallbackBanks();
    }

    // Cache kết quả
    this.banksCache = banks;
    return banks;
  }

  // Tìm kiếm ngân hàng theo từ khóa
  async searchBanks(keyword: string): Promise<Bank[]> {
    const banks = await this.getBanks();
    if (!keyword.trim()) return banks;

    const searchTerm = keyword.toLowerCase();
    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(searchTerm) ||
        bank.shortName.toLowerCase().includes(searchTerm) ||
        bank.code.toLowerCase().includes(searchTerm)
    );
  }

  // Tìm ngân hàng theo mã
  async findBankByCode(code: string): Promise<Bank | null> {
    const banks = await this.getBanks();
    return banks.find((bank) => bank.code === code) || null;
  }

  // Tìm ngân hàng theo tên
  async findBankByName(name: string): Promise<Bank | null> {
    const banks = await this.getBanks();
    return (
      banks.find(
        (bank) =>
          bank.name.toLowerCase().includes(name.toLowerCase()) ||
          bank.shortName.toLowerCase().includes(name.toLowerCase())
      ) || null
    );
  }
}

export const bankService = new BankService();
