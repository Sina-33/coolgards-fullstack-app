import React from "react";
import Uploader from "../../../components/Uploader";

export default function Index() {

  return (
    <div className="panelContainer">
        <div className="flex justify-center">
            <h1 className="font-thin	text-gray-400	">Media Files</h1>
        </div>
      <Uploader mediaMode/>
    </div>
  );
}
