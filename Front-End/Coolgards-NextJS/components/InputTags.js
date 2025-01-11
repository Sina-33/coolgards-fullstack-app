import { Cancel, Tag } from "@mui/icons-material";
import { FormControl, Stack, TextField, Typography } from "@mui/material";
import {useEffect, useRef, useState} from "react";

const Tags = ({ data, handleDelete }) => {
  return (
    <div
      style={{
        background: "#283240",
        height: "100%",
        display: "flex",
        padding: "0.4rem",
        margin: "0 0.5rem 0 0",
        justifyContent: "center",
        alignContent: "center",
        color: "#ffffff",
      }}
    >
      <Stack direction="row" gap={1}>
        <Typography>{data}</Typography>
        <Cancel
          sx={{ cursor: "pointer" }}
          onClick={() => {
            handleDelete(data);
          }}
        />
      </Stack>
    </div>
  );
};

export default function InputTags({onChange, value = []}) {
  const [tags, SetTags] = useState(value);
  const tagRef = useRef();

    useEffect(() => {
       onChange(tags)
    }, [tags]);

    useEffect(() => {
        SetTags(value)
    }, [value]);

  const handleDelete = (value) => {
    const newtags = tags.filter((val) => val !== value);
    SetTags(newtags);
  };
  const handleOnSubmit = (e) => {
    e.preventDefault();
    SetTags([...tags, tagRef.current.value]);
    tagRef.current.value = "";
  };
  return (
    <div >
      <form onSubmit={handleOnSubmit}>
        <TextField
          inputRef={tagRef}
          sx={{ width: 300, margin: 2 }}
          variant="standard"
          size="small"
          margin="none"
          label="tags"
          placeholder={tags.length < 5 ? "type a tag and press enter" : ""}
          InputProps={{
            startAdornment: (
              <div style={{ margin: "0 0.2rem 0 0", display: "flex" }}>
                {tags.map((data, index) => {
                  return (
                    <Tags data={data} handleDelete={handleDelete} key={index} />
                  );
                })}
              </div>
            ),
          }}
        />
      </form>
    </div>
  );
}
