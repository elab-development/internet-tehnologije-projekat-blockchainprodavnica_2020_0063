import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import { useRef } from "react";

const TicketPopup = ({ occasion, seat, ticketString, onClose }) => {
  // Ref za QR (da bismo dohvatili <canvas> i pretvorili u sliku)
  const qrRef = useRef(null);

  // Klik na "Preuzmi PDF"
  const handleDownloadPDF = () => {
    if (!ticketString) return;

    const doc = new jsPDF("p", "pt", "a4");
    // "pt" -> points, "a4" -> 595x842pt otprilike

    const fileName = `Ticket_${occasion.name}_Seat_${seat}.pdf`;

    // Dohvatimo <canvas> iz <div ref={qrRef}>
    const qrCanvas = qrRef.current?.querySelector("canvas");
    let qrDataUrl = "";
    if (qrCanvas) {
      qrDataUrl = qrCanvas.toDataURL("image/png");
    }

    // Napišemo nešto na PDF
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(18);
    doc.text(`Ulaznica za dogadjaj: ${occasion.name}`, 40, 60);

    doc.setFontSize(14);
    doc.text(`Sedište: ${seat}`, 40, 90);
    doc.text(`Datum: ${occasion.date || "Nepoznat datum"}`, 40, 110);
    doc.text(`Lokacija: ${occasion.location || "Nepoznata"}`, 40, 130);

    // Možemo ubaciti i ceo ticketString
    doc.text(ticketString, 40, 160, { maxWidth: 500 });

    // Sada QR kod "niže" (npr. Y=420 da bude ispod teksta)
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", 40, 420, 150, 150);
    }

    doc.save(fileName);
  };

  return (
    <div className="ticket-popup">
      <div className="ticket-popup__content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>{occasion.name}</h2>
        <p>
          <strong>Sedište:</strong> {seat}
        </p>
        {/* Ovde možemo prikazati sav tekstualni opis */}
        <pre>{ticketString}</pre>

        {/* QR kod, niže u kodu -> unutar diva s ref */}
        <div className="ticket-popup__qr" ref={qrRef}>
          <QRCodeCanvas value={ticketString} size={200} />
        </div>

        <button onClick={handleDownloadPDF}>Preuzmi kartu (PDF)</button>
      </div>
    </div>
  );
};

export default TicketPopup;
