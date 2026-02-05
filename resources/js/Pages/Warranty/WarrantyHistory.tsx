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
    Paper,
    Pagination,
    Dialog,
    Tabs,
    Tab,
} from "@mui/material";
import {
    CheckCircle,
    Search,
    InfoOutlined,
    ExpandMore,
    BuildOutlined,
    WarningAmber,
    Warning,
    CalendarToday,
    Inventory,
} from "@mui/icons-material";
import { useLanguage } from "@/context/LanguageContext";
import dayjs from "dayjs";
import { Head } from "@inertiajs/react";
import axios from "axios";

interface SpWarranty {
    spcode?: {
        pidsp?: string;
        pnamesp?: string;
    };
    spname?: string;
}

interface HistoryProps {
    id: number;
    serial_number?: string;
    model_code: string;
    model_name?: string;
    approval?: string;
    product_name?: string;
    slip?: string | null;
    insurance_expire?: string | null;
}

const productPathMaster = import.meta.env.VITE_PRODUCT_IMAGE_URI || "";
const DEFAULT_IMAGE = import.meta.env.VITE_DEFAULT_IMAGE || "";

function WarrantyDetail({ model_code }: { model_code: string }) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<any>(null);

    useEffect(() => {
        let mounted = true;
        const loadDetail = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/warranty/history/detail/${encodeURIComponent(model_code)}`);
                if (mounted && res.data && res.data.success) {
                    setDetail(res.data.data);
                }
            } catch (err) {
                console.error("Load detail failed:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadDetail();
        return () => {
            mounted = false;
        };
    }, [model_code]);

    if (loading)
        return (
            <Box display="flex" alignItems="center" gap={1} mt={2}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                    {t.History.Information.loading}
                </Typography>
            </Box>
        );

    if (!detail)
        return (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                {t.History.Information.noData}
            </Typography>
        );

    return (
        <Accordion
            sx={{
                mt: 2,
                bgcolor: "#fff8f6",
                border: "1px solid rgba(245, 73, 39, 0.2)",
                borderRadius: 2,
                "&:before": { display: "none" },
                boxShadow: "none",
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: "#F54927" }} />}
                sx={{
                    "& .MuiAccordionSummary-content": { my: 0 },
                    "&.Mui-expanded": { minHeight: 48 },
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <InfoOutlined sx={{ color: "#F54927", fontSize: 22 }} />
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                        {t.History.Information.warrantyInfo}
                    </Typography>
                </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, px: 1.5, pb: 1 }}>
                <Stack spacing={1}>
                    <Box display="flex" gap={1} alignItems="flex-start">
                        <CalendarToday sx={{ fontSize: 16, color: "text.secondary", mt: 0.1 }} />
                        <Box flex={1}>
                            {/* <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                {t.History.Information.DurationWaranty}: {detail.warrantyperiod ?? "-"} {t.History.Information.month}
                            </Typography> */}
                            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                                {t.History.Information.DurationWaranty}: {detail.warrantyperiod ?? "-"} {t.History.Information.month}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    <Box>
                        {/* <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
                            {t.History.Information.condition}:
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line", pl: 2 }}>
                            {detail.warrantycondition ?? "-"}
                        </Typography> */}
                        <Typography variant="body2" fontSize="0.8rem" color="text.secondary">
                            {t.History.Information.condition}: {detail.warrantycondition ?? "-"}
                        </Typography>
                    </Box>

                    <Box>
                        {/* <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
                            {t.History.Information.noteWaranty}:
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line", pl: 2 }}>
                            {detail.warrantynote ?? "-"}
                        </Typography> */}
                        <Typography variant="body2" fontSize="0.8rem" color="text.secondary">
                            {t.History.Information.noteWaranty}: {detail.warrantynote ?? "-"}
                        </Typography>
                    </Box>
                </Stack>

                {/* {Array.isArray(detail.sp_warranty) && detail.sp_warranty.length > 0 && (
                    <Accordion
                        sx={{
                            mt: 2,
                            bgcolor: "white",
                            "&:before": { display: "none" },
                            boxShadow: 0,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            sx={{
                                minHeight: 48,
                                "&.Mui-expanded": { minHeight: 48 },
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center">
                                <BuildOutlined sx={{ fontSize: 20, color: "primary.main" }} />
                                <Typography variant="body2" fontWeight={600}>
                                    {t.History.Information.spareWarranty}
                                </Typography>
                                <Chip label={detail.sp_warranty.length} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0 }}>
                            <List dense disablePadding>
                                {detail.sp_warranty.map((sp: SpWarranty, idx: number) => (
                                    <React.Fragment key={idx}>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={sp.spname}
                                                secondary={`${t.History.Information.spareCode}: ${sp.spcode?.pidsp ?? "-"}`}
                                                primaryTypographyProps={{
                                                    variant: "body2",
                                                    fontWeight: 500,
                                                }}
                                                secondaryTypographyProps={{
                                                    variant: "caption",
                                                    sx: { fontFamily: "monospace", color: "text.secondary" },
                                                }}
                                            />
                                        </ListItem>
                                        {idx < detail.sp_warranty.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                )} */}
            </AccordionDetails>
        </Accordion>
    );
}

const getWarrantyStatus = (item: HistoryProps, t: any) => {
    if (item.approval === "N") {
        return {
            icon: <WarningAmber />,
            label: t.History.Card.Warranty.isFalse,
            color: "error" as const,
        };
    }
    if (item.approval !== "Y") {
        return {
            icon: <Warning />,
            label: t.History.Card.Warranty.isChecking,
            color: "warning" as const,
        };
    }
    if (!item.insurance_expire) {
        return {
            icon: <WarningAmber />,
            label: t.History.Card.Warranty.NotFound,
            color: "default" as const,
        };
    }

    const isExpired = dayjs(item.insurance_expire).isBefore(dayjs(), "day");
    return {
        icon: isExpired ? <WarningAmber /> : <CheckCircle />,
        label: isExpired
            ? `${t.History.Card.Warranty.expired}\n${t.History.Card.Warranty.dayWaranty}: ${dayjs(
                item.insurance_expire
            ).format("YYYY-MM-DD")}`
            : `${t.History.Card.Warranty.isTrue}\n${t.History.Card.Warranty.warrantyTo}: ${dayjs(
                item.insurance_expire
            ).format("YYYY-MM-DD")}`,
        color: isExpired ? ("error" as const) : ("success" as const),
    };
};

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
}

/* 📱 Mobile Search Bar */
function SearchBarMobile({ value, onChange, placeholder }: SearchBarProps) {
    return (
        <Box
            sx={{
                position: "sticky",
                top: -8,
                zIndex: 30,
                bgcolor: "white",
                mt: 3,
                pt: 2,
                pb: 1,
            }}
        >
            <Container maxWidth="sm">
                <TextField
                    fullWidth
                    size="small"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
            </Container>
        </Box>
    );
}

/* 🖥 Desktop Search Bar */
function SearchBarDesktop({ value, onChange, placeholder, label }: SearchBarProps) {
    return (
        <Box
            sx={{
                position: "sticky", top: -8, // อยู่ด้านบนสุด 
                zIndex: 30, bgcolor: "white", borderColor: "divider", mt: 7, pt: 2, pb: 1,
            }}
        >
            <Container maxWidth="lg">
                <TextField
                    fullWidth
                    size="medium"
                    label={label}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
            </Container>
        </Box>
    );
}

export default function WarrantyHistory({ histories }: { histories: HistoryProps[] }) {
    const { t } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    // tabs
    type TabKey = "all" | "pending" | "in" | "expired" | "out";
    const [selectedTab, setSelectedTab] = useState<TabKey>("all");

    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleOpenImage = (url: string) => {
        setSelectedImage(url);
        setOpenImage(true);
    };

    const handleCloseImage = () => {
        setOpenImage(false);
        setSelectedImage(null);
    };

    // counts for tabs
    const counts = useMemo(() => {
        const total = histories.length;
        const pending = histories.filter((h) => (h.approval ?? "") !== "Y" && (h.approval ?? "") !== "N").length;
        const inWarranty = histories.filter(
            (h) =>
                (h.approval ?? "") === "Y" &&
                h.insurance_expire &&
                !dayjs(h.insurance_expire).isBefore(dayjs(), "day")
        ).length;
        const expired = histories.filter(
            (h) =>
                (h.approval ?? "") === "Y" &&
                h.insurance_expire &&
                dayjs(h.insurance_expire).isBefore(dayjs(), "day")
        ).length;
        const outOfWarranty = histories.filter(
            (h) =>
                // explicitly not covered OR approved but missing expiry (treated as not under warranty)
                (h.approval ?? "") === "N" ||
                ((h.approval ?? "") === "Y" && (!h.insurance_expire || h.insurance_expire === ""))
        ).length;
        return { total, pending, inWarranty, expired, outOfWarranty };
    }, [histories]);

    // filtered by tab, then apply searchTerm
    const filteredHistories = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        const byTab = histories.filter((item) => {
            if (selectedTab === "all") return true;
            if (selectedTab === "pending") return (item.approval ?? "") !== "Y" && (item.approval ?? "") !== "N";
            if (selectedTab === "in")
                return (
                    (item.approval ?? "") === "Y" &&
                    item.insurance_expire &&
                    !dayjs(item.insurance_expire).isBefore(dayjs(), "day")
                );
            if (selectedTab === "expired")
                return (
                    (item.approval ?? "") === "Y" &&
                    item.insurance_expire &&
                    dayjs(item.insurance_expire).isBefore(dayjs(), "day")
                );
            if (selectedTab === "out")
                return (
                    (item.approval ?? "") === "N" ||
                    ((item.approval ?? "") === "Y" && (!item.insurance_expire || item.insurance_expire === ""))
                );
            return true;
        });

        if (!search) return byTab;

        return byTab.filter((item) =>
            [item.serial_number ?? "", item.model_code ?? "", item.model_name ?? "", item.product_name ?? ""].some((f) =>
                f.toLowerCase().includes(search)
            )
        );
    }, [searchTerm, histories, selectedTab]);

    const paginatedHistories = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage;
        return filteredHistories.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredHistories, page]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedTab]);

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: TabKey) => {
        setSelectedTab(newValue);
    };

    return (
        <MobileAuthenticatedLayout title={t.History.title}>
            <Head title={t.History.title} />

            {/* 🔍 Search Bar - fixed ด้านบน */}
            {isMobile ? (
                <SearchBarMobile
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={t.History.Filter.Input.Placeholder}
                    label={t.History.Filter.Input.Label}
                />
            ) : (
                <SearchBarDesktop
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={t.History.Filter.Input.Placeholder}
                    label={t.History.Filter.Input.Label}
                />
            )}

            {/* Tabs (sticky แยกออกมา) */}
            <Box
                sx={{
                    position: "sticky",
                    top: "50px",
                    zIndex: 25,
                    background: `white`,
                    backdropFilter: "blur(2px)",
                    bgcolor: "white",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Container maxWidth={isMobile ? "sm" : "lg"} sx={{ py: 0 }}>
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons
                        allowScrollButtonsMobile
                        sx={{
                            // ทำให้ flex container ของ Tabs ชิดซ้าย และเพิ่มช่องว่างระหว่างแท็บเล็กน้อย
                            "& .MuiTabs-flexContainer": {
                                justifyContent: "flex-start",
                                gap: 1,
                                paddingLeft: 0,
                            },
                            "& .MuiTabs-indicator": {
                                height: 3,
                                borderRadius: 3,
                                backgroundColor: "#F54927",
                            },
                            // เลื่อนกลุ่มแท็บทั้งก้อนซ้ายขึ้นอีกนิด (ถ้าต้องการ)
                            ml: { xs: -1, sm: -2 },
                        }}
                    >
                        <Tab
                            value="all"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        ทั้งหมด
                                    </Typography>
                                    <Chip label={counts.total} size="small" sx={{ height: 22, fontSize: "0.7rem" }} />
                                </Stack>
                            }
                            sx={{ textTransform: "none", minWidth: 110 }}
                        />
                        <Tab
                            value="pending"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {/* รออนุมัติ */}
                                        {t.History.Card.Warranty.isChecking}
                                    </Typography>
                                    <Chip label={counts.pending} size="small" sx={{ height: 22, fontSize: "0.7rem" }} />
                                </Stack>
                            }
                            sx={{ textTransform: "none", minWidth: 120 }}
                        />
                        <Tab
                            value="in"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {/* อยู่ในประกัน */}
                                        {t.History.Card.Warranty.isTrue}
                                    </Typography>
                                    <Chip label={counts.inWarranty} size="small" sx={{ height: 22, fontSize: "0.7rem" }} />
                                </Stack>
                            }
                            sx={{ textTransform: "none", minWidth: 140 }}
                        />
                        <Tab
                            value="expired"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {/* หมดประกัน */}
                                        {t.History.Card.Warranty.expired}
                                    </Typography>
                                    <Chip label={counts.expired} size="small" sx={{ height: 22, fontSize: "0.7rem" }} />
                                </Stack>
                            }
                            sx={{ textTransform: "none", minWidth: 120 }}
                        />
                        <Tab
                            value="out"
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {t.History.Card.Warranty.isFalse}
                                    </Typography>
                                    <Chip label={counts.outOfWarranty} size="small" sx={{ height: 22, fontSize: "0.7rem" }} />
                                </Stack>
                            }
                            sx={{ textTransform: "none", minWidth: 160 }}
                        />
                    </Tabs>
                </Container>
            </Box>

            {/* 🧾 History List (scroll ได้เฉพาะส่วนนี้) */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    maxHeight: "calc(100vh - 150px)",
                    mt: 1,
                    mb: 2,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                }}
            >
                <Container maxWidth={isMobile ? "sm" : "lg"} sx={{ px: 2, py: 2 }}>
                    <Stack spacing={2}>
                        {paginatedHistories.length > 0 ? (
                            paginatedHistories.map((item) => {
                                const status = getWarrantyStatus(item, t);
                                return (
                                    <Card
                                        key={item.id}
                                        elevation={0}
                                        sx={{
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            transition: "all 0.2s ease-in-out",
                                            "&:hover": {
                                                transform: "translateY(-2px)",
                                                boxShadow: 2,
                                                borderColor: "primary.light",
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                            <Grid container spacing={1.5}>
                                                <Grid size={12}>
                                                    <Box
                                                        display="flex"
                                                        gap={1}
                                                        flexDirection="row"
                                                        flexWrap="wrap"
                                                        justifyContent={{ xs: "center", sm: "flex-start" }}
                                                    >
                                                        {/* Product Image */}
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                borderRadius: 2,
                                                                overflow: "hidden",
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                width: { xs: 70, sm: 80, md: 90 },
                                                                height: { xs: 70, sm: 80, md: 90 },
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        >
                                                            <img
                                                                src={`${productPathMaster}/${item.model_code}.jpg`}
                                                                onError={(e: any) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = DEFAULT_IMAGE;
                                                                }}
                                                                alt={`${item.model_name ?? ""} ${item.product_name ?? ""}`}
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover",
                                                                    display: "block",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() =>
                                                                    handleOpenImage(`${productPathMaster}/${item.model_code}.jpg`)
                                                                }
                                                            />
                                                        </Paper>

                                                        {/* Slip Image */}
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                borderRadius: 2,
                                                                overflow: "hidden",
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                width: { xs: 70, sm: 80, md: 90 },
                                                                height: { xs: 70, sm: 80, md: 90 },
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        >
                                                            <img
                                                                src={item.slip || DEFAULT_IMAGE}
                                                                alt="Receipt"
                                                                onError={(e: any) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = DEFAULT_IMAGE;
                                                                }}
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover",
                                                                    display: "block",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() => handleOpenImage(item.slip || DEFAULT_IMAGE)}
                                                            />
                                                        </Paper>
                                                    </Box>
                                                </Grid>

                                                {/* Product Info */}
                                                <Grid size={12}>
                                                    <Stack spacing={1.5}>
                                                        <Box>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    fontSize: "1rem",
                                                                    mb: 0.5,
                                                                    color: "text.primary",
                                                                }}
                                                            >
                                                                {item.model_code} {item.model_name ?? ""}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ mb: 1, fontSize: "0.8rem" }}
                                                            >
                                                                {item.product_name ?? ""}
                                                            </Typography>

                                                            <Chip
                                                                icon={status.icon}
                                                                label={status.label}
                                                                color={status.color}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    fontSize: "0.7rem",
                                                                    height: "auto",
                                                                    py: 0.5,
                                                                    whiteSpace: "pre-line",
                                                                    "& .MuiChip-label": {
                                                                        display: "block",
                                                                        whiteSpace: "pre-line",
                                                                    },
                                                                }}
                                                            />
                                                        </Box>

                                                        {/* Serial Number */}
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                p: 1,
                                                                bgcolor: "grey.50",
                                                                border: "1px solid",
                                                                borderColor: "divider",
                                                                borderRadius: 1.5,
                                                            }}
                                                        >
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Inventory sx={{ fontSize: 16, color: "text.secondary" }} />
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    fontWeight="500"
                                                                    sx={{ fontSize: "0.8rem" }}
                                                                >
                                                                    หมายเลขเครื่อง (S/N):
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontFamily: "monospace",
                                                                        fontWeight: 600,
                                                                        color: "primary.main",
                                                                        fontSize: "0.8rem",
                                                                    }}
                                                                >
                                                                    {item.serial_number ?? "-"}
                                                                </Typography>
                                                            </Stack>
                                                        </Paper>

                                                        {/* Warranty Detail Accordion */}
                                                        <WarrantyDetail model_code={item.model_code} />
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 6,
                                    textAlign: "center",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="body1" color="text.secondary">
                                    {t.History.NotMatchFound} "{searchTerm}"
                                </Typography>
                            </Paper>
                        )}
                    </Stack>
                    {filteredHistories.length > itemsPerPage && (
                        <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination
                                count={Math.ceil(filteredHistories.length / itemsPerPage)}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                size="small"
                            />
                        </Box>
                    )}
                </Container>
            </Box>
            {/* ✅ Dialog แสดงภาพขนาดใหญ่ */}
            <Dialog open={openImage} onClose={handleCloseImage} maxWidth="xs" fullWidth>
                <Box
                    sx={{
                        position: "relative",
                        bgcolor: "black",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 2,
                    }}
                >
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="preview"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "80vh",
                                borderRadius: 8,
                            }}
                        />
                    )}
                </Box>
            </Dialog>
        </MobileAuthenticatedLayout>
    );
}