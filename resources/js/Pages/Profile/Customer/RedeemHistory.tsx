import {
    Box,
    Divider,
    Stack,
    Typography,
    Tabs,
    Tab,
    Select,
    MenuItem,
    IconButton,
    useMediaQuery,
    useTheme,
    Pagination,
} from "@mui/material";
import { ArrowDownward } from "@mui/icons-material";
import { useState, useMemo } from "react";
import dayjs from "dayjs";

interface RedeemItem {
    pid: string;
    pname: string;
    point_tran: number;
    trandate: string;
    point_before?: number;
    point_after?: number;
    tier?: string | null;
    transaction_type?: string; // earn / redeem
}

interface RedeemHistoryProps {
    data: RedeemItem[];
}

export default function RedeemHistory({ data }: RedeemHistoryProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [tab, setTab] = useState(0);
    const [sort, setSort] = useState("desc");
    const [year, setYear] = useState("ทั้งหมด");

    // 🔹 Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = isMobile ? 7 : 12;

    // ✅ ปีที่มีในข้อมูล
    const availableYears = useMemo(() => {
        const years = Array.from(new Set(data.map((d) => dayjs(d.trandate).year()))).sort(
            (a, b) => b - a
        );
        return ["ทั้งหมด", ...years.map(String)];
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <Typography variant="body2" sx={{ color: "#999", mt: 3, ml: 3 }}>
                ยังไม่มีประวัติการทำรายการ
            </Typography>
        );
    }

    // ✅ Filter ตาม tab
    const filteredByType =
        tab === 1
            ? data.filter((d) => d.point_tran > 0)
            : tab === 2
                ? data.filter((d) => d.point_tran < 0)
                : data;

    // ✅ Filter ตามปี
    const filteredByYear =
        year === "ทั้งหมด"
            ? filteredByType
            : filteredByType.filter(
                (d) => dayjs(d.trandate).year().toString() === year
            );

    // ✅ Sort ตามวันที่
    const sorted = [...filteredByYear].sort((a, b) => {
        const da = dayjs(a.trandate);
        const db = dayjs(b.trandate);
        return sort === "desc" ? db.diff(da) : da.diff(db);
    });

    // ✅ Pagination slice
    const totalPages = Math.ceil(sorted.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const visibleItems = sorted.slice(startIndex, startIndex + rowsPerPage);

    // ✅ Reset หน้าเมื่อเปลี่ยน filter
    const resetPage = () => setCurrentPage(1);

    // เมื่อเปลี่ยน tab, ปี หรือ sort ให้กลับไปหน้าแรก
    const handleTabChange = (_: any, v: number) => {
        setTab(v);
        resetPage();
    };

    const handleYearChange = (e: any) => {
        setYear(e.target.value);
        resetPage();
    };

    const handleSortChange = (e: any) => {
        setSort(e.target.value);
        resetPage();
    };

    return (
        // <Box sx={{ mt: 2, px: isMobile ? 1 : 2, overflowX: "hidden" }}>
        <Box
            sx={{
                mt: 1,
                px: isMobile ? 1 : 2,
                overflowX: "hidden",
                overflowY: "auto",     
                maxHeight: "calc(100vh - 180px)", 
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                    width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(0,0,0,0.2)",
                    borderRadius: "4px",
                },
            }}
        >
            {/* 🔹 Tabs */}
            <Tabs
                value={tab}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
                sx={{
                    mb: 1.5,
                    "& .MuiTab-root": {
                        fontWeight: 700,
                        fontSize: isMobile ? 13 : 14,
                        textTransform: "none",
                        color: "#777",
                        px: isMobile ? 1 : 2,
                    },
                    "& .Mui-selected": { color: "#FF7B00" },
                    "& .MuiTabs-indicator": {
                        backgroundColor: "#FF7B00",
                        height: 3,
                        borderRadius: 3,
                    },
                }}
            >
                <Tab label="ทั้งหมด" />
                <Tab label="ได้รับ" />
                <Tab label="ใช้ไป" />
            </Tabs>

            {/* 🔸 Filter */}
            <Stack
                direction={isMobile ? "column" : "row"}
                alignItems="center"
                spacing={isMobile ? 1 : 1}
                sx={{ mb: 1, px: isMobile ? 0 : 1 }}
            >
                <Select
                    fullWidth={isMobile}
                    size="small"
                    value={year}
                    onChange={handleYearChange}
                    sx={{
                        flex: 1,
                        fontSize: 13,
                        height: 36,
                        borderRadius: 2,
                        border: "1px solid #E0E0E0",
                        bgcolor: "#FFF",
                        "& .MuiSelect-select": { py: 0.8, pl: 1 },
                        "& fieldset": { border: "none" },
                    }}
                >
                    {availableYears.map((y) => (
                        <MenuItem key={y} value={y}>
                            {y}
                        </MenuItem>
                    ))}
                </Select>

                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ width: isMobile ? "100%" : "auto" }}
                >
                    <Select
                        fullWidth={isMobile}
                        size="small"
                        value={sort}
                        onChange={handleSortChange}
                        sx={{
                            flex: 1,
                            fontSize: 13,
                            height: 36,
                            borderRadius: 2,
                            border: "1px solid #E0E0E0",
                            bgcolor: "#FFF",
                            "& .MuiSelect-select": { py: 0.8, pl: 1 },
                            "& fieldset": { border: "none" },
                            
                        }}
                    >
                        <MenuItem value="desc">เรียงจากล่าสุด</MenuItem>
                        <MenuItem value="asc">เรียงจากเก่าก่อน</MenuItem>
                    </Select>

                    <IconButton
                        size="small"
                        sx={{
                            color: "#FF7B00",
                            "&:hover": { bgcolor: "rgba(255,123,0,0.08)" },
                            border: "1px solid #E0E0E0",
                            borderRadius: 2,
                            width: 36,
                            height: 36,
                        }}
                        onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
                    >
                        <ArrowDownward
                            sx={{
                                transform: sort === "asc" ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "0.3s",
                            }}
                        />
                    </IconButton>
                </Stack>
            </Stack>

            {/* 🔹 ส่วนหัว */}
            {!isMobile && (
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ px: 0, mb: 0.5, mt: 2 }}
                >
                    <Typography fontWeight={700} sx={{ color: "GrayText", flex: 1 }}>
                        รายการ
                    </Typography>
                    <Typography fontWeight={700} sx={{ color: "#333", width: 100, textAlign: "center" }}>
                        วันที่
                    </Typography>
                    <Typography fontWeight={700} sx={{ color: "#333", width: 100, textAlign: "right" }}>
                        จำนวน
                    </Typography>
                </Stack>
            )}
            <Divider sx={{ mb: 1.5 }} />

            {/* 🔸 แสดงรายการ */}
            {visibleItems.map((item, index) => {
                const isRedeem = item.point_tran < 0;
                const dateText = dayjs(item.trandate).format("DD/MM/YYYY");
                const pointText = `${isRedeem ? "-" : "+"}${Math.abs(
                    item.point_tran
                ).toLocaleString("th-TH")}`;
                const pointColor = isRedeem ? "#F55014" : "#222";
                const titleColor = isRedeem ? "#F55014" : "#000";

                return (
                    <Box
                        key={index}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "1fr 100px 100px",
                            alignItems: "center",
                            px: 0,
                            py: 0.75,
                            borderBottom:
                                index < visibleItems.length - 1 ? "1px solid #eee" : "none",
                        }}
                    >
                        <Typography
                            fontWeight={700}
                            sx={{
                                color: titleColor,
                                fontSize: isMobile ? 13 : 14,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {isRedeem ? `แลก ${item.pname}` : item.pname}
                        </Typography>

                        {!isMobile && (
                            <Typography
                                sx={{
                                    textAlign: "center",
                                    color: "#444",
                                    fontSize: 13,
                                }}
                            >
                                {dateText}
                            </Typography>
                        )}

                        <Typography
                            sx={{
                                textAlign: "right",
                                fontWeight: 700,
                                fontSize: 13.5,
                                color: pointColor,
                            }}
                        >
                            {pointText} คะแนน
                        </Typography>

                        {isMobile && (
                            <Typography
                                sx={{
                                    mt: 0.3,
                                    fontSize: 12,
                                    color: "#666",
                                    textAlign: "left",
                                }}
                            >
                                {dateText}
                            </Typography>
                        )}
                    </Box>
                );
            })}

            {/* 🔻 Pagination */}
            <Stack alignItems="center" sx={{ mt: 2, mb: 2 }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, val) => setCurrentPage(val)}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    siblingCount={isMobile ? 0 : 1}
                    boundaryCount={isMobile ? 1 : 2}
                />
            </Stack>
        </Box>
    );
}
