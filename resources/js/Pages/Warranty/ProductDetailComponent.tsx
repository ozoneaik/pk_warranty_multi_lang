import { useState, forwardRef, ReactElement, Ref } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Stack,
    Typography,
    Button,
    CircularProgress,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Slide,
} from "@mui/material";
import { InfoOutlined, ExpandMore, ExpandLess, Close } from "@mui/icons-material";
import axios from "axios";

interface ProductDetail {
    pid: string;
    p_name: string;
    warranty_status: boolean;
    fac_model: string;
    p_path: string;
}

interface WarrantyInfo {
    warrantyperiod?: string;
    warrantycondition?: string;
    warrantynote?: string;
    sp_warranty?: {
        spname: string;
        spcode: { pidsp: string };
    }[];
}

const Transition = forwardRef(function Transition(
    props: any,
    ref: Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ProductDetailComponent({
    productDetail,
}: {
    productDetail: ProductDetail | any;
}) {
    const { t } = useLanguage();

    // dialog states
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [warrantyDetail, setWarrantyDetail] = useState<WarrantyInfo | null>(null);
    const [loadedOnce, setLoadedOnce] = useState(false);

    const openDialog = async () => {
        setOpen(true);

        // โหลดข้อมูลครั้งแรกเท่านั้น
        if (!loadedOnce) {
            setLoading(true);
            try {
                const res = await axios.get(`/warranty/history/detail/${productDetail.pid}`);
                if (res.data?.success) {
                    setWarrantyDetail(res.data.data);
                } else {
                    setWarrantyDetail(null);
                }
            } catch (e) {
                console.error("Load warranty detail failed:", e);
                setWarrantyDetail(null);
            } finally {
                setLoading(false);
                setLoadedOnce(true);
            }
        }
    };

    const closeDialog = () => setOpen(false);

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
                    backgroundColor: productDetail.warranty_status ? "#e8f5e9" : "#ffebee",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.01)" },
                }}
            >
                {/* รูปสินค้า */}
                <CardMedia
                    component="img"
                    sx={{
                        width: 120,
                        height: 120,
                        objectFit: "contain",
                        borderRadius: 2,
                        bgcolor: "#fff",
                    }}
                    image={productDetail.p_path}
                    alt={productDetail.p_name}
                />

                {/* รายละเอียดสินค้า */}
                <CardContent sx={{ flex: 1, width: "100%" }}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                            {t.Warranty.Form.DetailPd}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            <strong>{t.Warranty.Form.CodePd} :</strong> {productDetail.pid} ({productDetail.fac_model})
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            <strong>{t.Warranty.Form.NamePd} :</strong> {productDetail.p_name}
                        </Typography>

                        {/* ปุ่มเปิดป๊อปอัพข้อมูลการรับประกัน */}
                        <Button
                            onClick={openDialog}
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

            {/* Dialog แสดงข้อมูลการรับประกัน */}
            <Dialog
                open={open}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
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
                        onClick={closeDialog}
                        sx={{ position: "absolute", right: 12, top: 12 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {loading ? (
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <CircularProgress size={18} />
                            <Typography variant="body2">{t.History.Information.loading}</Typography>
                        </Box>
                    ) : warrantyDetail ? (
                        <Stack spacing={1.2}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>{t.History.Information.DurationWaranty}:</strong>{" "}
                                {warrantyDetail.warrantyperiod ?? "-"} {t.History.Information.month}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                                <strong>{t.History.Information.condition}:</strong>{" "}
                                {warrantyDetail.warrantycondition ?? "-"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                                <strong>{t.History.Information.noteWaranty}:</strong>{" "}
                                {warrantyDetail.warrantynote ?? "-"}
                            </Typography>

                            {warrantyDetail.sp_warranty?.length ? (
                                <>
                                    <Divider sx={{ my: 1.2 }} />
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        {t.History.Information.spareWarranty} ({warrantyDetail.sp_warranty.length} {t.History.Information.items})
                                    </Typography>
                                    <Stack spacing={0.5}>
                                        {warrantyDetail.sp_warranty.map((sp, i) => (
                                            <Typography key={i} variant="body2" color="text.secondary">
                                                • {sp.spname} ({sp.spcode?.pidsp ?? "-"})
                                            </Typography>
                                        ))}
                                    </Stack>
                                </>
                            ) : null}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            {t.History.Information.noData}
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
