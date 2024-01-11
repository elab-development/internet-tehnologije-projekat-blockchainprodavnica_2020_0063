
import { ethers } from 'ethers'


const Navigation = ({ account, setAccount, handleCategoryClick }) => {

  const navigateToMainPage = () => {
    window.location.href = '/';
  }
  const connectHandler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)
  }

  return (
    <nav>
      <div className='nav__brand' >
        <h1 onClick={navigateToMainPage}>tokenmaster</h1>

        <input className='nav__search' type="text" placeholder='Karte za svakoga' />

        <ul className='nav__links'>
          <li><a href="#" onClick={() => handleCategoryClick('koncerti')}>Koncerti</a></li>
          <li><a href="#" onClick={() => handleCategoryClick('sportskiDogađaji')}>Sportski događaji</a></li>
          <li><a href="#" onClick={() => handleCategoryClick('pozoriste')}>Pozoriste</a></li>
        </ul>
      </div>

      {account ? (
        <button
          type="button"
          className='nav__connect'
        >
          {account.slice(0, 6) + '...' + account.slice(38, 42)}
        </button>
      ) : (
        <button
          type="button"
          className='nav__connect'
          onClick={connectHandler}
        >
          Povezi wallet
        </button>
      )}
    </nav>
  );
}

export default Navigation;