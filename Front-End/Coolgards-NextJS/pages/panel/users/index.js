import React, { useContext, useEffect, useState } from "react";
import { DataGrid, GridColumn } from "rc-easyui";
import { ax } from "../../../utils/axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import { queryRemover } from "../../../utils/queryRemover";
import MenuItem from "@mui/material/MenuItem";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import { AlertContext } from "../../_app";
import Modal from "@mui/material/Modal";
import Dialog from "@mui/material/Dialog";
import Link from "next/link";

export default function Index({ shipments }) {
  const { setError, setMessage } = useContext(AlertContext);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [mode, setMode] = useState(0);

  const searchQueryInitialState = {
    fullName: "",
    email: "",
    roles: "",
  };
  const [searchQuery, setSearchQuery] = useState(searchQueryInitialState);

  const addQueryInitialState = {
    fullName: "",
    email: "",
    roles: "",
    password: "",
    country: "",
    city: "",
    address: "",
    postalCode: "",
    mobilePhone: "",
  };
  const [addQuery, setAddQuery] = useState(addQueryInitialState);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
  });
  const [users, setUsers] = useState({
    data: [],
    total: "",
  });
  useEffect(() => {
    search();
  }, [pagination.page, pagination.size]);

  const search = () => {
    ax({
      url: "/api/panel/users",
      params: queryRemover({ ...searchQuery, ...pagination }),
    })
      .then((res) => {
        setUsers(res.data);
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
    setAddQuery({ ...addQuery, roles: ["customer"] });
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
      url: "/api/panel/users",
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
      url: "/api/panel/users",
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
      url: "/api/panel/users",
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
          <h1 className="font-thin	text-gray-400	">Users</h1>
        </div>
        <div className="flex flex-wrap justify-evenly">
          <TextField
            value={searchQuery.email}
            label="Email"
            variant="standard"
            name="email"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />
          <TextField
            value={searchQuery.fullName}
            label="Full Name"
            variant="standard"
            name="fullName"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />

          <Select
            sx={{ marginRight: "17rem" }}
            variant="standard"
            value={searchQuery.roles}
            label="Role"
            name="roles"
            onChange={handleChangeSearch}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </div>

        <div className="my-4">
          <Button
            sx={{ margin: ".5rem" }}
            onClick={search}
            variant="contained"
            startIcon={<PersonSearchOutlinedIcon />}
          >
            Search
          </Button>
          <Button
            sx={{ margin: ".5rem" }}
            onClick={add}
            variant="contained"
            startIcon={<PersonAddOutlinedIcon />}
          >
            Add
          </Button>
          <Button
            sx={{ margin: ".5rem" }}
            onClick={edit}
            variant="contained"
            disabled={!selectedRow}
            startIcon={<ManageAccountsOutlinedIcon />}
          >
            Edit
          </Button>
          <Button
            sx={{ margin: ".5rem" }}
            onClick={handleDelete}
            variant="contained"
            disabled={!selectedRow}
            startIcon={<PersonRemoveOutlinedIcon />}
          >
            Delete
          </Button>
        </div>

        <div className="dataGridContainer">
          <DataGrid
            style={{ minWidth: "800px", overflow: "auto" }}
            columnResizing
            data={users?.data}
            total={users?.total}
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
              field="fullName"
              title="Full Name"
              align="center"
            />
            <GridColumn
              field="email"
              title="Email"
              align="center"
            />
            <GridColumn
              field="mobilePhone"
              title="Mobile Phone"
              align="center"
            />
            <GridColumn
              field="roles"
              title="Roles"
              align="center"
            />
            <GridColumn
              field="country"
              title="Country"
              align="center"
            />
            <GridColumn field="city" title="City" align="center"/>
            <GridColumn
              title="Orders"
              align="center"
              render={({ row }) => (
                <Link href={"/panel/orders/" + row._id} target="_blank">
                  <LocalMallOutlinedIcon className="cursor-pointer" />
                </Link>
              )}
            />
          </DataGrid>
        </div>

        {/*Add Modal*/}
        <Modal open={modal} onClose={handleCloseModal}>
          <div className="modal">
            <div className="flex justify-center items-start flex-wrap">
              <TextField
                required
                value={addQuery.email}
                label="Email"
                variant="standard"
                name="email"
                onChange={handleChangeAdd}
                sx={{ width: 300, margin: 2 }}
              />
              <TextField
                required
                value={addQuery.fullName}
                label="Full Name"
                variant="standard"
                name="fullName"
                onChange={handleChangeAdd}
                sx={{ width: 300, margin: 2 }}
              />
              <TextField
                required
                value={addQuery.password}
                label="Password"
                variant="standard"
                name="password"
                onChange={handleChangeAdd}
                sx={{ width: 300, margin: 2 }}
              />
              <Select
                variant="standard"
                value={addQuery.roles}
                sx={{ margin: "2rem", width: 300 }}
                label="Role"
                name="roles"
                onChange={handleChangeAdd}
                displayEmpty
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>

              <Select
                variant="standard"
                value={addQuery.country}
                sx={{ margin: "2rem", width: 300 }}
                label="Country"
                name="country"
                onChange={handleChangeAdd}
              >
                {shipments.map((item) => (
                  <MenuItem key={item._id} value={item.country}>
                    {item.country}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                value={addQuery.city}
                label="City"
                variant="standard"
                name="city"
                onChange={handleChangeAdd}
                sx={{ width: 300, margin: 2 }}
              />

              <TextField
                value={addQuery.address}
                label="Address"
                variant="standard"
                name="address"
                onChange={handleChangeAdd}
                sx={{ width: 300, margin: 2 }}
              />

              <TextField
                value={addQuery.postalCode}
                label="Postal Code"
                variant="standard"
                name="postalCode"
                onChange={handleChangeAdd}
                sx={{ width: 300, margin: 2 }}
              />

              <TextField
                value={addQuery.mobilePhone}
                label="Mobile Phone"
                variant="standard"
                name="mobilePhone"
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
                  mode ? (
                    <ManageAccountsOutlinedIcon />
                  ) : (
                    <PersonAddOutlinedIcon />
                  )
                }
              >
                {mode ? "Edit User" : "Add User"}
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

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.BASE_URL}/shipments`);
    const jsonRes = await res.json();
    return { props: { shipments: jsonRes.data } };
  } catch (err) {
    return { props: { error: err.response?.data?.message || err.message } };
  }
}
