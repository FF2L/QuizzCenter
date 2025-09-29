import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
} from "@mui/material";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  questionName?:string
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  questionName
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Xác nhận xóa</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={0.5}>
        <Typography>Bạn có chắc chắn muốn xóa </Typography>
            <Typography sx={{fontWeight:"bold", color:"red"}}> {questionName}</Typography>
               <Typography> không ?</Typography>
               </Stack>
            
    
        


      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
