import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ChevronRight } from "lucide-react";

function Transactions() {
  const transactions = [
    {
      id: "UPI_12546325",
      validTill: "28-09-2025",
      plan: "Platinum",
      price: "₹499",
      color: "from-gray-300 to-gray-400 text-[#9A283D]",
    },
    {
      id: "UPI_12546325",
      validTill: "28-09-2025",
      plan: "Gold",
      price: "₹799",
      color: "from-yellow-300 to-yellow-500 text-[#9A283D]",
    },
    {
      id: "UPI_12546325",
      validTill: "28-09-2025",
      plan: "Platinum",
      price: "₹499",
      color: "from-gray-300 to-gray-400 text-[#9A283D]",
    },
    {
      id: "UPI_12546325",
      validTill: "28-09-2025",
      plan: "Gold",
      price: "₹799",
      color: "from-yellow-300 to-yellow-500 text-[#9A283D]",
    },
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 mt-4 font-eng">
        {/* Active Premium Plan */}
        <div className="bg-[#FDE68A] border rounded-lg p-4 shadow mb-4 flex justify-between items-center">
          <p className="text-[#9A283D] font-semibold">
            Your Premium plan is active
          </p>
          <ChevronRight className="text-[#9A283D]"/>
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          {transactions.map((txn, index) => (
            <div
              key={index}
              className="border border-[#9A283D] rounded-xl p-4 shadow bg-white flex justify-between items-center"
            >
              <div>
                <p className="text-[#9A283D] font-medium">
                  Txn Id : <span className="font-semibold">{txn.id}</span>
                </p>
                <p className="text-[#9A283D]">
                  Valid till:{" "}
                  <span className="font-semibold">{txn.validTill}</span>
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-lg bg-gradient-to-r ${txn.color} text-sm font-semibold`}
                >
                  {txn.plan}
                </span>
                <p className="mt-1 font-semibold theme_text">{txn.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </>
  );
}

export default Transactions;
