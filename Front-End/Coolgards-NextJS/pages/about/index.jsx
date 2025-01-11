import * as React from "react";
import styles from "./about.module.scss";
import Link from "next/link";

export default function About() {

  return (
    <div className={styles.container}>
      <div className={styles.about}>
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="mt-5 max-w-xl text-center mx-auto">
            <h1 className="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl">
              About <span className="text-logo">COOLGARDS</span>
            </h1>
          </div>

          <div className="mt-5 max-w-3xl text-center mx-auto">
            <p className="text-lg text-gray-600 text-justify">
              COOLGARD was established with the aim of providing customers a comprehensive range of services for rehabilitation treatment, along with offering premium and affordable products and services. Our target audience includes professional and amateur athletes, as well as health professionals such as physiotherapists, and individuals who seek to maintain a healthy lifestyle.
            </p>
          </div>

          <div className="mt-8 max-w-3xl text-center mx-auto">
            <p className="text-lg text-gray-800 text-justify" >
              <h2> QUALITY POLICY</h2>
              Our mission is to meet the high demands of our customers through continuous product development. We are dedicated to achieving a leading position in the industry we operate in. We carefully analyze any information related to non-conformance or customer dissatisfaction and utilize it as valuable input for improvement purposes.
            </p>
          </div>

          <div className="text-center">
            <Link
                className="inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-tl from-blue-600 to-violet-600 shadow-lg shadow-transparent hover:shadow-blue-700/50 border border-transparent text-white text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white py-3 px-6"
                href="/contact"
            >
              please feel free to contact us!
              <svg
                  className="w-2.5 h-2.5"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
              >
                <path
                    d="M5.27921 2L10.9257 7.64645C11.1209 7.84171 11.1209 8.15829 10.9257 8.35355L5.27921 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
