import * as React from "react";
import styles from "./refund.module.scss";

export default function RefundPolicy() {

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="mt-5 max-w-xl text-center mx-auto">
            <h1 className="block text-gray-800 text-4xl md:text-5xl lg:text-6xl">
              <span className="text-logo">COOLGARDS</span> Refund Policy
            </h1>
          </div>
          <div className={styles.contentContainer}>
            <p>
    <span style={{ fontSize: "11pt" }}>
      <span >
        <span style={{ fontSize: "14.0pt" }}>
          At our company, we are committed to providing you with the highest
          quality products and ensuring excellent value for your investment.
          However, if you find yourself unsatisfied with your order or product
          for any reason, we kindly request that you notify us of your intention
          to return it within 7 days of receiving your delivery. Your
          satisfaction is our top priority, and we will do our best to address
          any concerns you may have.
        </span>
      </span>
    </span>
            </p>
            <p>
    <span style={{ fontSize: "11pt" }}>
      <span >
        <span style={{ fontSize: "14.0pt" }}>
          All our products benefit from the legal guarantee of conformity and
          the guarantee against hidden defects. In the event of non-compliance
          of a product sold, it may be returned, exchanged or refunded. All
          complaints, requests for exchange or refund must be made by email
          within 7 days of delivery.
        </span>
      </span>
    </span>
            </p>
            <p>
    <span style={{ fontSize: "11pt" }}>
      <span >
        <span style={{ fontSize: "14.0pt" }}>
          The products must be returned to us in the state in which you received
          them with all the elements (accessories, packaging, instructions,
          etc.).
        </span>
      </span>
    </span>
            </p>
            <p>
    <span style={{ fontSize: "11pt" }}>
      <span >
        <span style={{ fontSize: "14.0pt" }}>
          Note that the return costs are your responsibility whatever the
          reason.
        </span>
      </span>
    </span>
            </p>
            <p>&nbsp;</p>
          </div>

        </div>
      </div>
    </div>
  );
}
