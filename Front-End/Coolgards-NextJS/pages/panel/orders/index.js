import React, { useContext, useEffect, useRef, useState } from "react";
import { DataGrid, GridColumn } from "rc-easyui";
import styles from "./orders.module.scss";
import { ax } from "../../../utils/axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import { queryRemover } from "../../../utils/queryRemover";
import MenuItem from "@mui/material/MenuItem";
import { AlertContext } from "../../_app";
import Modal from "@mui/material/Modal";
import Dialog from "@mui/material/Dialog";
import { InputAdornment } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Link from "next/link";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import Image from "next/image";

export default function Index() {
  const { setError, setMessage } = useContext(AlertContext);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);

  const searchQueryInitialState = {
    userEmail: "",
    status: "",
    totalItems: "",
    totalItemsPrice: "",
    totalShipmentPrice: "",
    totalVatPrice: "",
    totalPrice: "",
  };
  const [searchQuery, setSearchQuery] = useState(searchQueryInitialState);
  const [query, setQuery] = useState(searchQueryInitialState);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
  });
  const [orders, setOrders] = useState({
    data: [],
    total: "",
  });
  useEffect(() => {
    search();
  }, [pagination.page, pagination.size]);

  const search = () => {
    ax({
      url: "/api/panel/orders",
      params: queryRemover({ ...searchQuery, ...pagination }),
    })
      .then((res) => {
        setOrders(res.data);
        setSelectedRow(res.data.data[0]);
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  const handleChangeSearch = (e) => {
    setSearchQuery({ ...searchQuery, [e.target.name]: e.target.value });
  };
  const handleChange = (e) => {
    setQuery({ ...query, [e.target.name]: e.target.value });
  };

  const edit = () => {
    setQuery(selectedRow);
    setModal(true);
  };

  const handleDelete = () => {
    setConfirmModal(true);
  };

  const submitDelete = () => {
    ax({
      url: "/api/panel/orders",
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

  const submitEdit = () => {
    ax({
      url: "/api/panel/orders",
      method: "patch",
      data: query,
    })
      .then((res) => {
        search();
        cancel();
        setMessage(res.data.message);
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  const handleSubmitOrder = () => {
    submitEdit();
  };

  const cancel = () => {
    setQuery(searchQueryInitialState);
    setModal(false);
  };

  return (
    <div className="panelContainer">
      <div className="pt-10">
        <div className="flex justify-center">
          <h1 className="font-thin	text-gray-400	">Orders</h1>
        </div>
        <div className="flex flex-wrap justify-evenly">
          <TextField
            value={searchQuery.userEmail}
            label="User Email"
            variant="standard"
            name="userEmail"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />
          <TextField
            sx={{ width: 300, marginTop: ".8rem" }}
            value={searchQuery.totalPrice}
            label="Total Price"
            variant="standard"
            name="totalPrice"
            onChange={handleChangeSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">€</InputAdornment>
              ),
            }}
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-evenly">
          <Select
            defaultValue=""
            sx={{ marginRight: "5rem", marginBottom: "1rem" }}
            variant="standard"
            value={searchQuery.status}
            label="Status"
            name="status"
            onChange={handleChangeSearch}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="CREATED">CREATED</MenuItem>
            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
          </Select>
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
            data={orders?.data}
            total={orders?.total}
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
            <GridColumn
              field="_id"
              title="order id"
              align="center"
            />
            <GridColumn
                field="paypalId"
                title="paypal id"
                align="center"
            />
            <GridColumn
              field="userEmail"
              title="user email"
              align="center"
            />
            <GridColumn
              field="status"
              title="status"
              align="center"
            />

            <GridColumn
              field="cart"
              title="cart items"
              align="center"
              render={({ row }) => (
                <>
                  {row.cart.map((item) => {
                    return (
                      <Link
                        href={`/products/${item.slug}`}
                        className="p-2 m-1 block text-slate-50 bg-slate-400 rounded-3xl"
                        key={item._id}
                      >
                        {item.title} ({item.quantity})
                      </Link>
                    );
                  })}
                </>
              )}
            />
            <GridColumn
              render={({ row }) => <p>{row.totalItems}</p>}
              title="total items"
              align="center"
            />
            <GridColumn
              render={({ row }) => <p>€ {row.totalItemsPrice}</p>}
              title="items price"
              align="center"
            />
            <GridColumn
              render={({ row }) => <p>€ {row.totalShipmentPrice}</p>}
              title="shipment"
              align="center"
            />
            <GridColumn
              render={({ row }) => <p>€ {row.totalVatPrice}</p>}
              title="vat"
              align="center"
            />
            <GridColumn
              render={({ row }) => <p>€ {row.totalPrice}</p>}
              title="total price"
              align="center"
            />
            <GridColumn
              render={({ row }) => (
                <LocationOnOutlinedIcon
                  sx={{ cursor: "pointer" }}
                  onClick={() => setAddressModal(true)}
                />
              )}
              title="address"
              align="center"
            />
          </DataGrid>
        </div>
        {/*Edit Modal*/}
        <Modal open={modal} onClose={() => setModal(false)} keepMounted>
          <div className="modal">
            <div className="flex justify-center items-start flex-wrap">
              <TextField
                value={query.userEmail}
                name="userEmail"
                label="User Email"
                variant="standard"
                onChange={handleChange}
                sx={{ width: 300, margin: 2 }}
              />
              <TextField
                value={query.totalPrice}
                label="Total Price"
                variant="standard"
                name="totalPrice"
                onChange={handleChange}
                sx={{ width: 300, margin: 2 }}
              />

              <Select
                defaultValue=""
                sx={{ marginRight: "5rem", marginBottom: "1rem" }}
                variant="standard"
                value={query.status}
                label="Status"
                name="status"
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="CREATED">CREATED</MenuItem>
                <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              </Select>
            </div>
            <div className="flex justify-center items-start">
              <Button
                sx={{ margin: 2 }}
                onClick={() => handleSubmitOrder()}
                variant="contained"
                startIcon={<ModeEditOutlineOutlinedIcon />}
              >
                Edit Order
              </Button>
              <Button sx={{ margin: 2 }} onClick={cancel} variant="contained">
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

        {/*address Modal*/}
        <Modal
          open={addressModal}
          onClose={() => setAddressModal(false)}
          keepMounted
        >
          <div className="modal">
            <div className={styles.profileContainer}>
              <div className={styles.iconContainer}>
                <span className={styles.line} />
                <Image
                  src="/avatar.png"
                  width={80}
                  height={80}
                  alt="user avatar"
                />
                <span className={styles.line} />
              </div>
              <div className={styles.profileItem}>
                <span className={styles.label}>Full Name</span>
                <span className={styles.value}>
                  {selectedRow?.address.fullName}
                </span>
              </div>

              <div className={styles.profileItem}>
                <span className={styles.label}>User Email</span>
                <span className={styles.value}>{selectedRow?.userEmail}</span>
              </div>

              <div className={styles.profileItem}>
                <span className={styles.label}>Mobile Phone</span>
                <span className={styles.value}>
                  {selectedRow?.address.mobilePhone}
                </span>
              </div>

              <div className={styles.iconContainer}>
                <span className={styles.line} />
                <Image
                  src="/address.png"
                  width={80}
                  height={80}
                  alt="user address"
                />
                <span className={styles.line} />
              </div>

              <div className={styles.profileItem}>
                <span className={styles.label}>Country</span>
                <span className={styles.value}>
                  {selectedRow?.address.country}
                </span>
              </div>

              <div className={styles.profileItem}>
                <span className={styles.label}>City</span>
                <span className={styles.value}>
                  {selectedRow?.address.city}
                </span>
              </div>

              <div className={styles.profileItem}>
                <span className={styles.label}>Postal Code</span>
                <span className={styles.value}>
                  {selectedRow?.address.postalCode}
                </span>
              </div>

              <div className={styles.profileItem}>
                <span className={styles.label}>Address</span>
                <span className={styles.value}>
                  {selectedRow?.address.address}
                </span>
              </div>

              <div className="flex justify-center w-[100%]">
                <Button
                  sx={{ margin: 2 }}
                  onClick={() => setAddressModal(false)}
                  variant="contained"
                >
                  ok!
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
