import * as React from "react";
import styles from "./payment.module.scss";
import Image from "next/image";

export default function PaymentPolicy() {


  return (
    <div className={styles.container}>
      <div className={styles.bg}>
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="mt-5 max-w-xl text-center mx-auto">
            <h1 className="block text-gray-800 text-4xl md:text-5xl lg:text-6xl">
              <span className="text-logo">COOLGARDS</span> Payment Policy
            </h1>
          </div>
          <div className="mt-8 max-w-3xl text-center mx-auto ql-align-right">
            <p className="text-lg text-gray-800 text-justify">
              Payment for your purchases is made by credit card through the secure online payment system. We accept all major credit cards, as well as payments made through PayPal. PayPal is a safer, easier way to send and receive money online. Your credit card information is not processed through or stored on coolgards.com servers, and no information is ever released to a third party
            </p>
          </div>

          <div className="flex justify-center">
          <Image width={375} height={134} src='/payments.jpg' alt="paypal payment methods"/>
          </div>

        </div>
      </div>
    </div>
  );
}
