import * as React from "react";
import styles from "./shipment.module.scss";

export default function ShipmentPolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="mt-5 max-w-xl text-center mx-auto">
            <h1 className="block text-gray-800 text-4xl md:text-5xl lg:text-6xl">
              <span className="text-logo">COOLGARDS</span> Shipment Policy
            </h1>
          </div>
          <div className={styles.contentContainer}>
            <p style={{ textAlign: "justify" }}>
              <span style={{ fontSize: "11pt" }}>
                <span>
                  <span style={{ fontSize: "14.0pt" }}>
                    We provide complimentary shipping services to customers
                    within Sweden, Denmark, Norway, Finland, and Iceland. All
                    orders are promptly processed within one business day,
                    excluding weekends and holidays. The estimated shipping time
                    for deliveries is approximately 2 to 3 working days. Please
                    note that while we strive to meet these timelines, we have
                    limited control over the actual delivery process. To help
                    you stay updated on your order&apos;s progress, a confirmation
                    email containing tracking information will be automatically
                    sent within 24 hours.
                  </span>
                </span>
              </span>
            </p>
            <p style={{ textAlign: "justify" }}>
              <span style={{ fontSize: "11pt" }}>
                <span>
                  <span style={{ fontSize: "14.0pt" }}>
                    For international shipments, it&apos;s important to mention that
                    customs fees, tariffs, and taxes may apply and vary
                    depending on the destination country. These charges are the
                    sole responsibility of the customer. We entrust the safe and
                    secure delivery of your goods to our shipping partner,
                    PostNord, ensuring a reliable shipping experience.
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
