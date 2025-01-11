import React, { useContext, useEffect, useState } from "react";
import { ax } from "../utils/axios";
import { queryRemover } from "../utils/queryRemover";
import { AlertContext } from "../pages/_app";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

import styles from "./Uploader.module.scss";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

export default function Uploader({ onSelect, onClose, mediaMode = false }) {
  const { setError, setMessage } = useContext(AlertContext);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});
  const [files, setFiles] = useState([]);
  const [downloadedFiles, setDownloadedFiles] = useState({
    data: [],
    total: "",
  });
  useEffect(() => {
    search();
  }, []);

  const search = () => {
    ax({
      url: "/api/media/all",
      params: queryRemover({}),
    })
      .then((res) => {
        setDownloadedFiles(res.data);
        setSelectedImage(res.data.data[0]);
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };
  const serverConfigs = {
    url: `/api/media`,
    process: {
      method: "POST",
      withCredentials: true,
      onload: (res) => search(),
      onerror: (err) => setError(err.data),
    },
  };
  const handleSelect = (p) => {
    setSelectedImage(p);
  };

  const handleCloseUploader = () => {
    setSelectedImage({});
    onClose();
  };

  const handleDeleteImage = () => {
    if (selectedImage) {
      ax({
        url: "/api/media",
        method: "delete",
        data: selectedImage,
      })
        .then((res) => {
          search();
          setMessage(res.data.message);
          setConfirmModal(false);
        })
        .catch((e) => {
          setError(e.response?.data?.message || e.message);
        });
    }
  };

  return (
    <div >
      <div className="pt-10">
        <div>
          <FilePond
            credits={false}
            files={files}
            onupdatefiles={setFiles}
            allowMultiple={true}
            maxFiles={20}
            acceptedFileTypes={["image/*"]}
            server={serverConfigs}
            name="files"
            labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
          />
        </div>
        <div className="flex justify-center">
          {selectedImage && (
            <>
            {!mediaMode && <Button sx={{margin: '1rem'}} variant="contained" onClick={() => onSelect(selectedImage)}>Select</Button>}
              <Button sx={{margin: '1rem'}} color="error" variant="contained" onClick={() => setConfirmModal(true)}>
                Delete
              </Button>
            </>
          )}
          {!mediaMode && <Button sx={{margin: '1rem'}} onClick={handleCloseUploader}>Cancel</Button>}
        </div>

        <Dialog open={confirmModal} onClose={() => setConfirmModal(false)}>
          <div className="flex flex-center flex-col p-10 items-center truncate">
            <p>Are you sure?</p>
            <div className="flex justify-center items-center ">
              <Button
                sx={{ margin: 1 }}
                variant="contained"
                onClick={handleDeleteImage}
              >
                Yes
              </Button>
              <Button
                sx={{ margin: 1 }}
                onClick={() => setConfirmModal(false)}
                autoFocus
              >
                Cancel
              </Button>
            </div>
          </div>
        </Dialog>

        <div>
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
          >
            <Masonry columnsCount={3} gutter="20px">
              {downloadedFiles.data.map((pic) => (
                <img
                  onClick={() => handleSelect(pic)}
                  onDoubleClick={() => {
                    handleSelect(pic);
                    onSelect(selectedImage);
                  }}
                  id={pic._id}
                  className={styles.card}
                  alt={pic.name}
                  key={pic._id}
                  src={pic.path}
                  style={
                    selectedImage?._id === pic._id
                      ? {
                          width: "100%",
                          display: "block",
                          border: "dashed 3px #003eff",
                        }
                      : { width: "100%", display: "block" }
                  }
                />
              ))}
            </Masonry>
          </ResponsiveMasonry>
        </div>
      </div>
    </div>
  );
}
