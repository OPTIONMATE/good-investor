"use client";
import { useState } from "react";
import BuyNowModal from "./BuyNowModal";
import { buyPrimaryButtonClass } from "./BuyFlowShell";

export default function BuyNowButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buyPrimaryButtonClass}
      >
        Buy Now
      </button>

      {open && <BuyNowModal onClose={() => setOpen(false)} />}
    </>
  );
}
