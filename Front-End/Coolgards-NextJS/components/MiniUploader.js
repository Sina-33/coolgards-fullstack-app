import React, {useState} from "react";
import Image from "next/image";
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

export const MiniUploader = ({onDelete, selectedImageUrl }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onDelete(selectedImageUrl)}
      className="p-2 m-5 bg-white drop-shadow-lg rounded-md w-36 relative h-36 relative cursor-pointer"
    >
      <Image src={selectedImageUrl} alt="main cover image" className="p-5 rounded-[2rem]" style={hovered? { opacity: .3} : {}} fill={true}/>
      {hovered && <ClearOutlinedIcon className="absolute top-5 left-5 " sx={{ fontSize: 100, color: '#480000', fontWeight: '100' }}/>}
    </div>
  );
};
