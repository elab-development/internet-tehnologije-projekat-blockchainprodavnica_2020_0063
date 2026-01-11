import React, { useState, useEffect } from "react";

const RefundModal = ({ tokenMaster, account, onClose }) => {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const userPurchases = await tokenMaster.getUserPurchases(account);
        setPurchases(userPurchases.map((id) => id.toNumber())); // Pretvori BigNumber u broj
      } catch (error) {
        console.error("Error fetching purchases:", error);
      }
    };

    fetchPurchases();
  }, [tokenMaster, account]);

  const handleRefund = async (occasionId) => {
    try {
      const seat = prompt("Enter the seat number for refund:");
      const tx = await tokenMaster.refund(occasionId, parseInt(seat, 10));
      await tx.wait();
      alert("Refund successful!");
      onClose(); // Zatvori modal nakon refundiranja
    } catch (error) {
      console.error("Refund failed:", error);
    }
  };

  return (
    <div className="refund-modal">
      <button className="close-btn" onClick={onClose}>
        X
      </button>
      <h3>Your Purchases</h3>
      <ul>
        {purchases.length > 0 ? (
          purchases.map((id) => (
            <li key={id} onClick={() => handleRefund(id)}>
              Refund for Occasion ID: {id}
            </li>
          ))
        ) : (
          <p>No purchases found.</p>
        )}
      </ul>
    </div>
  );
};

const RefundButton = ({ tokenMaster, account }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="refund-button-container">
      <button onClick={() => setShowModal(true)}>Refund</button>
      {showModal && (
        <RefundModal
          tokenMaster={tokenMaster}
          account={account}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default RefundButton;
