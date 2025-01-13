import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Seat from "./Seat";
import TicketPopup from "./TicketPopup";
import close from "../assets/close.svg";

const SeatChart = ({ occasion, tokenMaster, provider, setToggle }) => {
  const [seatsTaken, setSeatsTaken] = useState(false);
  const [hasSold, setHasSold] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);

  const getSeatsTaken = async () => {
    const seatsTaken = await tokenMaster.getSeatsTaken(occasion.id);
    setSeatsTaken(seatsTaken);
  };

  const buyHandler = async (_seat) => {
    setHasSold(false);
    const signer = await provider.getSigner();
    const transaction = await tokenMaster
      .connect(signer)
      .mint(occasion.id, _seat, { value: occasion.cost });
    await transaction.wait();

    const qrInfo = {
      occasionId: occasion.id,
      seat: _seat,
      name: occasion.name,
      date: occasion.date,
      time: occasion.time,
      location: occasion.location,
      owner: await signer.getAddress(),
    };

    setTicketDetails({
      occasion,
      seat: _seat,
      qrData: JSON.stringify(qrInfo),
    });

    setShowPopup(true);
    setHasSold(true);
  };

  const downloadTicket = () => {
    const element = document.createElement("a");
    const file = new Blob([ticketDetails.qrData], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Ticket_${ticketDetails.occasion.name}_Seat_${ticketDetails.seat}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    getSeatsTaken();
  }, [hasSold]);

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
        {qrData && (
          <div className="occasion__qr">
            <h2>Vaša ulaznica</h2>
            <QRCodeCanvas value={qrData} size={256} />
            <button className="download-button" onClick={downloadTicket}>
              Preuzmi ulaznicu
            </button>
          </div>
        )}
      </div>

      {showPopup && (
        <TicketPopup
          occasion={ticketDetails.occasion}
          seat={ticketDetails.seat}
          qrData={ticketDetails.qrData}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default SeatChart;
