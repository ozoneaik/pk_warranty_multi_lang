import { Dialog, DialogContent } from "@mui/material";
export default function ExampleWarrantyFile(props : ExampleWarrantyFileProps) {
    const { open, setOpen } = props;

    const handleOnClose = () => {
        setOpen(false);
    }
    return (
        <Dialog open={open} onClose={handleOnClose}>
            <DialogContent>
                <img
                    src="https://images.pumpkin.tools/pumpkinWarranty.jpeg"
                    alt="ไม่พร้อมใช้งานในขณะนี้"
                />
            </DialogContent>
        </Dialog>
    )
}