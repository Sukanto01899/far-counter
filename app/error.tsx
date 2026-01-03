"use client";

import React from "react";

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="bg-purple-300 h-screen w-full flex justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-4">
        <p>{error.message}</p>
        <button onClick={reset} className="bg-purple-500 px-4 py-2 text-white">
          Retry
        </button>
      </div>
    </div>
  );
};

export default Error;
