import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navigation from "./components/Navigation";
import Card from "./components/Card";
import SeatChart from "./components/SeatChart";
import RefundModal from "./components/RefundModal"; // Import RefundModal
import TokenMaster from "./abis/TokenMaster.json";
import config from "./config.json";
import { getCryptoList } from "./Api.js";
import useSearch from "./useSearch";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [tokenMaster, setTokenMaster] = useState(null);
  const [originalOccasions, setOriginalOccasions] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [occasion, setOccasion] = useState({});
  const [cryptoData, setCryptoData] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const { searchTerm, handleSearchChange, filteredOccasions } =
    useSearch(originalOccasions);
  const [currentCategory, setCurrentCategory] = useState(null);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();
    const address = config[network.chainId].TokenMaster.address;
    console.log(address);
    const tokenMaster = new ethers.Contract(address, TokenMaster, provider);
    setTokenMaster(tokenMaster);

    const totalOccasions = await tokenMaster.totalOccasions();
    const occasions = [];

    for (let index = 1; index <= totalOccasions; index++) {
      const occasion = await tokenMaster.getOccasion(index);
      occasions.push({
        id: index,
        ...occasion,
      });
    }

    setOriginalOccasions(occasions);
    setOccasions(occasions);

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  const filterOccasions = () => {
    let filteredData = occasions;

    if (searchTerm) {
      filteredData = filteredData.filter((occasion) =>
        occasion.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (currentCategory) {
      switch (currentCategory) {
        case "koncerti":
          filteredData = filteredData.filter((_, index) =>
            [0, 2, 3, 4, 5].includes(index)
          );
          break;
        case "pozoriste":
          filteredData = filteredData.filter((_, index) =>
            [1, 8].includes(index)
          );
          break;
        case "sportskiDogađaji":
          filteredData = filteredData.filter((_, index) =>
            [6, 7].includes(index)
          );
          break;
        default:
          break;
      }
    }

    return filteredData;
  };

  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
  };

  const loadCryptoData = async () => {
    const data = await getCryptoList();
    setCryptoData(data);
  };

  useEffect(() => {
    loadCryptoData();
    loadBlockchainData();
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
        <h2 className="header__title">
          <strong>Karte</strong> za sve
        </h2>
      </header>
      <div className="cards-container">
        <div className="cards">
          {filterOccasions().map((occasion, index) => (
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
        <button
          className="refund-button"
          onClick={() => setShowRefundModal(true)}
        >
          Vaše ulaznice
        </button>
        {showRefundModal && (
          <RefundModal
            tokenMaster={tokenMaster}
            provider={provider}
            userAddress={account}
            onClose={() => setShowRefundModal(false)}
          />
        )}
        {cryptoData && (
          <div className="crypto-list">
            <h2>Kurs kriptovaluta</h2>
            {cryptoData.slice(0, 10).map((crypto) => (
              <div key={crypto.id} className="crypto-item">
                <p>{crypto.name}</p>
                <p>{crypto.usdPrice} USD</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
