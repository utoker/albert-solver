import axios from "axios";
import React from "react";

const BotInput = () => {
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/generate", { input });
      setResult(res.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="relative w-full">
        <textarea
          placeholder="Hi there! I'm here to help you with your homework. What do you need help with?"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          className="w-full resize-none rounded-md border-2 border-black p-5 shadow-nb-1 focus:outline-none "
          name=""
          id=""
          rows={input.length < 180 ? 6 : 6 + (input.length - 120) / 120}
        />
        {/* character limit at bot left */}
        {input.length > 700 && (
          <div
            className={`absolute bottom-5 left-5  ${
              input.length > 1000
                ? "text-lg text-red-500"
                : " text-sm text-gray-500"
            }`}
          >
            {input.length}/{1000}
          </div>
        )}

        <div className="absolute bottom-5 right-5 text-sm text-gray-500">
          <button
            type="button"
            onClick={submit}
            className="mt-4 w-full rounded-md border-2 border-black bg-white px-6 py-2 text-black shadow-nb-1"
          >
            {loading ? "Loading" : "Generate"}
          </button>
        </div>
      </div>
      {/* output data  */}
      {result && (
        <div className="mt-4 w-full rounded-md border-2 border-black bg-white px-6 py-2 text-black shadow-nb-1">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default BotInput;
