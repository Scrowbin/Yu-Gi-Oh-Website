import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="px-4 py-2 uppercase bg-[#001427] relative z-50">
      <div className="flex items-center ">
        {/* Hamburger (mobile only) */}
        <button
            className="relative flex h-6 w-6 flex-col justify-between md:hidden"
            onClick={() => setOpen(!open)}
            >
            <span
                className={`
                block h-1 w-6 bg-white rounded-full
                transition-all duration-300 ease-in-out
                ${open ? "translate-y-[10px] rotate-45" : ""}
                `}
            />
            <span
                className={`
                block h-1 w-6 bg-white rounded-full
                transition-all duration-300 ease-in-out
                ${open ? "opacity-0" : "opacity-100"}
                `}
            />
            <span
                className={`
                block h-1 w-6 bg-white rounded-full
                transition-all duration-300 ease-in-out
                ${open ? "-translate-y-[10px] -rotate-45" : ""}
                `}
            />
        </button>
        {/* Logo */}
        <Link to="/" className="text-xl font-bold mx-auto md:mx-4">
          <img src={logo} className="w-full max-w-[160px]" alt="Logo" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 text-xl text-[#dedede] text-base font-medium">
          <Link to="/decks">Decks</Link>
          <Link to="/about">About</Link>
        </div>

        
      </div>

      {/* Mobile menu */}
    <div
        className={`
            absolute left-0 top-full w-full
            md:hidden
            bg-[#001427]
            flex flex-col gap-4
            px-6 py-4
            uppercase text-xl text-[#dedede] font-normal
            transition-all duration-300 ease-in-out
            z-40
            ${
            open
                ? "translate-y-0 opacity-100"
                : "-translate-y-6 opacity-0 pointer-events-none"
            }
        `}
        >
        <Link to="/decks" onClick={() => setOpen(false)}>
            Decks
        </Link>
        <Link to="/about" onClick={() => setOpen(false)}>
            About
        </Link>
    </div>

    </nav>
  );
}
