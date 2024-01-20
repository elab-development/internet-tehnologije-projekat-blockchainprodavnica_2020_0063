// api.js
import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export const getCryptoList = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10, // Broj kriptovaluta koje uzimamo
        page: 1,
        sparkline: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cryptocurrency list:', error);
    return null;
  }
};
