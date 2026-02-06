import { useState, forwardRef, Ref } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Stack,
    Typography,
    Button,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Slide,
} from "@mui/material";
import { InfoOutlined, ExpandMore, Close } from "@mui/icons-material";
import { theme } from "@/ThemeCustom";

const Transition = forwardRef(function Transition(props: any, ref: Ref<unknown>) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ProductDetailComponent({ productDetail }: { productDetail: any }) {
    const { t } = useLanguage();

    const [open, setOpen] = useState(false);

    // ✅ ใช้ค่าจาก .env
    const defaultImage = import.meta.env.VITE_DEFAULT_IMAGE;

    // ✅ ใช้ข้อมูลจาก props โดยตรง ไม่ต้องดึง API ซ้ำ
    const warrantyDetail = productDetail || {};

    const imgSrc = warrantyDetail.image || warrantyDetail.p_path || defaultImage;
    const name = warrantyDetail.pname || warrantyDetail.p_name || "-";
    const model = warrantyDetail.fac_model || "-";
    // const bgColor = warrantyDetail.warranty_status ? "#e8f5e9" : "#ffebee";
    const bgColor = '#E8F5E9'

    // ✅ รองรับหลายรูปแบบ key เช่น warrantyPeriod / warranty_period
    const warrantyPeriod =
        warrantyDetail.warrantyperiod ||
        warrantyDetail.warranty_period ||
        warrantyDetail.warrantyPeriod ||
        "-";

    const warrantyCondition =
        warrantyDetail.warrantycondition ||
        warrantyDetail.warranty_condition ||
        warrantyDetail.warrantyCondition ||
        "-";

    const warrantyNote =
        warrantyDetail.warrantynote ||
        warrantyDetail.warranty_note ||
        warrantyDetail.warrantyNote ||
        "-";

    return (
        <>
            <Card
                sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: { xs: "column", sm: "row" },
                    p: 2,
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: bgColor,
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.01)" },
                }}
            >
                {/* ✅ รูปสินค้า */}
                <Box
                    sx={{
                        position: "relative",
                        width: 120,
                        height: 120,
                        borderRadius: 2,
                        bgcolor: "#fff",
                        overflow: "hidden",
                    }}
                >
                    <CardMedia
                        component="img"
                        src={imgSrc}
                        alt={name}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = defaultImage;
                        }}
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            opacity: 0,
                            transition: "opacity 0.5s ease-in-out",
                            "&.loaded": { opacity: 1 },
                        }}
                        onLoad={(e: React.SyntheticEvent<HTMLImageElement>) =>
                            e.currentTarget.classList.add("loaded")
                        }
                    />
                </Box>

                {/* ✅ รายละเอียดสินค้า */}
                <CardContent sx={{ flex: 1, width: "100%" }}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                            {t.Warranty.Form.DetailPd}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            <strong>{t.Warranty.Form.CodePd} :</strong> {warrantyDetail.pid} ({model})
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            <strong>{t.Warranty.Form.NamePd} :</strong> {name}
                        </Typography>

                        {/* ปุ่มเปิดรายละเอียดการรับประกัน */}
                        <Button
                            onClick={() => setOpen(true)}
                            endIcon={<ExpandMore />}
                            variant="text"
                            sx={{
                                alignItems: "flex-start",
                                color: "#F54927",
                                fontWeight: 600,
                                textTransform: "none",
                            }}
                        >
                            {t.History.Information.warrantyInfo}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* ✅ Dialog แสดงข้อมูลรับประกันจาก props */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="xs"
                scroll="paper"
                TransitionComponent={Transition}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pr: 6 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <InfoOutlined sx={{ color: "#F54927" }} />
                        <Typography variant="subtitle1" fontWeight={700}>
                            {t.History.Information.warrantyInfo}
                        </Typography>
                    </Stack>
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpen(false)}
                        sx={{ position: "absolute", right: 12, top: 12 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={1.2}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>{t.History.Information.DurationWaranty}:</strong>{" "}
                            {warrantyPeriod} {t.History.Information.month}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: "pre-line" }}
                        >
                            <strong>{t.History.Information.condition}:</strong>{" "}
                            {warrantyCondition}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: "pre-line" }}
                        >
                            <strong>{t.History.Information.noteWaranty}:</strong>{" "}
                            {warrantyNote}
                        </Typography>

                        {/* {warrantyDetail.sp_warranty?.length ? (
                            <>
                                <Divider sx={{ my: 1.2 }} />
                                <Typography variant="subtitle2" fontWeight={700}>
                                    {t.History.Information.spareWarranty} (
                                    {warrantyDetail.sp_warranty.length}{" "}
                                    {t.History.Information.items})
                                </Typography>
                                <Stack spacing={0.5}>
                                    {warrantyDetail.sp_warranty.map((sp: any, i: number) => (
                                        <Typography key={i} variant="body2" color="text.secondary">
                                            • {sp.spname} ({sp.spcode?.pidsp ?? "-"})
                                        </Typography>
                                    ))}
                                </Stack>
                            </>
                        ) : null} */}
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
}
