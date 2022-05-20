import { GradientButton } from "./button";
import { AiFillGithub } from "react-icons/ai";
import { GiPartyPopper } from "react-icons/gi";
import { FlipsideLogo } from "./logo";

export function AppFooter() {
  return (
    <>
      <footer className="www__footer space-y-20 md:space-y-0 py-12 sm:py-24 bg-black flex justify-between flex-col md:flex-row-reverse text-white md:items-center px-8 md:px-[165px]">
        <div className="flex flex-wrap sm:flex-nowrap sm:space-x-24">
          <nav className="p-5">
            {/* <h5 className="mb-4 text-2xl sm:text-base">Connect</h5> */}
            <ul className="space-y-2 text-xs uppercase font-simplon">
              <li className="flex items-center space-x-2">
                <GiPartyPopper className="text-2xl" />
                <a
                  href="https://forms.gle/F8LXyvw74SBgwDZB6"
                  target="_blank"
                  rel="noreferrer"
                >
                  Join the Alpha
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <AiFillGithub className="text-2xl" />
                <a
                  href="https://github.com/FlipsideCrypto/sdk/blob/main/js/README.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="space-y-6">
          <FlipsideLogo width={76} height={80} />
          <p className="text-xs font-simplon">
            &copy; COPYRIGHT {new Date().getFullYear()} FLIPSIDE CRYPTO
          </p>
        </div>
      </footer>
    </>
  );
}
