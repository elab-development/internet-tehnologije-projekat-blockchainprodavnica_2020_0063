import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

const TicketPopup = ({ occasion, seat, qrData, onClose }) => {
  const qrRef = useRef();

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Dodavanje detalja na PDF
    doc.text("Vaša Ulaznica", 10, 10);
    doc.text(`Dogadjaj: ${occasion.name}`, 10, 20);
    doc.text(`Datum: ${occasion.date} u ${occasion.time}`, 10, 30);
    doc.text(`Lokacija: ${occasion.location}`, 10, 40);
    doc.text(`Broj sedišta: ${seat}`, 10, 50);

    // Preuzimanje QR koda kao sliku iz ref-a
    const qrCanvas = qrRef.current.querySelector("canvas");
    const qrImage = qrCanvas.toDataURL("image/png");

    // Dodavanje QR koda na PDF
    doc.addImage(qrImage, "PNG", 10, 60, 50, 50);

    // Preuzimanje PDF-a
    doc.save(`Ticket_${occasion.name}_Seat_${seat}.pdf`);
  };

  return (
    <div className="popup">
      <div className="popup__content">
        <h2>Vaša Ulaznica</h2>
        <p>
          <strong>Događaj:</strong> {occasion.name}
        </p>
        <p>
          <strong>Datum:</strong> {occasion.date} u {occasion.time}
        </p>
        <p>
          <strong>Lokacija:</strong> {occasion.location}
        </p>
        <p>
          <strong>Broj sedišta:</strong> {seat}
        </p>
        <div className="popup__qr" ref={qrRef}>
          <QRCodeCanvas value={qrData} size={200} />
        </div>
        <button className="popup__download" onClick={downloadPDF}>
          Preuzmi kao PDF
        </button>
        <button className="popup__close" onClick={onClose}>
          Zatvori
        </button>
      </div>
    </div>
  );
};

export default TicketPopup;
