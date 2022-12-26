import React from "react";

const Header = () => {
  return (
    <header className="flex flex-col items-center justify-center  border-black p-3">
      <h1 className="pr-2 text-5xl font-extrabold tracking-normal text-black sm:text-6xl md:text-8xl">
        Homework <span className="pl-4 text-[hsl(280,100%,70%)]">Bot</span>
      </h1>
    </header>
  );
};

export default Header;
