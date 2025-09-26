import React from "react";
import { Link } from "react-router-dom";

function MenuCard({ title, icon, link }) {
  return (
    <Link
      to={link}
      className="flex flex-col items-center justify-center bg-[#fff0f2] rounded-xl p-4 hover:shadow-md cursor-pointer"
    >
      <span className="text-3xl">{icon}</span>
      <p className="mt-2 text-sm font-semibold">{title}</p>
    </Link>
  );
}

export default MenuCard;
