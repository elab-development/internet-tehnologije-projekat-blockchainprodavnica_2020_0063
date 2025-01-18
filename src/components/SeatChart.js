import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Seat from "./Seat";
import TicketPopup from "./TicketPopup";
import close from "../assets/close.svg";

const SeatChart = ({ occasion, tokenMaster, provider, setToggle }) => {
  const [seatsTaken, setSeatsTaken] = useState(false);
  const [hasSold, setHasSold] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);

  // Učitavanje zauzetih sedišta
  const getSeatsTaken = async () => {
    const seatsTaken = await tokenMaster.getSeatsTaken(occasion.id);
    setSeatsTaken(seatsTaken);
  };

  useEffect(() => {
    getSeatsTaken();
  }, [hasSold]);

  // Formatiranje UNIX timestampa u dd/mm/yyyy
  const formatDate = (timestamp) => {
    if (!timestamp) return "Nepoznat datum";
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return "Nepoznat datum";

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Kupovina karte za konkretno sedište
  const buyHandler = async (_seat) => {
    try {
      setHasSold(false);

      const signer = await provider.getSigner();
      const transaction = await tokenMaster
        .connect(signer)
        .mint(occasion.id, _seat, { value: occasion.cost });
      await transaction.wait();

      // Kreiramo tekstualne podatke "ko čovek"
      const eventDate = formatDate(occasion.eventTimestamp);
      const owner = await signer.getAddress();

      const ticketString = `
*** Ulaznica za dogadjaj ***
Naziv:     ${occasion.name}
Datum:     ${eventDate}
Vreme:     ${occasion.time}
Lokacija:  ${occasion.location}
Sedište:   ${_seat}
Vlasnik:   ${owner}
---------------------------
`.trim();

      setTicketDetails({
        occasion: {
          ...occasion,
          date: eventDate, // Ako želiš da gde god inače prikazuješ, bude formatiran
        },
        seat: _seat,
        ticketString, // Sve "ljudski" spremljeno
      });

      setShowPopup(true);
      setHasSold(true);
    } catch (error) {
      console.error("Greška pri kupovini karte:", error);
    }
  };

  return (
    <div className="occasion">
      <div className="occasion__seating">
        <h1>{occasion.name} Mapa sedenja</h1>

        <button onClick={() => setToggle(false)} className="occasion__close">
          <img src={close} alt="Close" />
        </button>

        <div className="occasion__stage">
          <strong>BINA</strong>
        </div>

        {/* Prvi blok sedišta (25 komada) */}
        {seatsTaken &&
          Array(25)
            .fill(1)
            .map((e, i) => (
              <Seat
                i={i}
                step={1}
                columnStart={0}
                maxColumns={5}
                rowStart={2}
                maxRows={5}
                seatsTaken={seatsTaken}
                buyHandler={buyHandler}
                key={i}
              />
            ))}

        <div className="occasion__spacer--1 ">
          <strong>Prolaz</strong>
        </div>

        {/* Srednji blok sedišta */}
        {seatsTaken &&
          Array(Number(occasion.maxTickets) - 50)
            .fill(1)
            .map((e, i) => (
              <Seat
                i={i}
                step={26}
                columnStart={6}
                maxColumns={15}
                rowStart={2}
                maxRows={15}
                seatsTaken={seatsTaken}
                buyHandler={buyHandler}
                key={i}
              />
            ))}

        <div className="occasion__spacer--2">
          <strong>Prolaz</strong>
        </div>

        {/* Treći blok sedišta (opet 25 komada) */}
        {seatsTaken &&
          Array(25)
            .fill(1)
            .map((e, i) => (
              <Seat
                i={i}
                step={Number(occasion.maxTickets) - 24}
                columnStart={22}
                maxColumns={5}
                rowStart={2}
                maxRows={5}
                seatsTaken={seatsTaken}
                buyHandler={buyHandler}
                key={i}
              />
            ))}
      </div>

      {/* Popup za prikaz kupljene karte i preuzimanje PDF-a */}
      {showPopup && ticketDetails && (
        <TicketPopup
          occasion={ticketDetails.occasion}
          seat={ticketDetails.seat}
          ticketString={ticketDetails.ticketString}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default SeatChart;
