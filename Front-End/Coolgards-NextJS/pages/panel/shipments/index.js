import React, { useContext, useEffect, useState } from "react";
import { DataGrid, GridColumn } from "rc-easyui";
import { ax } from "../../../utils/axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { queryRemover } from "../../../utils/queryRemover";
import { AlertContext } from "../../_app";
import Modal from "@mui/material/Modal";
import Dialog from "@mui/material/Dialog";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

export default function Index() {
  const { setError, setMessage } = useContext(AlertContext);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [mode, setMode] = useState(0);

  const searchQueryInitialState = {
    country: "",
    shipmentPrice: "",
    vat: "",
  };
  const [searchQuery, setSearchQuery] = useState(searchQueryInitialState);

  const addQueryInitialState = {
    country: "",
    shipmentPrice: "",
    vat: "",
  };
  const [addQuery, setAddQuery] = useState(addQueryInitialState);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
  });
  const [shipments, setShipments] = useState({
    data: [],
    total: "",
  });
  useEffect(() => {
    search();
  }, [pagination.page, pagination.size]);

  const search = () => {
    ax({
      url: "/api/panel/shipments",
      params: queryRemover({ ...searchQuery, ...pagination }),
    })
      .then((res) => {
        setShipments(res.data);
        setSelectedRow(res.data.data[0]);
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  const handleChangeSearch = (e) => {
    setSearchQuery({ ...searchQuery, [e.target.name]: e.target.value });
  };

  const handleChangeAdd = (e) => {
    setAddQuery({ ...addQuery, [e.target.name]: e.target.value });
  };
  const add = () => {
    setMode(0);
    setAddQuery({ ...addQuery });
    setModal(true);
  };
  const edit = () => {
    setMode(1);
    setAddQuery(selectedRow);
    setModal(true);
  };

  const handleDelete = () => {
    setConfirmModal(true);
  };

  const handleCloseModal = () => {
    setModal(false);
  };
  const submitDelete = () => {
    ax({
      url: "/api/panel/shipments",
      method: "delete",
      data: selectedRow,
    })
      .then((res) => {
        search();
        setMessage(res.data.message);
        setConfirmModal(false);
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  const submitAdd = () => {
    ax({
      url: "/api/panel/shipments",
      method: "post",
      data: addQuery,
    })
      .then((res) => {
        search();
        setMessage(res.data.message);
        cancelAdd();
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  const submitEdit = () => {
    ax({
      url: "/api/panel/shipments",
      method: "patch",
      data: addQuery,
    })
      .then((res) => {
        search();
        cancelAdd();
        setMessage(res.data.message);
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  const cancelAdd = () => {
    setAddQuery(addQueryInitialState);
    setModal(false);
  };

  return (
    <div className="panelContainer">
      <div className="pt-10">
        <div className="flex justify-center">
          <h1 className="font-thin	text-gray-400	">Media Files</h1>
        </div>
        <div className="flex flex-wrap justify-evenly">
          <TextField
            value={searchQuery.country}
            label="Country"
            variant="standard"
            name="country"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />
          <TextField
            value={searchQuery.shipmentPrice}
            label="Shipment Price"
            variant="standard"
            name="shipmentPrice"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />

          <TextField
            value={searchQuery.vat}
            label="Vat"
            variant="standard"
            name="vat"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />
        </div>

        <div className="my-4">
          <Button
            sx={{ margin: ".5rem" }}
            onClick={search}
            variant="contained"
            startIcon={<SearchOutlinedIcon />}
          >
            Search
          </Button>
          <Button
            sx={{ margin: ".5rem" }}
            onClick={add}
            variant="contained"
            startIcon={<AddOutlinedIcon />}
          >
            Add
          </Button>
          <Button
            sx={{ margin: ".5rem" }}
            onClick={edit}
            variant="contained"
            disabled={!selectedRow}
            startIcon={<ModeEditOutlineOutlinedIcon />}
          >
            Edit
          </Button>
          <Button
            sx={{ margin: ".5rem" }}
            onClick={handleDelete}
            variant="contained"
            disabled={!selectedRow}
            startIcon={<DeleteOutlineOutlinedIcon />}
          >
            Delete
          </Button>
        </div>

        <div className="dataGridContainer">
          <DataGrid
            style={{ minWidth: "800px", overflow: "auto" }}
            columnResizing
            data={shipments?.data}
            total={shipments?.total}
            pageNumber={pagination.page}
            pageSize={pagination.size}
            idField="_id"
            lazy
            selectionMode="single"
            pagination
            onPageChange={(e) =>
              setPagination({ page: e.pageNumber, size: e.pageSize })
            }
            pagePosition="bottom"
            pageOptions={{
              layout: [
                "list",
                "sep",
                "first",
                "prev",
                "next",
                "last",
                "sep",
                "sep",
                "manual",
                "info",
              ],
            }}
            selection={selectedRow}
            onSelectionChange={(row) => setSelectedRow(row)}
          >
            <GridColumn field="_id" title="Id" align="center" />
            <GridColumn
              field="country"
              title="Country"
              align="center"
            />
            <GridColumn
              field="shipmentPrice"
              title="Shipment Price"
              align="center"
            />
            <GridColumn field="vat" title="Vat" align="center"/>
          </DataGrid>
        </div>
        {/*Add Modal*/}
        <Modal open={modal} onClose={handleCloseModal}>
          <div className="modal">
            <div className="flex justify-center items-start flex-wrap">
              <TextField
                required
                value={addQuery.country}
                label="Country"
                variant="standard"
                name="country"
                onChange={handleChangeAdd}
                sx={{ width: 300, margin: 2 }}
              />
              <TextField
                required
                value={addQuery.shipmentPrice}
                label="Shipment Price"
                variant="standard"
                name="shipmentPrice"
                onChange={handleChangeAdd}
                sx={{ width: 300, margin: 2 }}
              />
              <TextField
                required
                value={addQuery.vat}
                label="vat"
                variant="standard"
                name="vat"
                onChange={handleChangeAdd}
                sx={{ width: 300, margin: 2 }}
              />
            </div>
            <div className="flex justify-center items-start">
              <Button
                sx={{ margin: 2 }}
                onClick={mode ? submitEdit : submitAdd}
                variant="contained"
                startIcon={
                  mode ? <ModeEditOutlineOutlinedIcon /> : <AddOutlinedIcon />
                }
              >
                {mode ? "Edit Shipment" : "Add Shipment"}
              </Button>
              <Button
                sx={{ margin: 2 }}
                onClick={cancelAdd}
                variant="contained"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        <Dialog open={confirmModal} onClose={() => setConfirmModal(false)}>
          <div className="flex flex-center flex-col p-10 items-center truncate">
            <p>Are you sure?</p>
            <div className="flex justify-center items-center ">
              <Button
                sx={{ margin: 1 }}
                variant="contained"
                onClick={submitDelete}
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
      </div>
    </div>
  );
}
