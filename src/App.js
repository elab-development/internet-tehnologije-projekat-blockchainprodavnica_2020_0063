import { useEffect, useState } from 'react';
import { ethers } from 'ethers';


import Navigation from './components/Navigation';
import Card from './components/Card';
import SeatChart from './components/SeatChart';


import TokenMaster from './abis/TokenMaster.json';


import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [tokenMaster, setTokenMaster] = useState(null);
  const [originalOccasions, setOriginalOccasions] = useState([]); 
  const [occasions, setOccasions] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [occasion, setOccasion] = useState({});

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

    //Pocetna lista dogadjaja
    setOriginalOccasions(occasions);
    setOccasions(occasions);

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  const handleCategoryClick = (category) => {
    switch (category) {
      case 'koncerti':
        setOccasions(originalOccasions.filter((_, index) => [0, 3, 4].includes(index)));
        break;
      case 'pozoriste':
        setOccasions(originalOccasions.filter((_, index) => [1].includes(index)));
        break;
      case 'sportskiDogađaji':
        setOccasions(originalOccasions.filter((_, index) => [2].includes(index)));
        break;
      default:
        
        setOccasions(originalOccasions);
        break;
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} handleCategoryClick={handleCategoryClick}></Navigation>
        <h2 className='header__title'><strong>Karte</strong> za sve</h2>
      </header>
      <div className='cards'>
        {occasions.map((occasion, index) => (
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
      </div>
      {toggle && (
        <SeatChart
          occasion={occasion}
          tokenMaster={tokenMaster}
          provider={provider}
          setToggle={setToggle}
        />
      )}
    </div>
  );
}

export default App;
