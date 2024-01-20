import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Navigation from './components/Navigation';
import Card from './components/Card';
import SeatChart from './components/SeatChart';
import TokenMaster from './abis/TokenMaster.json';
import config from './config.json';
import { getCryptoList } from './Api.js';
import useSearch from './useSearch';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [tokenMaster, setTokenMaster] = useState(null);
  const [originalOccasions, setOriginalOccasions] = useState([]); 
  const [toggle, setToggle] = useState(false);
  const [occasion, setOccasion] = useState({});
  const [cryptoData, setCryptoData] = useState(null);
  const { searchTerm, handleSearchChange, filteredOccasions } = useSearch(originalOccasions);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();
    const address = config[network.chainId].TokenMaster.address;
    const tokenMaster = new ethers.Contract(address, TokenMaster, provider);
    setTokenMaster(tokenMaster);

    const totalOccasions = await tokenMaster.totalOccasions();
    const occasions = [];

    for (let index = 1; index <= totalOccasions; index++) {
      const occasion = await tokenMaster.getOccasion(index);
      occasions.push(occasion);
    }

    setOriginalOccasions(occasions);
  };

  const handleCategoryClick = (category) => {
    switch (category) {
      // ... existing code ...
    }
  };

  const loadCryptoData = async () => {
    const data = await getCryptoList();
    setCryptoData(data);
  };

  useEffect(() => {
    loadBlockchainData();
    loadCryptoData();
  }, []);

  return (
    <div>
      <header>
        <Navigation
          account={account}
          setAccount={setAccount}
          handleCategoryClick={handleCategoryClick}
          handleSearchChange={handleSearchChange}
        />
        <h2 className='header__title'><strong>Karte</strong> za sve</h2>
      </header>
      <div className='cards-container'>
        <div className='cards'>
          {filteredOccasions.map((occasion, index) => (
            <Card
              occasion={occasion}
              id={index + 1}
              tokenMaster={tokenMaster}
              provider={provider}
              account={account}
              toggle={toggle}
              setToggle={setToggle}
              setOccasion={setOccasion}
              key={index}
            />
          ))}
          {toggle && (
            <SeatChart
              occasion={occasion}
              tokenMaster={tokenMaster}
              provider={provider}
              setToggle={setToggle}
            />
          )}
        </div>
        {cryptoData && (
          <div className='crypto-list'>
            <h2>Kurs kriptovaluta</h2>
            {cryptoData.map((crypto) => (
              <div key={crypto.id} className='crypto-item'>
                <p>{crypto.name}</p>
                <p>{crypto.current_price} USD</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
