import React, { useContext, useEffect, useRef, useState } from "react";
import { DataGrid, GridColumn } from "rc-easyui";
import { ax } from "../../../utils/axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import { queryRemover } from "../../../utils/queryRemover";
import MenuItem from "@mui/material/MenuItem";
import { AlertContext } from "../../_app";
import Dialog from "@mui/material/Dialog";
import excerpts from "excerpts";
import "react-quill/dist/quill.snow.css";
import Modal from "@mui/material/Modal";
import styles from "./messages.module.scss";

export default function Messages() {
  const { setError, setMessage } = useContext(AlertContext);
  const [modal, setModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const searchQueryInitialState = {
    name: "",
    phone: "",
    email: "",
    content: "",
    subject: "",
    status: "",
  };
  const [searchQuery, setSearchQuery] = useState(searchQueryInitialState);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
  });
  const [messages, setMessages] = useState({
    data: [],
    total: "",
  });
  useEffect(() => {
    search();
  }, [pagination.page, pagination.size]);

  const search = () => {
    ax({
      url: "/api/panel/messages",
      params: queryRemover({ ...searchQuery, ...pagination }),
    })
      .then((res) => {
        setMessages(res.data);
        setSelectedRow(res.data.data[0]);
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  const handleChangeSearch = (e) => {
    setSearchQuery({ ...searchQuery, [e.target.name]: e.target.value });
  };

  const view = (row) => {
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
      url: "/api/panel/messages",
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

  return (
    <div className="panelContainer">
      <div className="pt-10">
        <div className="flex justify-center">
          <h1 className="font-thin	text-gray-400	">Messages</h1>
        </div>
        <div className="flex flex-wrap justify-evenly">
          <TextField
            value={searchQuery.name}
            label="Sender Name"
            variant="standard"
            name="name"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />
          <TextField
            value={searchQuery.subject}
            label="Subject"
            variant="standard"
            name="subject"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-evenly">
          <TextField
            value={searchQuery.content}
            label="Content"
            variant="standard"
            name="content"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />

          <Select
            sx={{ marginRight: "17rem", marginBottom: "1rem" }}
            variant="standard"
            defaultValue=""
            value={searchQuery.status}
            label="Status"
            name="status"
            onChange={handleChangeSearch}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="unread">unread</MenuItem>
            <MenuItem value="read">read</MenuItem>
          </Select>
        </div>

        <div className="my-4">
          <Button
              sx={{ margin: ".5rem"}}
            onClick={search}
            variant="contained"
            startIcon={<PersonSearchOutlinedIcon />}
          >
            Search
          </Button>
          <Button
              sx={{ margin: ".5rem"}}
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
          style={{minWidth: "800px", overflow: "auto"}}
          columnResizing
          data={messages?.data}
          total={messages?.total}
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
            field="name"
            title="Sender Nam"
            align="center"
          />
          <GridColumn
            field="phone"
            title="Sender Phone"
            align="center"
          />
          <GridColumn
            field="email"
            title="Sender Email"
            align="center"
          />
          <GridColumn
            render={(row) => {
              return <p>{excerpts(row.row.subject, { words: 3 })}</p>;
            }}
            title="subject"
            align="center"
          />
          <GridColumn
            render={(row) => {
              return <p>{excerpts(row.row.content, { words: 5 })}</p>;
            }}
            title="content"
            align="center"
          />

          <GridColumn
            field="status"
            title="status"
            align="center"
          />
          <GridColumn
            title="url"
            align="center"
            render={({ row }) => (
              <RemoveRedEyeOutlinedIcon
                onClick={() => view(row)}
                className="cursor-pointer"
              />
            )}
          />
        </DataGrid>
                </div>
        {/*view modal*/}
        <Modal open={modal} onClose={handleCloseModal} keepMounted>
          <div className="modal">
            <div className={styles.contactContainer}>
              <form>
                <TextField
                  margin="normal"
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  disabled
                  value={selectedRow?.name}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 300, margin: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  disabled
                  value={selectedRow?.email}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 300, margin: 2 }}
                />
                <TextField
                  margin="normal"
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="phone"
                  disabled
                  value={selectedRow?.phone}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 300, margin: 2 }}
                />

                <TextField
                  margin="normal"
                  required
                  id="subject"
                  label="Subject"
                  name="subject"
                  disabled
                  fullWidth
                  sx={{ margin: 2 }}
                  InputLabelProps={{ shrink: true }}
                  value={selectedRow?.subject}
                />
                <TextField
                  margin="normal"
                  rows={6}
                  required
                  fullWidth
                  id="content"
                  label="Message"
                  name="content"
                  multiline
                  disabled
                  sx={{ margin: 2 }}
                  InputLabelProps={{ shrink: true }}
                  value={selectedRow?.content}
                />
                <Button
                  onClick={handleCloseModal}
                  fullWidth
                  variant="contained"
                  InputLabelProps={{ shrink: true }}
                  sx={{ margin: ".5rem", height: "50px" }}
                >
                  close
                </Button>
              </form>
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
