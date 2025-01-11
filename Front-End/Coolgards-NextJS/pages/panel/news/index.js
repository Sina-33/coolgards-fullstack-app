import React, { useContext, useEffect, useRef, useState } from "react";
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
import Uploader from "../../../components/Uploader";
import MenuItem from "@mui/material/MenuItem";
import { AlertContext } from "../../_app";
import Modal from "@mui/material/Modal";
import Dialog from "@mui/material/Dialog";
import excerpts from "excerpts";
import "react-quill/dist/quill.snow.css";
import { modules, toolbarOptions } from "../../../utils/quilOptions";
import dynamic from "next/dynamic";
import slug from "slug";
import { MiniUploader } from "../../../components/MiniUploader";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import Link from "next/link";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import InputTags from "../../../components/InputTags";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  {
    ssr: false,
  }
);

export default function Index() {
  const { setError, setMessage } = useContext(AlertContext);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modal, setModal] = useState(false);
  const [uploaderModal, setUploaderModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [mode, setMode] = useState(0);
  const [insertMode, setInsertMode] = useState(false);
  const quillRef = useRef();

  const imageHandler = () => {
    setInsertMode(true);
    setUploaderModal(true);
  };

  const insertImage = (picObject) => {
    if (insertMode) {
      const range = quillRef.current.editor.getSelection(true);
      quillRef.current.editor.insertEmbed(
        range.index,
        "image",
        picObject?.path
      );
      handleCloseUploader();
      setInsertMode(false);
    } else {
      setAddQuery({ ...addQuery, imageUrl: picObject.path });
      setUploaderModal(false);
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      const toolbar = quillRef.current.editor.getModule("toolbar");
      toolbar.addHandler("image", () => imageHandler(quillRef.current.editor));
    }
  }, [quillRef.current]);

  const searchQueryInitialState = {
    title: "",
    content: "",
    status: "",
    tags: [],
  };
  const [searchQuery, setSearchQuery] = useState(searchQueryInitialState);

  const addQueryInitialState = {
    title: "",
    content: "",
    tags: [],
    status: "published",
    slug: "",
    imageUrl: "",
  };
  const [addQuery, setAddQuery] = useState(addQueryInitialState);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
  });
  const [posts, setPosts] = useState({
    data: [],
    total: "",
  });
  useEffect(() => {
    search();
  }, [pagination.page, pagination.size]);

  const search = () => {
    ax({
      url: "/api/panel/posts",
      params: queryRemover({ ...searchQuery, ...pagination }),
    })
      .then((res) => {
        setPosts(res.data);
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
    if (e.target.name === "title") {
      slug(e.target.value);
      setAddQuery({
        ...addQuery,
        slug: slug(e.target.value),
        title: e.target.value,
      });
    } else {
      setAddQuery({ ...addQuery, [e.target.name]: e.target.value });
    }
  };
  const add = () => {
    setMode(0);
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
    setUploaderModal(false);
  };

  const handleCloseUploader = () => {
    setUploaderModal(false);
  };
  const submitDelete = () => {
    ax({
      url: "/api/panel/posts",
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
      url: "/api/panel/posts",
      method: "post",
      data: addQuery,
    })
      .then((res) => {
        search();
        setAddQuery(addQueryInitialState);
        setMessage(res.data.message);
        cancelAdd();
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  const submitEdit = () => {
    ax({
      url: "/api/panel/posts",
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

  const handleSubmitPost = (mode) => {
    if (!mode) {
      submitAdd();
    } else {
      submitEdit();
    }
  };

  const cancelAdd = () => {
    setAddQuery(addQueryInitialState);
    setModal(false);
  };

  const handleEditorChange = (content, delta, source, editor) => {
    setAddQuery((prev) => ({ ...prev, content: content }));
  };

  return (
    <div className="panelContainer">
      <div className="pt-10">
        <div className="flex justify-center">
          <h1 className="font-thin	text-gray-400	">News Posts</h1>
        </div>
        <div className="flex flex-wrap justify-evenly">
          <TextField
            value={searchQuery.title}
            label="Title"
            variant="standard"
            name="title"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />
          <TextField
            value={searchQuery.content}
            label="Content"
            variant="standard"
            name="content"
            onChange={handleChangeSearch}
            sx={{ width: 300 }}
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-evenly">
          <InputTags
            onChange={(e) => setSearchQuery({ ...searchQuery, tags: e })}
            value={searchQuery.tags}
          />

          <Select
            sx={{ marginRight: "17rem", marginBottom: "1rem" }}
            variant="standard"
            defaultValue = ""
            value={searchQuery.status}
            label="Status"
            name="status"
            onChange={handleChangeSearch}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="published">published</MenuItem>
            <MenuItem value="draft">draft</MenuItem>
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
            onClick={add}
            variant="contained"
            startIcon={<PersonAddOutlinedIcon />}
          >
            Add
          </Button>
          <Button
              sx={{ margin: ".5rem"}}
            onClick={edit}
            variant="contained"
            disabled={!selectedRow}
            startIcon={<ManageAccountsOutlinedIcon />}
          >
            Edit
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

          <Link href="/news" >
            <Button
                sx={{ margin: ".5rem"}}
              variant="contained"
              startIcon={<ArrowForwardOutlinedIcon />}
            >
              Go to News
            </Button>
          </Link>
        </div>

                <div className="dataGridContainer">
        <DataGrid
          style={{minWidth: "800px", overflow: "auto"}}
          columnResizing
          data={posts?.data}
          total={posts?.total}
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
            render={(row) => {
              return <p>{excerpts(row.row.title, { words: 3 })}</p>;
            }}
            title="title"
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
            field="tags"
            title="tags"
            align="center"
            render={({ row }) => (
              <>
                {row.tags.map((tag) => {
                  return (
                    <p
                      className="p-2 m-1 inline-block text-slate-50 bg-slate-400 rounded-3xl"
                      key={tag}
                    >
                      {tag}
                    </p>
                  );
                })}
              </>
            )}
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
              <Link href={"/news/" + row.slug} target="_blank">
                <InsertLinkOutlinedIcon className="cursor-pointer" />
              </Link>
            )}
          />
        </DataGrid>
                </div>
        {/*Add Modal*/}
        <Modal open={modal} onClose={handleCloseModal} keepMounted>
          <div className="modal">
            <div className="flex justify-center items-start flex-wrap">
              <TextField
                value={addQuery.title}
                label="title"
                variant="standard"
                name="title"
                onChange={(e) => handleChangeAdd(e)}
                sx={{ width: 300, margin: 2 }}
              />
              <TextField
                value={addQuery.slug}
                label="slug"
                variant="standard"
                name="slug"
                onChange={handleChangeAdd}
                sx={{ width: 300, margin: 2 }}
              />

              <Select
                defaultValue = ""
                sx={{ margin: "2rem" }}
                label="Status"
                name="status"
                variant="standard"
                value={addQuery.status}
                onChange={handleChangeAdd}
              >
                <MenuItem value="draft">draft</MenuItem>
                <MenuItem value="published">published</MenuItem>
              </Select>

              <InputTags
                onChange={(e) => setAddQuery({ ...addQuery, tags: e })}
                value={addQuery.tags}
              />

              <div className="flex flex-wrap align-middle">
                {addQuery.imageUrl ? (
                  <MiniUploader
                    selectedImageUrl={addQuery.imageUrl}
                    onDelete={() =>
                      setAddQuery((prevState) => ({
                        ...prevState,
                        imageUrl: "",
                      }))
                    }
                  />
                ) : (
                  <Button
                    onClick={() => setUploaderModal(true)}
                    variant="standard"
                    startIcon={<AddPhotoAlternateOutlinedIcon />}
                  >
                    Add Cover Image
                  </Button>
                )}
              </div>

              <div className="w-screen">
                <ReactQuill
                  forwardedRef={quillRef}
                  placeholder="Content..."
                  value={addQuery.content}
                  modules={modules}
                  onChange={handleEditorChange}
                />
              </div>
            </div>
            <div className="flex justify-center items-start">
              <Button
                sx={{ margin: 2 }}
                onClick={() => handleSubmitPost(mode)}
                variant="contained"
                startIcon={
                  mode ? (
                    <ManageAccountsOutlinedIcon />
                  ) : (
                    <PersonAddOutlinedIcon />
                  )
                }
              >
                {mode ? "Edit Post" : "Add Post"}
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
        {/*Uploader Modal*/}
        <Modal open={uploaderModal} onClose={handleCloseModal}>
          <div className="modal">
            <Uploader onClose={handleCloseUploader} onSelect={insertImage} />
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
