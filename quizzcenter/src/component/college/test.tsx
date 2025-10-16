import { Box } from "@mui/material";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { BaiKiemTraApi } from "../../api/bai-kiem-tra.api";


const CollegeTest: React.FC = () => {
    const { idLopHocPhan } = useParams<{ idLopHocPhan: string }>();

return(
    <Box>dfgg</Box>
)
}

export default CollegeTest;