import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const RefundModal = ({ tokenMaster, provider, userAddress, onClose }) => {
  const [purchases, setPurchases] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Funkcija za formatiranje datuma u dd.mm.yyyy
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Definiši fetchPurchases koristeći useCallback
  const fetchPurchases = useCallback(async () => {
    try {
      const eventIds = await tokenMaster.getUserPurchases(userAddress);
      const groupedPurchases = {};

      for (let id of eventIds) {
        const occasion = await tokenMaster.getOccasion(id);
        const seatsTaken = await tokenMaster.getSeatsTaken(id);
        const occasionId = id.toNumber();

        if (!groupedPurchases[occasionId]) {
          groupedPurchases[occasionId] = {
            id: occasionId,
            name: occasion.name,
            cost: ethers.utils.formatUnits(occasion.cost, "ether"),
            eventTimestamp: occasion.eventTimestamp.toNumber(),
            time: occasion.time,
            location: occasion.location,
            seats: new Set(),
          };
        }

        seatsTaken.forEach((seat) => {
          groupedPurchases[occasionId].seats.add(seat.toNumber());
        });
      }

      const result = Object.values(groupedPurchases)
        .map((event) => ({
          ...event,
          seats: Array.from(event.seats),
        }))
        .filter((event) => event.seats.length > 0);

      setPurchases(result);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  }, [tokenMaster, userAddress]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const calculateRefund = (eventTimestamp) => {
    const currentDate = new Date();
    const eventDate = new Date(eventTimestamp * 1000);
    const differenceInDays = Math.ceil(
      (eventDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    if (differenceInDays > 30) {
      return {
        message:
          "Refund uspešan! Povraćaj 100% iznosa jer ima više od 30 dana do početka događaja.",
        success: true,
      };
    } else if (differenceInDays > 15) {
      return {
        message:
          "Refund uspešan! Povraćaj 50% iznosa jer ima između 15 i 30 dana do početka događaja.",
        success: true,
      };
    } else if (differenceInDays > 0) {
      return {
        message: "Refundacija nije moguća jer je manje od 15 dana do događaja.",
        success: false,
      };
    } else {
      return {
        message: "Događaj je prošao. Refundacija nije moguća.",
        success: false,
      };
    }
  };

  const handleRefund = async () => {
    if (!selectedEvent || selectedSeat === null) {
      setPopupMessage("Odaberite događaj i konkretno sedište za refundaciju.");
      setShowPopup(true);
      return;
    }

    const refundInfo = calculateRefund(selectedEvent.eventTimestamp);

    if (!refundInfo.success) {
      setPopupMessage(refundInfo.message);
      setShowPopup(true);
      return;
    }

    try {
      const signer = provider.getSigner();
      const transaction = await tokenMaster
        .connect(signer)
        .refund(selectedEvent.id, selectedSeat);
      await transaction.wait();

      setPopupMessage(refundInfo.message);
      setShowPopup(true);

      // Ažuriraj stanje događaja i sedišta nakon uspešnog refunda
      setPurchases((prevPurchases) =>
        prevPurchases
          .map((event) => {
            if (event.id === selectedEvent.id) {
              const updatedSeats = event.seats.filter(
                (seat) => seat !== selectedSeat
              );
              if (updatedSeats.length > 0) {
                return { ...event, seats: updatedSeats };
              }
              return null;
            }
            return event;
          })
          .filter((event) => event !== null)
      );

      setSelectedEvent(null);
      setSelectedSeat(null);
    } catch (error) {
      console.error("Refund failed:", error);
      setPopupMessage("Refundacija nije uspela.");
      setShowPopup(true);
    }
  };

  return (
    <div className="refund-modal">
      <h3>Vaše kupovine</h3>
      {purchases.length === 0 ? (
        <p>Nema dostupnih kupovina za refundaciju.</p>
      ) : (
        <ul>
          {purchases.map((purchase) => (
            <li key={purchase.id}>
              <strong>
                {purchase.name} - {purchase.time} -{" "}
                {formatDate(purchase.eventTimestamp)}
              </strong>
              <p>Lokacija: {purchase.location}</p>
              <div className="refund-modal__seats">
                <h4>Dostupna sedišta:</h4>
                {purchase.seats.map((seat) => (
                  <button
                    key={seat}
                    className={`refund-modal__seat-btn ${
                      selectedEvent?.id === purchase.id && selectedSeat === seat
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedEvent(purchase);
                      setSelectedSeat(seat);
                    }}
                  >
                    Sedište {seat}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedEvent && selectedSeat !== null && (
        <div className="refund-modal__details">
          <h4>Izabrani događaj:</h4>
          <p>
            <strong>{selectedEvent.name}</strong>
          </p>
          <p>
            Cena: <strong>{selectedEvent.cost} ETH</strong>
          </p>
          <p>
            Datum: <strong>{formatDate(selectedEvent.eventTimestamp)}</strong>
          </p>
          <p>
            Sedište: <strong>{selectedSeat}</strong>
          </p>
          <button className="refund-modal__refund-btn" onClick={handleRefund}>
            Refund
          </button>
        </div>
      )}
      <button className="refund-modal__close-btn" onClick={onClose}>
        Zatvori
      </button>

      {/* Modal Popup */}
      {showPopup && (
        <div className="modal-popup">
          <div className="modal-popup__content">
            <p>{popupMessage}</p>
            <button
              className="modal-popup__close-btn"
              onClick={() => setShowPopup(false)}
            >
              Zatvori
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundModal;
