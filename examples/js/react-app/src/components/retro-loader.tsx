import { useEffect, useState } from "react";

function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function RetroLoader() {
  const [dots, setDots] = useState(".");
  const [barPercent, setBarPercent] = useState(10);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (dots.length === 1) {
        setDots("..");
      } else if (dots.length === 2) {
        setDots("...");
      } else if (dots.length === 3) {
        setDots("");
      } else {
        setDots(".");
      }
    }
    let id = setInterval(tick, 800);
    return () => clearInterval(id);
  }, [dots]);

  // Set up the interval #2
  useEffect(() => {
    function tick() {
      let next;
      if (barPercent < 80) {
        if (randomNumber(0, 3) >= 2) {
          next = randomNumber(10, 20) + barPercent;
        } else {
          next = randomNumber(5, 10) + barPercent;
        }
      } else {
        next = randomNumber(1, 5) + barPercent;
      }
      if (next > 98) {
        next = randomNumber(0, 1) + barPercent;
      }
      if (next > 100) {
        next = 99;
      }
      setBarPercent(next);
    }
    let id = setInterval(tick, 1800);
    return () => clearInterval(id);
  }, [barPercent]);

  return (
    <div className="flex w-[150px] flex-col">
      <div
        style={{
          border: "7px solid #000000e8",
          borderRadius: "7px",
          width: "150px",
          height: "30px",
        }}
      >
        <div
          style={{
            width: `${barPercent}%`,
            backgroundColor: "#000000e8",
            height: "100%",
          }}
        ></div>
      </div>
      <p
        className="font-retro"
        style={{
          color: "#000000e8",
          width: "100%",
          textAlign: "center",
          fontSize: "17px",
          margin: "0 0",
          padding: "0 0",
        }}
      >
        LOADING{dots}
      </p>
    </div>
  );
}

export default RetroLoader;
