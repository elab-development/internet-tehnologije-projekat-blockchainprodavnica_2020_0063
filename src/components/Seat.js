// Seat.js

import { useEffect, useState } from 'react';

const Seat = ({ i, step, columnStart, maxColumns, rowStart, maxRows, seatsTaken, buyHandler }) => {
  const isSeatTaken = seatsTaken.find(seat => Number(seat) === i + step);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    setIsDisabled(isSeatTaken);
  }, [isSeatTaken]);

  const handleSeatClick = () => {
    if (!isDisabled) {
      buyHandler(i + step);
    }
  };

  return (
    <div
      onClick={handleSeatClick}
      className={`occasion__seats ${isSeatTaken ? 'occasion__seats--taken' : ''}`}
      style={{
        gridColumn: `${((i % maxColumns) + 1) + columnStart}`,
        gridRow: `${Math.ceil(((i + 1) / maxRows)) + rowStart}`
      }}
    >
      {i + step}
    </div>
  );
};

export default Seat;
