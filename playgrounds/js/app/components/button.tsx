import { Link, LinkProps } from "@remix-run/react";
import clsx from "clsx";
import React from "react";

type Props = {
  cta: string;
};
export function Button({ cta }: Props) {
  return (
    <button
      type="submit"
      className="border-gray-700 border p-2 text-xs cursor-point rounded-sm"
    >
      {cta}
    </button>
  );
}

interface ButtonProps {
  innerStyle?: Record<string, string | number>;
  children: React.ReactNode | React.ReactNode[];
}

function getClassName(className?: string) {
  return clsx(
    "rounded-full before:rounded-full px-2 border-2 border-white/80 inline-flex text-center transition-all hover:-translate-y-1",
    className
  );
}

function ButtonInner({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: Record<string, string | number>;
}) {
  return (
    <div
      className="flex items-center justify-center space-x-2 px-5 py-2"
      style={style || {}}
    >
      {children}
    </div>
  );
}

function Button2({
  children,
  className,
  innerStyle,
  ...buttonProps
}: ButtonProps & JSX.IntrinsicElements["button"]) {
  return (
    <button className={getClassName(className)} {...buttonProps}>
      <ButtonInner style={innerStyle}>{children}</ButtonInner>
    </button>
  );
}

function ButtonLink({
  children,
  className,
  ...linkProps
}: ButtonProps & LinkProps) {
  return (
    <Link className={getClassName(className)} {...linkProps}>
      <ButtonInner>{children}</ButtonInner>
    </Link>
  );
}

function LinkButton({
  children,
  className,
  ...linkProps
}: ButtonProps & JSX.IntrinsicElements["a"]) {
  return (
    <a className={getClassName(className)} {...linkProps}>
      <ButtonInner>{children}</ButtonInner>
    </a>
  );
}

function GradientButton({
  children,
  ...linkProps
}: ButtonProps & JSX.IntrinsicElements["a"]) {
  return (
    <a
      className="text-center cursor-pointer transition-all hover:-translate-y-1 inline-block relative z-10 border-gradient before:rounded-full before:p-[2px]"
      {...linkProps}
    >
      <ButtonInner>{children}</ButtonInner>
    </a>
  );
}

export { Button2, ButtonLink, LinkButton, GradientButton };
