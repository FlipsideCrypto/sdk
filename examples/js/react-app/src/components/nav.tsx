import { Disclosure } from "@headlessui/react";
import { Link } from "react-router-dom";

export function Nav() {
  return (
    <div className="sticky top-0 z-50 min-h-full">
      <Disclosure as="nav" className="bg-[#010012] ">
        {({ open }) => (
          <>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex items-center">
                  <Link
                    to="/shroomdk"
                    className="font-cartridge text-lg text-white"
                  >
                    ShroomDK
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </Disclosure>
    </div>
  );
}
