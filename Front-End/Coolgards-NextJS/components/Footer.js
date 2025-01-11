import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="glass rounded-lg shadow ">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1 flex justify-center items-center">
            <Image src='/logo.png' alt="coolgards logo" width={50} height={50} />
            <p className="mr-2 text-logo">CoolGards</p>
          </div>

          {/*<div className="justify-center flex-1  flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 ">*/}
          {/*  <Link*/}
          {/*    href="#"*/}
          {/*    className="mt-4 ml-2 flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 "*/}
          {/*  >*/}
          {/*    <InstagramIcon />*/}
          {/*  </Link>*/}
          {/*  <Link*/}
          {/*    href="#"*/}
          {/*    className="mt-4 ml-2 flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 "*/}
          {/*  >*/}
          {/*    <YouTubeIcon />*/}
          {/*  </Link>*/}
          {/*  <Link*/}
          {/*    href="#"*/}
          {/*    className="mt-4 ml-2 flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 "*/}
          {/*  >*/}
          {/*    <FacebookIcon />*/}
          {/*  </Link>*/}
          {/*  <Link*/}
          {/*    href="#"*/}
          {/*    className="mt-4 ml-2 flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 "*/}
          {/*  >*/}
          {/*    <TwitterIcon />*/}
          {/*  </Link>*/}
          {/*  <Link*/}
          {/*    href="#"*/}
          {/*    className="mt-4 ml-2 flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 "*/}
          {/*  >*/}
          {/*    <PinterestIcon />*/}
          {/*  </Link>*/}
          {/*  <Link*/}
          {/*    href="#"*/}
          {/*    className="mt-4 ml-2 flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 "*/}
          {/*  >*/}
          {/*    <LinkedInIcon />*/}
          {/*  </Link>*/}
          {/*</div>*/}

          <ul className="flex-1 flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 ">
            <li>
              <Link href="/payment-policy" className="mr-4 hover:underline md:mr-6 ">
                Payment Policy
              </Link>
            </li>
            <li>
              <Link href="/shipment-policy" className="mr-4 hover:underline md:mr-6 ">
                Shipment Policy
              </Link>
            </li>

            <li>
              <Link href="/privacy-policy" className="mr-4 hover:underline md:mr-6 ">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="mr-4 hover:underline md:mr-6 ">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="mr-4 hover:underline md:mr-6 ">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <hr className="my-6 border-gray-200 sm:mx-auto  lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center">
          © 2022{" "}
          <a href="https://flowbite.com/" className="hover:underline">
            CoolGards™
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
