// src/components/RefundButton.js
import React from 'react';

const RefundButton = ({ provider, tokenMaster }) => {
  const handleRefund = async () => {
    const signer = provider.getSigner();
    try {
      const transaction = await tokenMaster.connect(signer).refund();
      await transaction.wait();
      alert('Refund successful');
    } catch (error) {
      console.error('Refund failed:', error);
      alert('Refund failed');
    }
  };

  return (
    <div className="refund-button-container">
      <button onClick={handleRefund}>Refund</button>
    </div>
  );
};

export default RefundButton;
