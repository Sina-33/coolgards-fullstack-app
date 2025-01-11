import Image from "next/image";
import Button from "@mui/material/Button";
import { useState } from "react";

export default function Shipment() {
  const [display, setDisplay] = useState(true);

  return (
    <>
      {display && (
        <div className="rounded-[2rem] z-50 bg-logo right-5 fixed bottom-5 p-4 text-white w-[22rem]">
          <p>
            We currently offer free shipping to {" "}

            <Image
                className="ml-1 mr-1"
                width={20}
                height={13}
                src="/sweden.png"
                alt="sweden flag"
            />
            <Image
              className="ml-1 mr-1"
              width={20}
              height={15}
              src="/denmark.png"
              alt="denmark flag"
            />

            <Image
              className="ml-1 mr-1"
              width={20}
              height={14}
              src="/iceland.png"
              alt="iceland flag"
            />
            <Image
                className="ml-1 mr-1"
                width={20}
                height={12}
                src="/finland.png"
                alt="finland flag"
            />
            <Image
                className="ml-1 mr-1"
                width={20}
                height={14}
                src="/norway.png"
                alt="norway flag"
            />

            More countries coming soon.
          </p>
          <div className="flex justify-center">
            <Button variant="contained" onClick={() => setDisplay(false)}>
              Ok!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
