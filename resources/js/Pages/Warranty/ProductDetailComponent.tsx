// import { useState, forwardRef, Ref } from "react";
// import { useLanguage } from "@/context/LanguageContext";
// import {
//     Box,
//     Card,
//     CardContent,
//     CardMedia,
//     Stack,
//     Typography,
//     Button,
//     Divider,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     IconButton,
//     Slide,
// } from "@mui/material";
// import { InfoOutlined, ExpandMore, Close } from "@mui/icons-material";
// import { theme } from "@/ThemeCustom";

// const Transition = forwardRef(function Transition(props: any, ref: Ref<unknown>) {
//     return <Slide direction="up" ref={ref} {...props} />;
// });

// export default function ProductDetailComponent({ productDetail }: { productDetail: any }) {
//     const { t } = useLanguage();

//     const [open, setOpen] = useState(false);

//     // ✅ ใช้ค่าจาก .env
//     const defaultImage = import.meta.env.VITE_DEFAULT_IMAGE;

//     // ✅ ใช้ข้อมูลจาก props โดยตรง ไม่ต้องดึง API ซ้ำ
//     const warrantyDetail = productDetail || {};

//     const imgSrc = warrantyDetail.image || warrantyDetail.p_path || defaultImage;
//     const name = warrantyDetail.pname || warrantyDetail.p_name || "-";
//     const model = warrantyDetail.fac_model || "-";
//     // const bgColor = warrantyDetail.warranty_status ? "#e8f5e9" : "#ffebee";
//     const bgColor = '#E8F5E9'

//     // ✅ รองรับหลายรูปแบบ key เช่น warrantyPeriod / warranty_period
//     const warrantyPeriod =
//         warrantyDetail.warrantyperiod ||
//         warrantyDetail.warranty_period ||
//         warrantyDetail.warrantyPeriod ||
//         "-";

//     const warrantyCondition =
//         warrantyDetail.warrantycondition ||
//         warrantyDetail.warranty_condition ||
//         warrantyDetail.warrantyCondition ||
//         "-";

//     const warrantyNote =
//         warrantyDetail.warrantynote ||
//         warrantyDetail.warranty_note ||
//         warrantyDetail.warrantyNote ||
//         "-";

//     return (
//         <>
//             <Card
//                 sx={{
//                     width: "100%",
//                     display: "flex",
//                     alignItems: "center",
//                     flexDirection: { xs: "column", sm: "row" },
//                     p: 2,
//                     borderRadius: 3,
//                     boxShadow: 3,
//                     backgroundColor: bgColor,
//                     transition: "transform 0.2s ease-in-out",
//                     "&:hover": { transform: "scale(1.01)" },
//                 }}
//             >
//                 {/* ✅ รูปสินค้า */}
//                 <Box
//                     sx={{
//                         position: "relative",
//                         width: 120,
//                         height: 120,
//                         borderRadius: 2,
//                         bgcolor: "#fff",
//                         overflow: "hidden",
//                     }}
//                 >
//                     <CardMedia
//                         component="img"
//                         src={imgSrc}
//                         alt={name}
//                         onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
//                             const target = e.currentTarget;
//                             target.onerror = null;
//                             target.src = defaultImage;
//                         }}
//                         sx={{
//                             width: "100%",
//                             height: "100%",
//                             objectFit: "contain",
//                             opacity: 0,
//                             transition: "opacity 0.5s ease-in-out",
//                             "&.loaded": { opacity: 1 },
//                         }}
//                         onLoad={(e: React.SyntheticEvent<HTMLImageElement>) =>
//                             e.currentTarget.classList.add("loaded")
//                         }
//                     />
//                 </Box>

//                 {/* ✅ รายละเอียดสินค้า */}
//                 <CardContent sx={{ flex: 1, width: "100%" }}>
//                     <Stack spacing={0.5}>
//                         <Typography variant="h6" fontWeight="bold" color="text.primary">
//                             {t.Warranty.Form.DetailPd}
//                         </Typography>

//                         <Typography variant="body2" color="text.secondary">
//                             <strong>{t.Warranty.Form.CodePd} :</strong> {warrantyDetail.pid} ({model})
//                         </Typography>

//                         <Typography variant="body2" color="text.secondary">
//                             <strong>{t.Warranty.Form.NamePd} :</strong> {name}
//                         </Typography>

//                         {/* ปุ่มเปิดรายละเอียดการรับประกัน */}
//                         <Button
//                             onClick={() => setOpen(true)}
//                             endIcon={<ExpandMore />}
//                             variant="text"
//                             sx={{
//                                 alignItems: "flex-start",
//                                 color: "#F54927",
//                                 fontWeight: 600,
//                                 textTransform: "none",
//                             }}
//                         >
//                             {t.History.Information.warrantyInfo}
//                         </Button>
//                     </Stack>
//                 </CardContent>
//             </Card>

//             {/* ✅ Dialog แสดงข้อมูลรับประกันจาก props */}
//             <Dialog
//                 open={open}
//                 onClose={() => setOpen(false)}
//                 fullWidth
//                 maxWidth="xs"
//                 scroll="paper"
//                 TransitionComponent={Transition}
//                 PaperProps={{ sx: { borderRadius: 3 } }}
//             >
//                 <DialogTitle sx={{ pr: 6 }}>
//                     <Stack direction="row" alignItems="center" spacing={1}>
//                         <InfoOutlined sx={{ color: "#F54927" }} />
//                         <Typography variant="subtitle1" fontWeight={700}>
//                             {t.History.Information.warrantyInfo}
//                         </Typography>
//                     </Stack>
//                     <IconButton
//                         aria-label="close"
//                         onClick={() => setOpen(false)}
//                         sx={{ position: "absolute", right: 12, top: 12 }}
//                     >
//                         <Close />
//                     </IconButton>
//                 </DialogTitle>

//                 <DialogContent dividers>
//                     <Stack spacing={1.2}>
//                         <Typography variant="body2" color="text.secondary">
//                             <strong>{t.History.Information.DurationWaranty}:</strong>{" "}
//                             {warrantyPeriod} {t.History.Information.month}
//                         </Typography>

//                         <Typography
//                             variant="body2"
//                             color="text.secondary"
//                             sx={{ whiteSpace: "pre-line" }}
//                         >
//                             <strong>{t.History.Information.condition}:</strong>{" "}
//                             {warrantyCondition}
//                         </Typography>

//                         <Typography
//                             variant="body2"
//                             color="text.secondary"
//                             sx={{ whiteSpace: "pre-line" }}
//                         >
//                             <strong>{t.History.Information.noteWaranty}:</strong>{" "}
//                             {warrantyNote}
//                         </Typography>

//                         {/* {warrantyDetail.sp_warranty?.length ? (
//                             <>
//                                 <Divider sx={{ my: 1.2 }} />
//                                 <Typography variant="subtitle2" fontWeight={700}>
//                                     {t.History.Information.spareWarranty} (
//                                     {warrantyDetail.sp_warranty.length}{" "}
//                                     {t.History.Information.items})
//                                 </Typography>
//                                 <Stack spacing={0.5}>
//                                     {warrantyDetail.sp_warranty.map((sp: any, i: number) => (
//                                         <Typography key={i} variant="body2" color="text.secondary">
//                                             • {sp.spname} ({sp.spcode?.pidsp ?? "-"})
//                                         </Typography>
//                                     ))}
//                                 </Stack>
//                             </>
//                         ) : null} */}
//                     </Stack>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }
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
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Slide,
} from "@mui/material";
import { InfoOutlined, ExpandMore, Close } from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";

const Transition = forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// ใช้ Type ProductDetail จาก global.d.ts แทน any
export default function ProductDetailComponent({ productDetail }: { productDetail: ProductDetail }) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);

    // ใช้ค่าจาก .env
    const defaultImage = import.meta.env.VITE_DEFAULT_IMAGE || "";

    const warrantyDetail = productDetail || {};

    // Logic จัดการรูปภาพ: รองรับทั้ง String และ Array (กรณี Combo Set บางทีส่งเป็น Array)
    let imgSrc = defaultImage;
    if (Array.isArray(warrantyDetail.image) && warrantyDetail.image.length > 0) {
        imgSrc = warrantyDetail.image[0];
    } else if (typeof warrantyDetail.image === 'string' && warrantyDetail.image) {
        imgSrc = warrantyDetail.image;
    } else if (warrantyDetail.p_path) {
        imgSrc = warrantyDetail.p_path;
    }

    const name = warrantyDetail.pname || warrantyDetail.p_name || "-";
    const model = warrantyDetail.fac_model || warrantyDetail.model_name || "-";

    // Hardcode สีเขียวอ่อนไว้ก่อน (สื่อว่าตรวจสอบผ่านแล้ว)
    const bgColor = '#E8F5E9';

    // รองรับหลายรูปแบบ key
    const warrantyPeriod =
        warrantyDetail.warrantyperiod ||
        // @ts-ignore (เผื่อบาง case เก่า)
        warrantyDetail.warranty_period ||
        // @ts-ignore
        warrantyDetail.warrantyPeriod ||
        "-";

    const warrantyCondition =
        warrantyDetail.warrantycondition ||
        // @ts-ignore
        warrantyDetail.warranty_condition ||
        // @ts-ignore
        warrantyDetail.warrantyCondition ||
        "-";

    const warrantyNote =
        warrantyDetail.warrantynote ||
        // @ts-ignore
        warrantyDetail.warranty_note ||
        // @ts-ignore
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
                    mb: 2, // เพิ่ม Margin ด้านล่างเผื่อกรณีมีหลายการ์ด (Combo)
                }}
            >
                {/* รูปสินค้า */}
                <Box
                    sx={{
                        position: "relative",
                        width: 120,
                        height: 120,
                        borderRadius: 2,
                        bgcolor: "#fff",
                        overflow: "hidden",
                        flexShrink: 0, // ไม่ให้รูปหดเวลามือถือจอเล็ก
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

                {/* รายละเอียดสินค้า */}
                <CardContent sx={{ flex: 1, width: "100%", pb: { xs: 2, sm: 2 } + "!important" }}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" fontSize="1rem">
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
                                alignItems: "center", // จัดให้อยู่กลางแนวตั้ง
                                justifyContent: "flex-start", // ชิดซ้าย
                                color: "#F54927",
                                fontWeight: 600,
                                textTransform: "none",
                                p: 0,
                                mt: 1,
                                minWidth: 0,
                                width: "fit-content"
                            }}
                        >
                            {t.History.Information.warrantyInfo}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Dialog แสดงข้อมูลรับประกัน */}
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
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
}