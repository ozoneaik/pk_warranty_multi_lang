// import React, { useState, useMemo } from "react";
// import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
// import {
//     Box,
//     Card,
//     CardContent,
//     Stack,
//     Typography,
//     Chip,
//     Grid,
//     TextField,
//     InputAdornment,
//     Container,
//     useTheme,
//     useMediaQuery,
//     Accordion,
//     AccordionSummary,
//     AccordionDetails,
//     Divider,
//     List,
//     ListItem,
//     ListItemText,
// } from "@mui/material";
// import {
//     CheckCircle,
//     Cancel,
//     Search,
//     InfoOutlined,
//     ExpandMore,
//     BuildOutlined,
//     WarningAmber,
// } from "@mui/icons-material";
// import { useLanguage } from "@/context/LanguageContext";
// import dayjs from "dayjs";
// import { Head } from "@inertiajs/react";

// interface SpWarranty {
//     spcode: {
//         pidsp: string;
//         pnamesp: string;
//     };
//     spname: string;
// }

// interface Sp {
//     spcode: string;
//     spname: string;
//     stdprice_per_unit: string;
//     price_per_unit: string;
//     spunit: string;
//     warranty: string;
// }

// interface ListBehavior {
//     catalog: string;
//     subcatalog: string;
//     behaviorname: string;
//     causecode: string;
//     causename: string;
// }

// interface HistoryProps {
//     id: number;
//     sn: string;
//     pid: string;
//     p_name: string;
//     status: boolean;
//     model_code: string;
//     model_name: string;
//     approval: string;
//     serial_number: string;
//     product_name: string;
//     slip: string;
//     insurance_expire: string;
//     warrantyperiod?: string;
//     warrantycondition?: string;
//     warrantynote?: string;
//     sp_warranty?: SpWarranty[];
//     sp?: Sp[];
//     listbehavior?: ListBehavior[];
// }

// const productPathMaster = import.meta.env.VITE_PRODUCT_IMAGE_URI;

// export default function WarrantyHistory({ histories }: { histories: HistoryProps[] }) {
//     console.log('Histories data:', histories);
//     const { t } = useLanguage();
//     const theme = useTheme();
//     const isMobile = useMediaQuery(theme.breakpoints.down("md"));
//     const [searchTerm, setSearchTerm] = useState("");

//     const filteredHistories = useMemo(() => {
//         const search = searchTerm.toLowerCase();
//         return histories.filter((item) => {
//             return (
//                 item.serial_number?.toLowerCase().includes(search) ||
//                 item.model_code?.toLowerCase().includes(search) ||
//                 item.model_name?.toLowerCase().includes(search) ||
//                 item.product_name?.toLowerCase().includes(search)
//             );
//         });
//     }, [searchTerm, histories]);

//     return (
//         <MobileAuthenticatedLayout title={t.History.title}>
//             <Head title={t.History.title} />
//             <Container
//                 sx={{
//                     position: "sticky",
//                     top: 70,
//                     zIndex: 10,
//                     backgroundColor: "white",
//                     pb: 1,
//                 }}
//             >
//                 <TextField
//                     fullWidth
//                     size="small"
//                     placeholder={t.History.Filter.Input.Placeholder}
//                     label={t.History.Filter.Input.Label}
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     sx={{ mt: 2 }}
//                     slotProps={{
//                         input: {
//                             startAdornment: (
//                                 <InputAdornment position="start">
//                                     <Search />
//                                 </InputAdornment>
//                             ),
//                         },
//                     }}
//                 />
//             </Container>

//             <Container
//                 maxWidth={isMobile ? "sm" : "lg"}
//                 sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}
//             >
//                 <Grid container spacing={2}>
//                     <Grid size={12}>
//                         <Stack spacing={2.5}>
//                             {filteredHistories.length > 0 ? (
//                                 filteredHistories.map((item) => (
//                                     <Card
//                                         key={item.id}
//                                         elevation={2}
//                                         sx={{
//                                             borderRadius: 3,
//                                             overflow: "hidden",
//                                             transition: "transform 0.2s ease-in-out",
//                                             "&:hover": {
//                                                 transform: "translateY(-2px)",
//                                                 boxShadow: 3,
//                                             },
//                                         }}
//                                     >
//                                         <CardContent sx={{ padding: 3 }}>
//                                             <Box display="flex" gap={3} alignItems="flex-start">
//                                                 {/* รูปสินค้า */}
//                                                 <Stack spacing={1}>
//                                                     <Box
//                                                         sx={{
//                                                             borderRadius: 2,
//                                                             overflow: "hidden",
//                                                             boxShadow: 1,
//                                                             flexShrink: 0,
//                                                         }}
//                                                     >
//                                                         <img
//                                                             src={productPathMaster + `/${item.model_code}.jpg`}
//                                                             onError={(e: any) => {
//                                                                 e.target.src = import.meta.env.VITE_DEFAULT_IMAGE;
//                                                             }}
//                                                             alt={item.model_name + item.product_name}
//                                                             width={90}
//                                                             height={90}
//                                                             style={{
//                                                                 objectFit: "cover",
//                                                                 display: "block",
//                                                             }}
//                                                         />
//                                                     </Box>
//                                                     <Box
//                                                         sx={{
//                                                             borderRadius: 2,
//                                                             overflow: "hidden",
//                                                             boxShadow: 1,
//                                                             flexShrink: 0,
//                                                         }}
//                                                     >
//                                                         <img
//                                                             src={item.slip}
//                                                             alt={item.model_name + item.product_name}
//                                                             width={90}
//                                                             height={90}
//                                                             style={{
//                                                                 objectFit: "cover",
//                                                                 display: "block",
//                                                             }}
//                                                             onError={(e: any) => {
//                                                                 e.target.src = import.meta.env.VITE_DEFAULT_IMAGE;
//                                                             }}
//                                                         />
//                                                     </Box>
//                                                 </Stack>

//                                                 {/* ข้อมูลสินค้า */}
//                                                 <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
//                                                     <Typography
//                                                         variant="h6"
//                                                         sx={{
//                                                             fontWeight: 600,
//                                                             fontSize: "1rem",
//                                                             lineHeight: 1.3,
//                                                             color: "text.primary",
//                                                         }}
//                                                     >
//                                                         {item.model_code} {item.model_name} {item.product_name}
//                                                     </Typography>

//                                                     {/* S/N และรหัสสินค้า */}
//                                                     <Stack spacing={0.5}>
//                                                         <Box display="flex" alignItems="center" gap={1}>
//                                                             <Typography
//                                                                 variant="body2"
//                                                                 sx={{
//                                                                     color: "text.secondary",
//                                                                     fontWeight: 500,
//                                                                     minWidth: "fit-content",
//                                                                 }}
//                                                             >
//                                                                 {t.History.Card.SerialNumber} :
//                                                             </Typography>
//                                                             <Typography
//                                                                 variant="body2"
//                                                                 sx={{
//                                                                     fontFamily: "monospace",
//                                                                     backgroundColor: "grey.100",
//                                                                     padding: "2px 6px",
//                                                                     borderRadius: 1,
//                                                                     fontSize: "0.8rem",
//                                                                 }}
//                                                             >
//                                                                 {item.serial_number}
//                                                             </Typography>
//                                                         </Box>

//                                                         <Box display="flex" alignItems="center" gap={1}>
//                                                             <Typography
//                                                                 variant="body2"
//                                                                 sx={{
//                                                                     color: "text.secondary",
//                                                                     fontWeight: 500,
//                                                                     minWidth: "fit-content",
//                                                                 }}
//                                                             >
//                                                                 {t.History.Card.ProductCode}
//                                                             </Typography>
//                                                             <Typography
//                                                                 variant="body2"
//                                                                 sx={{
//                                                                     fontFamily: "monospace",
//                                                                     backgroundColor: "grey.100",
//                                                                     padding: "2px 6px",
//                                                                     borderRadius: 1,
//                                                                     fontSize: "0.8rem",
//                                                                 }}
//                                                             >
//                                                                 {item.model_code} {item.model_name}
//                                                             </Typography>
//                                                         </Box>
//                                                     </Stack>

//                                                     {/* ข้อมูลการรับประกัน */}
//                                                     {(item.warrantyperiod || item.warrantycondition || item.warrantynote) && (
//                                                         <Box
//                                                             sx={{
//                                                                 mt: 1.5,
//                                                                 p: 1.5,
//                                                                 bgcolor: "#fff5f3",
//                                                                 borderRadius: 2,
//                                                                 borderLeft: "4px solid #F54927",
//                                                             }}
//                                                         >
//                                                             <Stack direction="row" alignItems="center" spacing={1} mb={1}>
//                                                                 <InfoOutlined sx={{ color: "#F54927", fontSize: 20 }} />
//                                                                 <Typography
//                                                                     variant="subtitle2"
//                                                                     fontWeight="bold"
//                                                                     color="text.primary"
//                                                                 >
//                                                                     {t.History.Information.warrantyInfo}
//                                                                 </Typography>
//                                                             </Stack>

//                                                             <Stack spacing={0.5}>
//                                                                 <Typography variant="body2" color="text.secondary">
//                                                                     <strong>{t.History.Information.DurationWaranty}:</strong>{" "}
//                                                                     {item.warrantyperiod ?? "-"} {t.History.Information.month}
//                                                                 </Typography>

//                                                                 <Typography
//                                                                     variant="body2"
//                                                                     color="text.secondary"
//                                                                     sx={{ whiteSpace: "pre-line" }}
//                                                                 >
//                                                                     <strong>{t.History.Information.condition}:</strong>{" "}
//                                                                     {item.warrantycondition ?? "-"}
//                                                                 </Typography>

//                                                                 <Typography
//                                                                     variant="body2"
//                                                                     color="text.secondary"
//                                                                     sx={{ whiteSpace: "pre-line" }}
//                                                                 >
//                                                                     <strong>{t.History.Information.noteWaranty}:</strong>{" "}
//                                                                     {item.warrantynote ?? "-"}
//                                                                 </Typography>
//                                                             </Stack>
//                                                         </Box>
//                                                     )}

//                                                     {/* อะไหล่ที่รับประกัน */}
//                                                     {item.sp_warranty && item.sp_warranty.length > 0 && (
//                                                         <Accordion sx={{ mt: 1 }}>
//                                                             <AccordionSummary expandIcon={<ExpandMore />}>
//                                                                 <Stack direction="row" spacing={1} alignItems="center">
//                                                                     <BuildOutlined sx={{ fontSize: 18, color: "primary.main" }} />
//                                                                     <Typography variant="body2" fontWeight="600">
//                                                                         อะไหล่ที่รับประกัน ({item.sp_warranty.length} รายการ)
//                                                                     </Typography>
//                                                                 </Stack>
//                                                             </AccordionSummary>
//                                                             <AccordionDetails>
//                                                                 <List dense>
//                                                                     {item.sp_warranty.map((sp, idx) => (
//                                                                         <React.Fragment key={sp.spcode.pidsp}>
//                                                                             <ListItem>
//                                                                                 <ListItemText
//                                                                                     primary={sp.spname}
//                                                                                     secondary={`รหัส: ${sp.spcode.pidsp}`}
//                                                                                     primaryTypographyProps={{
//                                                                                         variant: "body2",
//                                                                                         fontWeight: 500,
//                                                                                     }}
//                                                                                     secondaryTypographyProps={{
//                                                                                         variant: "caption",
//                                                                                         sx: { fontFamily: "monospace" },
//                                                                                     }}
//                                                                                 />
//                                                                             </ListItem>
//                                                                             {idx < item.sp_warranty!.length - 1 && <Divider />}
//                                                                         </React.Fragment>
//                                                                     ))}
//                                                                 </List>
//                                                             </AccordionDetails>
//                                                         </Accordion>
//                                                     )}

//                                                     {/* สถานะรับประกัน */}
//                                                     <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
//                                                         <Chip
//                                                             icon={
//                                                                 item?.approval !== "Y"
//                                                                     ? <Cancel />
//                                                                     : dayjs(item.insurance_expire).isBefore(dayjs(), "day")
//                                                                         ? <WarningAmber />
//                                                                         : <CheckCircle />
//                                                             }
//                                                             label={
//                                                                 item?.approval !== "Y"
//                                                                     ? t.History.Card.Warranty.isFalse
//                                                                     : !item.insurance_expire
//                                                                         ? t.History.Card.Warranty.NotFound
//                                                                         : dayjs(item.insurance_expire).isBefore(dayjs(), "day")
//                                                                             ? t.History.Card.Warranty.expired + ' (' + t.History.Card.Warranty.dayWaranty + `: ${dayjs(item.insurance_expire).format("YYYY-MM-DD")})`
//                                                                             : t.History.Card.Warranty.isTrue + ' (' + t.History.Card.Warranty.warrantyTo + `: ${dayjs(item.insurance_expire).format("YYYY-MM-DD")})`
//                                                             }
//                                                             color={
//                                                                 item?.approval !== "Y"
//                                                                     ? "error"
//                                                                     : !item.insurance_expire
//                                                                         ? "default"
//                                                                         : dayjs(item.insurance_expire).isBefore(dayjs(), "day")
//                                                                             ? "error"
//                                                                             : "success"
//                                                             }
//                                                             variant="filled"
//                                                             size="small"
//                                                             sx={{
//                                                                 fontWeight: 600,
//                                                                 fontSize: "0.75rem",
//                                                                 height: "auto",
//                                                                 lineHeight: 1.4,
//                                                                 whiteSpace: "pre-line",
//                                                                 py: 0.5,
//                                                             }}
//                                                         />
//                                                     </Stack>
//                                                 </Stack>
//                                             </Box>
//                                         </CardContent>
//                                     </Card>
//                                 ))
//                             ) : (
//                                 <Typography variant="body2" color="text.secondary" textAlign="center">
//                                     {t.History.NotMatchFound} "{searchTerm}"
//                                 </Typography>
//                             )}
//                         </Stack>
//                     </Grid>
//                 </Grid>
//             </Container>
//         </MobileAuthenticatedLayout>
//     );
// }

import React, { useState, useMemo, useEffect } from "react";
import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    Chip,
    Grid,
    TextField,
    InputAdornment,
    Container,
    useTheme,
    useMediaQuery,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
} from "@mui/material";
import {
    CheckCircle,
    Cancel,
    Search,
    InfoOutlined,
    ExpandMore,
    BuildOutlined,
    WarningAmber,
    Warning,
} from "@mui/icons-material";
import { useLanguage } from "@/context/LanguageContext";
import dayjs from "dayjs";
import { Head } from "@inertiajs/react";
import axios from "axios";

interface SpWarranty {
    spcode: {
        pidsp: string;
        pnamesp: string;
    };
    spname: string;
}

interface Sp {
    spcode: string;
    spname: string;
    stdprice_per_unit: string;
    price_per_unit: string;
    spunit: string;
    warranty: string;
}

interface ListBehavior {
    catalog: string;
    subcatalog: string;
    behaviorname: string;
    causecode: string;
    causename: string;
}

interface HistoryProps {
    id: number;
    serial_number: string;
    model_code: string;
    model_name: string;
    approval: string;
    product_name: string;
    slip: string;
    insurance_expire: string;
}

const productPathMaster = import.meta.env.VITE_PRODUCT_IMAGE_URI;

function WarrantyDetail({ model_code }: { model_code: string }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<any>(null);

    useEffect(() => {
        const loadDetail = async () => {
            try {
                const res = await axios.get(`/warranty/history/detail/${model_code}`);
                if (res.data.success) {
                    setDetail(res.data.data);
                }
            } catch (err) {
                console.error("Load detail failed:", err);
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [model_code]);

    if (loading)
        return (
            <Box display="flex" alignItems="center" gap={1} mt={1}>
                <CircularProgress size={16} />
                <Typography variant="caption">{t.History.Information.loading}</Typography>
            </Box>
        );

    if (!detail)
        return (
            <Typography variant="caption" color="text.secondary">
                {t.History.Information.noData}
            </Typography>
        );

    return (
        <Box
            sx={{
                mt: 1.5,
                p: 1.5,
                bgcolor: "#fff5f3",
                borderRadius: 2,
                borderLeft: "4px solid #F54927",
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <InfoOutlined sx={{ color: "#F54927", fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                    {t.History.Information.warrantyInfo}
                </Typography>
            </Stack>

            <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                    <strong>{t.History.Information.DurationWaranty}:</strong>{" "}
                    {detail.warrantyperiod ?? "-"} {t.History.Information.month}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-line" }}
                >
                    <strong>{t.History.Information.condition}:</strong>{" "}
                    {detail.warrantycondition ?? "-"}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-line" }}
                >
                    <strong>{t.History.Information.noteWaranty}:</strong>{" "}
                    {detail.warrantynote ?? "-"}
                </Typography>
            </Stack>

            {detail.sp_warranty?.length > 0 && (
                <Accordion sx={{ mt: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <BuildOutlined sx={{ fontSize: 18, color: "primary.main" }} />
                            <Typography variant="body2" fontWeight="600">
                                {t.History.Information.spareWarranty} (
                                {detail.sp_warranty.length} {t.History.Information.items})
                            </Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List dense>
                            {detail.sp_warranty.map((sp: SpWarranty, idx: number) => (
                                <React.Fragment key={idx}>
                                    <ListItem>
                                        <ListItemText
                                            primary={sp.spname}
                                            secondary={`${t.History.Information.spareCode}: ${sp.spcode?.pidsp ?? "-"
                                                }`}
                                            primaryTypographyProps={{
                                                variant: "body2",
                                                fontWeight: 500,
                                            }}
                                            secondaryTypographyProps={{
                                                variant: "caption",
                                                sx: { fontFamily: "monospace" },
                                            }}
                                        />
                                    </ListItem>
                                    {idx < detail.sp_warranty.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            )}
        </Box>
    );
}

// 🧩 Main Page
export default function WarrantyHistory({ histories }: { histories: HistoryProps[] }) {
    const { t } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [searchTerm, setSearchTerm] = useState("");

    const filteredHistories = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return histories.filter((item) =>
            [item.serial_number, item.model_code, item.model_name, item.product_name].some((f) =>
                f?.toLowerCase().includes(search)
            )
        );
    }, [searchTerm, histories]);

    return (
        <MobileAuthenticatedLayout title={t.History.title}>
            <Head title={t.History.title} />

            {/* 🔍 Search bar */}
            <Container
                sx={{
                    position: "sticky",
                    top: 70,
                    zIndex: 10,
                    backgroundColor: "white",
                    pb: 1,
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t.History.Filter.Input.Placeholder}
                    label={t.History.Filter.Input.Label}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mt: 2 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Container>

            {/* 🧾 History List */}
            <Container
                maxWidth={isMobile ? "sm" : "lg"}
                sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}
            >
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <Stack spacing={2.5}>
                            {filteredHistories.length > 0 ? (
                                filteredHistories.map((item) => (
                                    <Card
                                        key={item.id}
                                        elevation={2}
                                        sx={{
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            transition: "transform 0.2s ease-in-out",
                                            "&:hover": {
                                                transform: "translateY(-2px)",
                                                boxShadow: 3,
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ padding: 3 }}>
                                            <Box display="flex" gap={3} alignItems="flex-start">
                                                {/* รูปสินค้า */}
                                                <Stack spacing={1}>
                                                    <Box
                                                        sx={{
                                                            borderRadius: 2,
                                                            overflow: "hidden",
                                                            boxShadow: 1,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <img
                                                            src={`${productPathMaster}/${item.model_code}.jpg`}
                                                            onError={(e: any) => {
                                                                e.target.src =
                                                                    import.meta.env.VITE_DEFAULT_IMAGE;
                                                            }}
                                                            alt={item.model_name + item.product_name}
                                                            width={90}
                                                            height={90}
                                                            style={{
                                                                objectFit: "cover",
                                                                display: "block",
                                                            }}
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            borderRadius: 2,
                                                            overflow: "hidden",
                                                            boxShadow: 1,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <img
                                                            src={item.slip}
                                                            alt={item.model_name + item.product_name}
                                                            width={90}
                                                            height={90}
                                                            style={{
                                                                objectFit: "cover",
                                                                display: "block",
                                                            }}
                                                            onError={(e: any) => {
                                                                e.target.src =
                                                                    import.meta.env.VITE_DEFAULT_IMAGE;
                                                            }}
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </Box>
                                                </Stack>

                                                {/* ข้อมูลสินค้า */}
                                                <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: "1rem",
                                                            lineHeight: 1.3,
                                                            color: "text.primary",
                                                        }}
                                                    >
                                                        {item.model_code} {item.model_name}{" "}
                                                        {item.product_name}
                                                    </Typography>

                                                    {/* Serial Number */}
                                                    <Stack spacing={0.5}>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: "text.secondary",
                                                                    fontWeight: 500,
                                                                    minWidth: "fit-content",
                                                                }}
                                                            >
                                                                {t.History.Card.SerialNumber}:
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontFamily: "monospace",
                                                                    backgroundColor: "grey.100",
                                                                    padding: "2px 6px",
                                                                    borderRadius: 1,
                                                                    fontSize: "0.8rem",
                                                                }}
                                                            >
                                                                {item.serial_number}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>

                                                    {/* Lazy warranty detail */}
                                                    <WarrantyDetail model_code={item.model_code} />

                                                    {/* Warranty status */}
                                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                        <Chip
                                                            icon={
                                                                item?.approval !== "Y"
                                                                    ? <Warning />
                                                                    : dayjs(item.insurance_expire).isBefore(dayjs(), "day")
                                                                        ? <WarningAmber />
                                                                        : <CheckCircle />
                                                            }
                                                            label={
                                                                item?.approval !== "Y" ? (
                                                                    "อยู่ระหว่างการตรวจสอบ"
                                                                ) : !item.insurance_expire ? (
                                                                    t.History.Card.Warranty.NotFound
                                                                ) : dayjs(item.insurance_expire).isBefore(dayjs(), "day") ? (
                                                                    <>
                                                                        {t.History.Card.Warranty.expired}
                                                                        <br />
                                                                        {t.History.Card.Warranty.dayWaranty}:{" "}
                                                                        {dayjs(item.insurance_expire).format("YYYY-MM-DD")}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {t.History.Card.Warranty.isTrue}
                                                                        <br />
                                                                        {t.History.Card.Warranty.warrantyTo}:{" "}
                                                                        {dayjs(item.insurance_expire).format("YYYY-MM-DD")}
                                                                    </>
                                                                )
                                                            }
                                                            color={
                                                                item?.approval !== "Y"
                                                                    ? "warning"
                                                                    : !item.insurance_expire
                                                                        ? "default"
                                                                        : dayjs(item.insurance_expire).isBefore(dayjs(), "day")
                                                                            ? "error"
                                                                            : "success"
                                                            }
                                                            variant="filled"
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: "0.75rem",
                                                                height: "auto",
                                                                lineHeight: 1.4,
                                                                whiteSpace: "pre-line",
                                                                py: 0.5,
                                                            }}
                                                        />

                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    textAlign="center"
                                >
                                    {t.History.NotMatchFound} "{searchTerm}"
                                </Typography>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </MobileAuthenticatedLayout>
    );
}