export interface Province {
  code: string;
  name: string;
}

const API_HOST = "https://vn-public-apis.fpo.vn";

export const fetchProvinces = async (): Promise<Province[]> => {
  try {
    const response = await fetch(`${API_HOST}/provinces/getAll?limit=-1`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (
      result &&
      result.exitcode === 1 &&
      result.data &&
      Array.isArray(result.data.data)
    ) {
      return result.data.data;
    } else {
      console.error("Invalid province data format:", result);
      return [];
    }
  } catch (error) {
    console.error("Error loading provinces:", error);
    return [];
  }
};
