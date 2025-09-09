import { Dialog, DialogContent } from "@mui/material";

export function PreviewFileUpload(props: PreviewFileUploadProps) {
    const { open, setOpen,preview } = props;

    const handleOnClose = () => {
        setOpen(false);
    }
    return (
        <Dialog open={open} onClose={handleOnClose}>
            <DialogContent>
                <img
                    src={preview}
                    alt="ไม่พร้อมใช้งานในขณะนี้"
                />
            </DialogContent>
        </Dialog>
    )
}