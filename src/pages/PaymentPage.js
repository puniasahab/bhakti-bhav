
import React, { useEffect, useRef, useState } from "react";
import { usePayment } from "../contexts/PaymentContext";
import { load } from "@cashfreepayments/cashfree-js";  // ✅ Proper import

export default function PaymentDrop() {
  const { paymentResponse, selectedPlanData, userProfile } = usePayment();
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  console.log("Payment", paymentResponse.data.cashfree.payment_session_id);
  let cashfree;
  let initializeSDK = async () => {
    cashfree = await load({
      mode: 'sandbox',
    })
  }
  initializeSDK();

  const getSessionId = async () => {
    if (paymentResponse.data) {
      setOrderId(paymentResponse.data.cashfree.order_id);
      return paymentResponse.data.cashfree.payment_session_id;
    }
  }



  const handleClick = async () => {
    try {
      const sessionId = getSessionId();
      console.log("SessionId", sessionId);
      let checkoutOptions = {
        paymentSessionId: paymentResponse.data.cashfree.payment_session_id,
        redirectTarget: "_modal", // this is open popup on out website
      }

      cashfree.checkout(checkoutOptions).then((res) => {
        console.log("Payment Initiated");
      })
    }
    catch (error) {
      console.log(error);
    }
  }

  // useEffect(() => {
  //   let cashfree;
  //   let initializeSDK = async () => {
  //     cashfree = await load({
  //       mode: 'sandbox',
  //     })
  //   }
  //   initializeSDK();
  //   console.log("paymentResponse", paymentResponse?.data?.cashfree?.payment_session_id);


  // }, [])
  return (
    <>
      <div className="text-black font-eng">Payment Done Page</div>
      <button onClick={handleClick} className="font-eng text-black">Click Me</button>
    </>
  )
}
