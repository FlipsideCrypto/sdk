import clsx from "clsx";
import React from "react";

interface ButtonProps {
  color: string;
  size: string;
  innerStyle?: Record<string, string | number>;
  children: React.ReactNode | React.ReactNode[];
  external?: boolean;
}

function getBg(color: string) {
  let bgColor = "bg-[#7C7C7C]";
  let bgColorHover = "hover:bg-[#BCBCca]";
  if (color == "blue") {
    bgColor = "bg-[#2A3492]";
    bgColorHover = "hover:bg-[#2A34ca]";
  } else if (color === "green") {
    bgColor = "bg-[#4FAF44]";
    bgColorHover = "hover:bg-[#58cb49]";
  } else if (color === "red") {
    bgColor = "bg-[#EF4423]";
    bgColorHover = "hover:bg-[#fc320b]";
  } else if (color === "yellow") {
    bgColor = "bg-[#F6EB14]";
    bgColorHover = "hover:bg-[#efe427]";
  } else if (color === "orange") {
    bgColor = "bg-[#FF9526]";
    bgColorHover = "hover:bg-[#ff8503]";
  } else if (color === "gray") {
    bgColor = "bg-[#B3B4B6]";
    bgColorHover = "hover:bg-[#B3B4ca]";
  } else if (color === "black") {
    bgColor = "bg-[#2C2C2E]";
    bgColorHover = "hover:bg-[#111112]";
  }
  return { bgColor, bgColorHover };
}

const baseClass =
  "box-border inline-block cursor-pointer px-4 py-2 text-center font-retro text-lg uppercase text-white";

const borderStyle = {
  borderBottom: "6px inset rgba(0,0,0,.5)",
  borderLeft: "6px inset rgba(0,0,0,.5)",
  borderRight: "6px inset rgba(255,255,255,.5)",
  borderTop: "6px inset rgba(255,255,255,.5)",
};

export function RetroButton({
  children,
  className,
  color,
  size,
  innerStyle,
  ...buttonProps
}: ButtonProps & JSX.IntrinsicElements["button"]) {
  const { bgColor, bgColorHover } = getBg(color);

  if (size === "xs") {
    innerStyle = {
      fontSize: "13px",
      padding: "0px 5px",
      height: "35px",
      borderWidth: "4px",
      verticalAlign: "middle",
      ...innerStyle,
    };
  } else if (size === "sm") {
    innerStyle = {
      fontSize: "13px",
      padding: "2px 7px",
      ...innerStyle,
    };
  } else if (size === "md") {
    innerStyle = {
      fontSize: "15px",
      padding: "3px 11px",
      ...innerStyle,
    };
  }
  return (
    <button
      className={clsx(baseClass, bgColor, bgColorHover)}
      style={{ ...borderStyle, ...innerStyle }}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
