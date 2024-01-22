// api.js
import axios from 'axios';

const BASE_URL = 'https://api.coinranking.com/v2';

const COINRANKING_API_KEY = 'coinranking7a612f625d5d24898652dcfaa7d82bead0eb7b3893c724d0'; // Replace with your actual API key

export const getCryptoList = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/coins`, {
      headers: {
        'x-access-token': COINRANKING_API_KEY,
      },
    });

    const cryptoList = response.data.data.coins.map((crypto) => ({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      usdPrice: crypto.price,
    }));

    return cryptoList;
  } catch (error) {
    console.error('Error fetching cryptocurrency list:', error);
    return null;
  }
};
