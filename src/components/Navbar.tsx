import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

const Navbar = ({}) => {
  const { data, status } = useSession();
  // const { user } = data;
  console.log(data);
  return (
    <nav className="sticky top-0 z-50 flex w-full items-center justify-center bg-white p-4">
      <div className="flex w-full max-w-2xl gap-4 ">
        <Link className="p-3" href="/">
          Home
        </Link>
        <Link className="p-3" href="/pricing">
          Pricing
        </Link>
        <Link
          className="ml-auto rounded-[4px] border-2 border-black py-3 px-6 "
          href={status === "authenticated" ? "/dashboard" : "/api/auth/signin"}
        >
          {status === "authenticated" ? "Dashboard" : "Login"}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
