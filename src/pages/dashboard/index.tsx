import { type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import BotInput from "../../components/BotInput";

const Dashboard: NextPage = () => {
  const { data, status } = useSession();
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  console.log(data, status);
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  if (status === "unauthenticated") {
    return (
      <div>
        You are not logged in. Please{" "}
        <Link href="/api/auth/dashboard">sign in</Link>
      </div>
    );
  }
  return (
    <main className="min-h-screen">
      <nav className="flex w-full items-center justify-center p-4">
        <div className="flex w-full max-w-2xl justify-between gap-4">
          <Link className="p-3" href="/">
            Home
          </Link>
          <div>
            {isNavbarOpen ? (
              <div>
                <button className="p-3">Settings</button>
                <button
                  onClick={() =>
                    signOut({ callbackUrl: "http://localhost:3000/" })
                  }
                  className="mr-3 p-3"
                >
                  logout
                </button>
                <button
                  className="rounded-[4px] border-2 border-black py-3 px-6"
                  onClick={() => {
                    setIsNavbarOpen((e) => !e);
                  }}
                >
                  {data?.user?.name}
                </button>
              </div>
            ) : (
              <button
                className="rounded-[4px] border-2 border-black py-3 px-6"
                onClick={() => {
                  setIsNavbarOpen((e) => !e);
                }}
              >
                {data?.user?.name}
              </button>
            )}
          </div>
        </div>
      </nav>
      <div className="flex flex-col items-center justify-center">
        <h1 className="pt-12 text-5xl">Welcome to study room</h1>
        <section className="flex w-full max-w-2xl flex-col items-center gap-12 pt-12 pl-3">
          <BotInput />
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
