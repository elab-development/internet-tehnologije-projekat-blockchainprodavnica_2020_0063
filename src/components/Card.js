import { ethers } from "ethers";

const Card = ({ occasion, toggle, setToggle, setOccasion }) => {
  const togglePop = () => {
    setOccasion(occasion);
    toggle ? setToggle(false) : setToggle(true);
  };

  // Provera i formatiranje cene
  let formattedCost;
  try {
    formattedCost = ethers.utils.formatUnits(occasion.cost.toString(), "ether");
  } catch (error) {
    console.error("Error formatting cost:", error);
    formattedCost = "N/A"; // Ako se desi greška, postavi cenu na "N/A"
  }

  // Funkcija za formatiranje datuma u dd/mm/yyyy
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mesecevi su 0-indeksirani
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="card">
      <div className="card__info">
        <p className="card__date">
          <strong>{formatDate(occasion.eventTimestamp)}</strong>
          <br />
          {occasion.time}
        </p>

        <h3 className="card__name">{occasion.name}</h3>

        <p className="card__location">
          <small>{occasion.location}</small>
        </p>

        <p className="card__cost">
          <strong>{formattedCost}</strong> ETH
        </p>

        {occasion.tickets.toString() === "0" ? (
          <button type="button" className="card__button--out" disabled>
            Rasprodato
          </button>
        ) : (
          <button
            type="button"
            className="card__button"
            onClick={() => togglePop()}
          >
            Kupite kartu
          </button>
        )}
      </div>

      <hr />
    </div>
  );
};

export default Card;
