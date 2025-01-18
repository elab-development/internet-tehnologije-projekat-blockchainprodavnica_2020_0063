import { ethers } from "ethers";

const Card = ({ occasion, toggle, setToggle, setOccasion }) => {
  if (!occasion) {
    console.error("Occasion is undefined or null.");
    return <div>Error: Invalid occasion data</div>;
  }

  const togglePop = () => {
    setOccasion(occasion);
    toggle ? setToggle(false) : setToggle(true);
  };

  // Provera i formatiranje cene
  let formattedCost;
  try {
    formattedCost = occasion?.cost
      ? ethers.utils.formatUnits(occasion.cost.toString(), "ether")
      : "N/A";
  } catch (error) {
    console.error("Error formatting cost:", error);
    formattedCost = "N/A"; // Ako se desi greška, postavi cenu na "N/A"
  }

  // Funkcija za formatiranje datuma u dd/mm/yyyy
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown Date";
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
          <strong>
            {occasion.eventTimestamp
              ? formatDate(occasion.eventTimestamp)
              : "Unknown Date"}
          </strong>
          <br />
          {occasion.time || "Unknown Time"}
        </p>

        <h3 className="card__name">{occasion.name || "Unknown Event"}</h3>

        <p className="card__location">
          <small>{occasion.location || "Unknown Location"}</small>
        </p>

        <p className="card__cost">
          <strong>{formattedCost}</strong> ETH
        </p>

        {occasion.maxTickets - occasion.ticketsSold === 0 ? (
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
