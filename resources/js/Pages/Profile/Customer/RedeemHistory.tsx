// // import {
// //     Box,
// //     Divider,
// //     Stack,
// //     Typography,
// //     Tabs,
// //     Tab,
// //     Select,
// //     MenuItem,
// //     IconButton,
// //     useMediaQuery,
// //     useTheme,
// //     Pagination,
// //     Card,
// //     CardContent,
// //     Chip,
// // } from "@mui/material";
// // import { ArrowDownward, ContentCopy, EventBusy } from "@mui/icons-material";
// // import { useState, useMemo } from "react";
// // import dayjs from "dayjs";
// // import Swal from "sweetalert2";
// // import { QRCodeSVG } from "qrcode.react";
// // import CloseIcon from "@mui/icons-material/Close";
// // import QrCode2Icon from '@mui/icons-material/QrCode2';
// // import { Dialog, DialogContent } from "@mui/material";

// // interface RedeemItem {
// //     id: number;
// //     pid: string;
// //     pname: string;
// //     point_tran: number;
// //     trandate: string;
// //     transaction_type?: string;
// //     product_type?: string;
// //     redeem_code?: string;
// //     coupon_status?: 'active' | 'used' | 'expired';
// //     coupon_expired_at?: string;
// //     coupon_created_at?: string;
// // }

// // interface OrderItem {
// //     id: number;
// //     order_number: string;
// //     product_name: string;
// //     status: string;
// //     tracking_number: string | null;
// //     created_at: string;
// //     points_redeemed: number;
// // }

// // interface RedeemHistoryProps {
// //     data: RedeemItem[];
// //     orders?: OrderItem[];
// // }

// // export default function RedeemHistory({ data = [] }: RedeemHistoryProps) {
// //     const [selectedCoupon, setSelectedCoupon] = useState<RedeemItem | null>(null);
// //     const theme = useTheme();
// //     const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

// //     // 1. Hooks (ต้องอยู่บนสุด)
// //     const [tab, setTab] = useState(0);
// //     const [sort, setSort] = useState("desc");
// //     const [year, setYear] = useState("ทั้งหมด");
// //     const [currentPage, setCurrentPage] = useState(1);

// //     const rowsPerPage = isMobile ? 7 : 12;

// //     const availableYears = useMemo(() => {
// //         if (!data) return ["ทั้งหมด"];
// //         const years = Array.from(new Set(data.map((d) => dayjs(d.trandate).year()))).sort(
// //             (a, b) => b - a
// //         );
// //         return ["ทั้งหมด", ...years.map(String)];
// //     }, [data]);

// //     const filteredByType = useMemo(() => {
// //         if (!data) return [];
// //         if (tab === 1) return data.filter((d) => d.point_tran > 0);
// //         if (tab === 2) return data.filter((d) => d.point_tran < 0);
// //         if (tab === 3) return data.filter((d) => d.redeem_code);
// //         return data;
// //     }, [data, tab]);

// //     const filteredByYear = useMemo(() => {
// //         return year === "ทั้งหมด"
// //             ? filteredByType
// //             : filteredByType.filter((d) => dayjs(d.trandate).year().toString() === year);
// //     }, [filteredByType, year]);

// //     const sorted = useMemo(() => {
// //         return [...filteredByYear].sort((a, b) => {
// //             const da = dayjs(a.trandate);
// //             const db = dayjs(b.trandate);
// //             return sort === "desc" ? db.diff(da) : da.diff(db);
// //         });
// //     }, [filteredByYear, sort]);

// //     const totalPages = Math.ceil(sorted.length / rowsPerPage);
// //     const startIndex = (currentPage - 1) * rowsPerPage;
// //     const visibleItems = sorted.slice(startIndex, startIndex + rowsPerPage);

// //     // 2. Check empty data
// //     if (!data || data.length === 0) {
// //         return (
// //             <Typography variant="body2" sx={{ color: "#999", mt: 3, ml: 3 }}>
// //                 ยังไม่มีประวัติการทำรายการ
// //             </Typography>
// //         );
// //     }

// //     const handleTabChange = (_: any, v: number) => {
// //         setTab(v);
// //         setCurrentPage(1);
// //     };

// //     const handleCopy = (code: string) => {
// //         navigator.clipboard.writeText(code);
// //         Swal.fire({
// //             title: 'คัดลอกสำเร็จ!',
// //             text: code,
// //             icon: 'success',
// //             timer: 1000,
// //             showConfirmButton: false,
// //             position: 'top'
// //         });
// //     };

// //     return (
// //         <Box sx={{
// //             mt: 1, px: isMobile ? 1 : 2, overflowX: "hidden", overflowY: "auto",
// //             maxHeight: "calc(100vh - 180px)", scrollbarWidth: "thin"
// //         }}>
// //             {/* 🔹 Tabs */}
// //             <Tabs
// //                 value={tab}
// //                 onChange={handleTabChange}
// //                 variant="scrollable"
// //                 scrollButtons="auto"
// //                 sx={{ mb: 1.5, "& .Mui-selected": { color: "#FF7B00" }, "& .MuiTabs-indicator": { backgroundColor: "#FF7B00" } }}
// //             >
// //                 <Tab label="ทั้งหมด" /><Tab label="ได้รับ" /><Tab label="ใช้ไป" /><Tab label="คูปองของฉัน" />
// //             </Tabs>

// //             {/* Filter Section */}
// //             <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ mb: 2 }}>
// //                 <Select size="small" value={year} onChange={(e) => { setYear(e.target.value); setCurrentPage(1); }} sx={{ flex: 1 }}>
// //                     {availableYears.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
// //                 </Select>
// //                 <Stack direction="row" spacing={1}>
// //                     <Select size="small" value={sort} onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }} sx={{ flex: 1 }}>
// //                         <MenuItem value="desc">ล่าสุด</MenuItem><MenuItem value="asc">เก่าสุด</MenuItem>
// //                     </Select>
// //                     <IconButton onClick={() => { setSort(sort === "desc" ? "asc" : "desc"); setCurrentPage(1); }}>
// //                         <ArrowDownward sx={{ transform: sort === "asc" ? "rotate(180deg)" : "0deg", transition: "0.3s" }} />
// //                     </IconButton>
// //                 </Stack>
// //             </Stack>

// //             <Divider sx={{ mb: 2 }} />

// //             {/* List Data */}
// //             <Stack spacing={tab === 3 ? 2 : 0}>
// //                 {visibleItems.map((item, index) => {
// //                     // ✅ แท็บ "คูปองของฉัน" แสดงรหัสและวันหมดอายุ
// //                     if (tab === 3) {
// //                         const isExpired = dayjs().isAfter(dayjs(item.coupon_expired_at));
// //                         const isUsed = item.coupon_status === 'used';

// //                         // ปรับ Logic สีสถานะให้ชัดเจนขึ้น
// //                         const statusLabel = isUsed ? 'ใช้งานแล้ว' : isExpired ? 'หมดอายุ' : 'พร้อมใช้งาน';
// //                         const statusColor = isUsed ? '#9e9e9e' : isExpired ? '#f44336' : '#2e7d32';
// //                         const statusBg = isUsed ? '#f5f5f5' : isExpired ? '#ffebee' : '#e8f5e9';

// //                         return (
// //                             <Card key={index} variant="outlined" sx={{
// //                                 border: `1px solid ${statusColor}40`,
// //                                 borderRadius: 3,
// //                                 bgcolor: statusBg,
// //                                 position: 'relative',
// //                                 overflow: 'hidden'
// //                             }}>
// //                                 <CardContent sx={{ p: 2 }}>
// //                                     <Stack direction="row" spacing={2}>
// //                                         {/* ส่วนซ้าย: ข้อมูลคูปอง */}
// //                                         <Box sx={{ flex: 1 }}>
// //                                             <Typography variant="caption" color="text.secondary" fontWeight={500}>
// //                                                 แลกเมื่อ: {dayjs(item.coupon_created_at).format("DD/MM/YYYY HH:mm")}
// //                                             </Typography>
// //                                             <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.5, lineHeight: 1.3 }}>
// //                                                 {item.pname}
// //                                             </Typography>

// //                                             <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
// //                                                 <Box sx={{ px: 1.5, py: 0.2, bgcolor: '#fff', borderRadius: 1, border: `1px dashed ${statusColor}` }}>
// //                                                     <Typography variant="body1" color={statusColor} fontWeight={900} sx={{ letterSpacing: 1.5 }}>
// //                                                         {item.redeem_code}
// //                                                     </Typography>
// //                                                 </Box>
// //                                                 {!isExpired && !isUsed && (
// //                                                     <IconButton size="small" onClick={() => handleCopy(item.redeem_code || '')}>
// //                                                         <ContentCopy fontSize="small" sx={{ color: statusColor }} />
// //                                                     </IconButton>
// //                                                 )}
// //                                             </Stack>

// //                                             <Typography variant="caption" sx={{ color: isExpired ? '#d32f2f' : '#666', display: 'block', mt: 1, fontWeight: 500 }}>
// //                                                 {isExpired ? '🚨 หมดอายุแล้ว' : `⏳ ใช้ได้ถึง: ${dayjs(item.coupon_expired_at).format("DD/MM/YYYY HH:mm")}`}
// //                                             </Typography>
// //                                         </Box>

// //                                         {/* ส่วนขวา: ปุ่ม Action */}
// //                                         <Stack spacing={1} alignItems="center" justifyContent="center">
// //                                             <Chip label={statusLabel} size="small" sx={{ bgcolor: statusColor, color: '#fff', fontWeight: 700, fontSize: '0.65rem' }} />

// //                                             {/* ปุ่มกดดู QR Code (เฉพาะที่ยังไม่ใช้และไม่หมดอายุ) */}
// //                                             {!isUsed && !isExpired && (
// //                                                 <IconButton
// //                                                     onClick={() => setSelectedCoupon(item)}
// //                                                     sx={{ bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#f0f0f0' } }}
// //                                                 >
// //                                                     <QrCode2Icon sx={{ color: '#FF7B00' }} />
// //                                                 </IconButton>
// //                                             )}
// //                                         </Stack>
// //                                     </Stack>
// //                                 </CardContent>
// //                             </Card>
// //                         );
// //                     }

// //                     // แท็บอื่นๆ (ทั้งหมด/ได้รับ/ใช้ไป)
// //                     const isRedeem = item.point_tran < 0;
// //                     const color = isRedeem ? "#F55014" : "#2E7D32";
// //                     const dateText = dayjs(item.trandate).format("DD/MM/YYYY");
// //                     const pointText = `${isRedeem ? "" : "+"}${item.point_tran.toLocaleString()}`;

// //                     return (
// //                         <Box
// //                             key={index}
// //                             sx={{
// //                                 display: "grid",
// //                                 gridTemplateColumns: isMobile ? "1fr auto" : "1fr 100px 100px",
// //                                 alignItems: "center",
// //                                 py: 1.8,
// //                                 borderBottom: "1px solid #f0f0f0",
// //                             }}
// //                         >
// //                             <Box sx={{ overflow: 'hidden' }}>
// //                                 <Typography
// //                                     fontWeight={700}
// //                                     sx={{
// //                                         fontSize: 14,
// //                                         color: isRedeem ? "#F55014" : "#222",
// //                                         whiteSpace: 'nowrap',
// //                                         overflow: 'hidden',
// //                                         textOverflow: 'ellipsis'
// //                                     }}
// //                                 >
// //                                     {isRedeem ? `แลก ${item.pname}` : item.pname}
// //                                 </Typography>
// //                                 {isMobile && (
// //                                     <Typography variant="caption" color="text.secondary">{dateText}</Typography>
// //                                 )}
// //                             </Box>

// //                             {!isMobile && (
// //                                 <Typography variant="body2" sx={{ textAlign: "center", color: "#666" }}>
// //                                     {dateText}
// //                                 </Typography>
// //                             )}

// //                             <Typography sx={{ textAlign: "right", fontWeight: 800, fontSize: 15, color: color }}>
// //                                 {pointText}
// //                             </Typography>
// //                         </Box>
// //                     );
// //                 })}
// //             </Stack>
// //             <Dialog
// //                 open={Boolean(selectedCoupon)}
// //                 onClose={() => setSelectedCoupon(null)}
// //                 PaperProps={{ sx: { borderRadius: 5, p: 2, textAlign: 'center' } }}
// //             >
// //                 {selectedCoupon && (
// //                     <DialogContent>
// //                         <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>{selectedCoupon.pname}</Typography>
// //                         <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>แสดง QR Code นี้กับเจ้าหน้าที่เพื่อรับสิทธิ์</Typography>

// //                         <Box sx={{ p: 2, bgcolor: '#fff', display: 'inline-block', borderRadius: 3, boxShadow: '0 0 20px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
// //                             <QRCodeSVG value={selectedCoupon.redeem_code || ""} size={200} level="H" includeMargin />
// //                         </Box>

// //                         <Typography variant="h5" fontWeight={900} sx={{ mt: 2, letterSpacing: 3, color: '#FF7B00' }}>
// //                             {selectedCoupon.redeem_code}
// //                         </Typography>

// //                         <IconButton
// //                             onClick={() => setSelectedCoupon(null)}
// //                             sx={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
// //                         >
// //                             <CloseIcon />
// //                         </IconButton>
// //                     </DialogContent>
// //                 )}
// //             </Dialog>

// //             {/* Pagination */}
// //             {totalPages > 1 && (
// //                 <Stack alignItems="center" sx={{ mt: 3, mb: 3 }}>
// //                     <Pagination count={totalPages} page={currentPage} onChange={(_, v) => setCurrentPage(v)} color="primary" size="small" />
// //                 </Stack>
// //             )}
// //         </Box>
// //     );
// // }
// // ----------------------------------------------------------------------------------------------------------------------
// import React, { useState, useMemo } from "react";
// import {
//     Box,
//     Divider,
//     Stack,
//     Typography,
//     Tabs,
//     Tab,
//     Select,
//     MenuItem,
//     IconButton,
//     useMediaQuery,
//     useTheme,
//     Pagination,
//     Card,
//     CardContent,
//     Chip,
//     Dialog,
//     DialogContent,
//     Stepper,
//     Step,
//     StepLabel,
//     StepConnector,
//     Tooltip,
//     stepConnectorClasses,
//     styled
// } from "@mui/material";

// // Icons
// import {
//     ArrowDownward,
//     ContentCopy,
//     LocalShipping,
//     CheckCircle,
//     Cancel,
//     Inventory,
//     Close as CloseIcon,
//     QrCode2 as QrCode2Icon,
//     Check as CheckIcon
// } from "@mui/icons-material";

// // External Libs
// import dayjs from "dayjs";
// import "dayjs/locale/th"; // อย่าลืม import locale
// import Swal from "sweetalert2";
// import { QRCodeSVG } from "qrcode.react";
// import CopyButton from "@/Components/CopyButton";

// // --- Interfaces ---
// interface RedeemItem {
//     id: number;
//     pid: string;
//     pname: string;
//     point_tran: number;
//     trandate: string;
//     transaction_type?: string;
//     product_type?: string;
//     redeem_code?: string;
//     coupon_status?: 'active' | 'used' | 'expired';
//     coupon_expired_at?: string;
//     coupon_created_at?: string;
// }

// interface OrderItem {
//     id: number;
//     order_number: string;
//     product_name: string;
//     status: string;
//     tracking_number: string | null;
//     created_at: string;
//     points_redeemed: number;
// }

// interface RedeemHistoryProps {
//     data: RedeemItem[];
//     orders?: OrderItem[]; // รับ orders เข้ามาเพิ่ม
// }

// // --- Styles for Stepper (Order Tracking) ---
// const QontoConnector = styled(StepConnector)(({ theme }) => ({
//     [`&.${stepConnectorClasses.alternativeLabel}`]: {
//         top: 10,
//         left: 'calc(-50% + 16px)',
//         right: 'calc(50% + 16px)',
//     },
//     [`&.${stepConnectorClasses.active}`]: {
//         [`& .${stepConnectorClasses.line}`]: {
//             borderColor: '#FF7B00',
//         },
//     },
//     [`&.${stepConnectorClasses.completed}`]: {
//         [`& .${stepConnectorClasses.line}`]: {
//             borderColor: '#FF7B00',
//         },
//     },
//     [`& .${stepConnectorClasses.line}`]: {
//         borderColor: theme.palette.mode === 'dark' ? '#878787' : '#eaeaf0',
//         borderTopWidth: 3,
//         borderRadius: 1,
//     },
// }));

// const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
//     ({ theme, ownerState }) => ({
//         color: theme.palette.mode === 'dark' ? '#878787' : '#eaeaf0',
//         display: 'flex',
//         height: 22,
//         alignItems: 'center',
//         ...(ownerState.active && {
//             color: '#FF7B00',
//         }),
//         '& .QontoStepIcon-completedIcon': {
//             color: '#FF7B00',
//             zIndex: 1,
//             fontSize: 18,
//         },
//         '& .QontoStepIcon-circle': {
//             width: 8,
//             height: 8,
//             borderRadius: '50%',
//             backgroundColor: 'currentColor',
//         },
//     }),
// );

// function QontoStepIcon(props: any) {
//     const { active, completed, className } = props;
//     return (
//         <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
//             {completed ? (
//                 <CheckCircle className="QontoStepIcon-completedIcon" />
//             ) : (
//                 <div className="QontoStepIcon-circle" />
//             )}
//         </QontoStepIconRoot>
//     );
// }

// // --- Main Component ---
// export default function RedeemHistory({ data = [], orders = [] }: RedeemHistoryProps) {
//     const theme = useTheme();
//     const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//     // State
//     const [tab, setTab] = useState(0);
//     const [selectedCoupon, setSelectedCoupon] = useState<RedeemItem | null>(null);

//     // State for History Filters
//     const [sort, setSort] = useState("desc");
//     const [year, setYear] = useState("ทั้งหมด");
//     const [currentPage, setCurrentPage] = useState(1);
//     const rowsPerPage = isMobile ? 7 : 12;

//     // --- Logic: Point History Filter ---
//     const availableYears = useMemo(() => {
//         if (!data) return ["ทั้งหมด"];
//         const years = Array.from(new Set(data.map((d) => dayjs(d.trandate).year()))).sort((a, b) => b - a);
//         return ["ทั้งหมด", ...years.map(String)];
//     }, [data]);

//     const filteredByType = useMemo(() => {
//         if (!data) return [];
//         if (tab === 1) return data.filter((d) => d.point_tran > 0);
//         if (tab === 2) return data.filter((d) => d.point_tran < 0);
//         if (tab === 3) return data.filter((d) => d.redeem_code);
//         return data;
//     }, [data, tab]);

//     const filteredByYear = useMemo(() => {
//         return year === "ทั้งหมด"
//             ? filteredByType
//             : filteredByType.filter((d) => dayjs(d.trandate).year().toString() === year);
//     }, [filteredByType, year]);

//     const sortedHistory = useMemo(() => {
//         return [...filteredByYear].sort((a, b) => {
//             const da = dayjs(a.trandate);
//             const db = dayjs(b.trandate);
//             return sort === "desc" ? db.diff(da) : da.diff(db);
//         });
//     }, [filteredByYear, sort]);

//     // Pagination for History
//     const totalPages = Math.ceil(sortedHistory.length / rowsPerPage);
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const visibleHistory = sortedHistory.slice(startIndex, startIndex + rowsPerPage);


//     // --- Logic: Order Tracking (Tab 4) ---
//     const visibleOrders = useMemo(() => {
//         if (!orders) return [];
//         // เรียงจากใหม่ไปเก่า
//         return [...orders].sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at)));
//     }, [orders]);

//     const getActiveStep = (status: string) => {
//         switch (status) {
//             case 'pending': return 0;
//             case 'processing': return 1;
//             case 'shipped': return 2;
//             case 'completed': return 3;
//             default: return 0;
//         }
//     };
//     const steps = ['รับคำสั่งซื้อ', 'เตรียมสินค้า', 'จัดส่งแล้ว', 'สำเร็จ'];


//     // Handler
//     const handleTabChange = (_: any, v: number) => {
//         setTab(v);
//         setCurrentPage(1); // Reset page when tab changes
//     };

//     return (
//         <Box sx={{
//             mt: 1,
//             px: isMobile ? 1 : 2,
//             pb: 4 // เพิ่ม padding ด้านล่างหน่อยเผื่อติดขอบจอ
//         }}>

//             {/* 🔹 Tabs Menu */}
//             <Tabs
//                 value={tab}
//                 onChange={handleTabChange}
//                 variant="scrollable"
//                 scrollButtons="auto"
//                 allowScrollButtonsMobile
//                 sx={{
//                     mb: 1.5,
//                     "& .Mui-selected": { color: "#FF7B00", fontWeight: 700 },
//                     "& .MuiTabs-indicator": { backgroundColor: "#FF7B00" }
//                 }}
//             >
//                 <Tab label={t.Privilege.allHistory} />
//                 <Tab label={t.Privilege.earned} />
//                 <Tab label={t.Privilege.used} />
//                 <Tab label="คูปองของฉัน" />
//                 <Tab
//                     label="ติดตามพัสดุ"
//                     icon={<LocalShipping sx={{ fontSize: 18, mb: 0 }} />}
//                     iconPosition="start"
//                     sx={{ minHeight: 48 }}
//                 />
//             </Tabs>

//             {/* Filter Section (เฉพาะ Tab 0-3) */}
//             {tab !== 4 && (
//                 <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ mb: 2 }}>
//                     <Select
//                         size="small"
//                         value={year}
//                         onChange={(e) => { setYear(e.target.value); setCurrentPage(1); }}
//                         sx={{ flex: 1, borderRadius: 2 }}
//                     >
//                         {availableYears.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
//                     </Select>
//                     <Stack direction="row" spacing={1}>
//                         <Select
//                             size="small"
//                             value={sort}
//                             onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
//                             sx={{ flex: 1, borderRadius: 2 }}
//                         >
//                             <MenuItem value="desc">ล่าสุด</MenuItem>
//                             <MenuItem value="asc">เก่าสุด</MenuItem>
//                         </Select>
//                         <IconButton onClick={() => { setSort(sort === "desc" ? "asc" : "desc"); setCurrentPage(1); }}>
//                             <ArrowDownward sx={{ transform: sort === "asc" ? "rotate(180deg)" : "0deg", transition: "0.3s" }} />
//                         </IconButton>
//                     </Stack>
//                 </Stack>
//             )}

//             <Divider sx={{ mb: 2, borderStyle: tab === 4 ? 'none' : 'solid' }} />

//             {/* ------------------------------------------------------------------ */}
//             {/* CONTENT AREA */}
//             {/* ------------------------------------------------------------------ */}

//             {/* CASE 1: Tabs 0-3 (Point History & Coupons) */}
//             {tab !== 4 && (
//                 <>
//                     <Stack spacing={tab === 3 ? 2 : 0}>
//                         {visibleHistory.map((item, index) => {

//                             // === Layout สำหรับ "คูปองของฉัน" (Tab 3) ===
//                             if (tab === 3) {
//                                 const isExpired = dayjs().isAfter(dayjs(item.coupon_expired_at));
//                                 const isUsed = item.coupon_status === 'used';
//                                 const statusLabel = isUsed ? 'ใช้งานแล้ว' : isExpired ? 'หมดอายุ' : 'พร้อมใช้งาน';
//                                 const statusColor = isUsed ? '#9e9e9e' : isExpired ? '#f44336' : '#2e7d32';
//                                 const statusBg = isUsed ? '#f5f5f5' : isExpired ? '#ffebee' : '#e8f5e9';

//                                 return (
//                                     <Card key={index} variant="outlined" sx={{ border: `1px solid ${statusColor}40`, borderRadius: 3, bgcolor: statusBg, position: 'relative' }}>
//                                         <CardContent sx={{ p: 2 }}>
//                                             <Stack direction="row" spacing={2}>
//                                                 <Box sx={{ flex: 1 }}>
//                                                     <Typography variant="caption" color="text.secondary" fontWeight={500}>
//                                                         แลกเมื่อ: {dayjs(item.coupon_created_at).locale('th').add(543, 'year').format("D MMM YY HH:mm")}
//                                                     </Typography>
//                                                     <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.5, lineHeight: 1.3 }}>
//                                                         {item.pname}
//                                                     </Typography>
//                                                     <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
//                                                         <Box sx={{ px: 1.5, py: 0.2, bgcolor: '#fff', borderRadius: 1, border: `1px dashed ${statusColor}` }}>
//                                                             <Typography variant="body1" color={statusColor} fontWeight={900} sx={{ letterSpacing: 1.5 }}>
//                                                                 {item.redeem_code}
//                                                             </Typography>
//                                                         </Box>
//                                                         {!isExpired && !isUsed && (
//                                                             // <IconButton size="small" onClick={() => handleCopy(item.redeem_code || '')}>
//                                                             //     <ContentCopy fontSize="small" sx={{ color: statusColor }} />
//                                                             // </IconButton>
//                                                             <CopyButton text={item.redeem_code || ''} color={statusColor} />
//                                                         )}
//                                                     </Stack>
//                                                     <Typography variant="caption" sx={{ color: isExpired ? '#d32f2f' : '#666', display: 'block', mt: 1, fontWeight: 500 }}>
//                                                         {isExpired ? '🚨 หมดอายุแล้ว' : `⏳ ใช้ได้ถึง: ${dayjs(item.coupon_expired_at).locale('th').add(543, 'year').format("D MMM YY HH:mm")}`}
//                                                     </Typography>
//                                                 </Box>
//                                                 <Stack spacing={1} alignItems="center" justifyContent="center">
//                                                     <Chip label={statusLabel} size="small" sx={{ bgcolor: statusColor, color: '#fff', fontWeight: 700, fontSize: '0.65rem' }} />
//                                                     {!isUsed && !isExpired && (
//                                                         <IconButton onClick={() => setSelectedCoupon(item)} sx={{ bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
//                                                             <QrCode2Icon sx={{ color: '#FF7B00' }} />
//                                                         </IconButton>
//                                                     )}
//                                                 </Stack>
//                                             </Stack>
//                                         </CardContent>
//                                     </Card>
//                                 );
//                             }

//                             // === Layout สำหรับ "ประวัติแต้ม" (Tab 0,1,2) ===
//                             const isRedeem = item.point_tran < 0;
//                             const color = isRedeem ? "#F55014" : "#2E7D32";
//                             const dateText = dayjs(item.trandate).locale('th').add(543, 'year').format("D MMM YY");
//                             const pointText = `${isRedeem ? "" : "+"}${item.point_tran.toLocaleString()}`;

//                             return (
//                                 <Box key={index} sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr auto" : "1fr 100px 100px", alignItems: "center", py: 1.8, borderBottom: "1px solid #f0f0f0" }}>
//                                     <Box sx={{ overflow: 'hidden' }}>
//                                         <Typography fontWeight={700} sx={{ fontSize: 14, color: isRedeem ? "#F55014" : "#222", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                                             {isRedeem ? `แลก ${item.pname}` : item.pname}
//                                         </Typography>
//                                         {isMobile && <Typography variant="caption" color="text.secondary">{dateText}</Typography>}
//                                     </Box>
//                                     {!isMobile && <Typography variant="body2" sx={{ textAlign: "center", color: "#666" }}>{dateText}</Typography>}
//                                     <Typography sx={{ textAlign: "right", fontWeight: 800, fontSize: 15, color: color }}>
//                                         {pointText}
//                                     </Typography>
//                                 </Box>
//                             );
//                         })}

//                         {/* Empty State */}
//                         {visibleHistory.length === 0 && (
//                             <Box sx={{ textAlign: 'center', py: 6, color: '#999' }}>
//                                 <Typography variant="body2">ไม่มีรายการ</Typography>
//                             </Box>
//                         )}
//                     </Stack>

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                         <Stack alignItems="center" sx={{ mt: 3, mb: 3 }}>
//                             <Pagination count={totalPages} page={currentPage} onChange={(_, v) => setCurrentPage(v)} color="primary" size="small" />
//                         </Stack>
//                     )}
//                 </>
//             )}

//             {/* CASE 2: Tab 4 (Order Tracking) */}
//             {tab === 4 && (
//                 <Stack spacing={2.5}>
//                     {visibleOrders.length > 0 ? (
//                         visibleOrders.map((order) => {
//                             const activeStep = getActiveStep(order.status);
//                             const isCancelled = order.status === 'cancelled';

//                             return (
//                                 <Card key={order.id} variant="outlined" sx={{ borderRadius: 3, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
//                                     <CardContent sx={{ p: 2.5 }}>
//                                         {/* Header */}
//                                         <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
//                                             <Box>
//                                                 <Typography variant="caption" color="text.secondary">
//                                                     สั่งเมื่อ: {dayjs(order.created_at).locale('th').add(543, 'year').format("D MMM YY HH:mm")}
//                                                 </Typography>
//                                                 <Stack direction="row" alignItems="center">
//                                                     <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#FF7B00' }}>
//                                                         #{order.order_number}
//                                                     </Typography>
//                                                     <CopyButton text={order.order_number} color="primary" />
//                                                     {/* <IconButton size="small" onClick={() => handleCopy(order.order_number)}>
//                                                         <ContentCopy sx={{ fontSize: 14, color: '#999' }} />
//                                                     </IconButton> */}
//                                                 </Stack>
//                                             </Box>
//                                             <Chip
//                                                 label={isCancelled ? "ยกเลิก" : (order.status === 'completed' ? "สำเร็จ" : (order.status === 'shipped' ? "ส่งแล้ว" : "กำลังดำเนินการ"))}
//                                                 size="small"
//                                                 sx={{
//                                                     bgcolor: isCancelled ? '#ffebee' : (order.status === 'completed' ? '#e8f5e9' : '#fff3e0'),
//                                                     color: isCancelled ? '#d32f2f' : (order.status === 'completed' ? '#2e7d32' : '#e65100'),
//                                                     fontWeight: 700
//                                                 }}
//                                             />
//                                         </Stack>

//                                         <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

//                                         {/* Product Info */}
//                                         <Stack direction="row" spacing={2} mb={3} alignItems="center">
//                                             <Box sx={{
//                                                 width: 50, height: 50, borderRadius: 2, bgcolor: '#f9f9f9',
//                                                 display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
//                                             }}>
//                                                 <Inventory sx={{ color: '#bdbdbd' }} />
//                                             </Box>
//                                             <Box sx={{ overflow: 'hidden' }}>
//                                                 <Typography variant="body2" fontWeight={600} noWrap>{order.product_name}</Typography>
//                                                 <Typography variant="caption" color="text.secondary">ใช้ {order.points_redeemed.toLocaleString()} คะแนน</Typography>
//                                             </Box>
//                                         </Stack>

//                                         {/* Stepper */}
//                                         {!isCancelled ? (
//                                             <Box sx={{ width: '100%', mb: 2 }}>
//                                                 <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
//                                                     {steps.map((label) => (
//                                                         <Step key={label}>
//                                                             <StepLabel StepIconComponent={QontoStepIcon}>
//                                                                 <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#666' }}>{label}</Typography>
//                                                             </StepLabel>
//                                                         </Step>
//                                                     ))}
//                                                 </Stepper>
//                                             </Box>
//                                         ) : (
//                                             <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, display: 'flex', gap: 1, alignItems: 'center', color: '#d32f2f' }}>
//                                                 <Cancel fontSize="small" />
//                                                 <Typography variant="caption" fontWeight={600}>รายการถูกยกเลิกและคืนแต้มเรียบร้อยแล้ว</Typography>
//                                             </Box>
//                                         )}

//                                         {/* Tracking Number */}
//                                         {order.status === 'shipped' && order.tracking_number && (
//                                             <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F5F5F5', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                                                 <Box>
//                                                     <Typography variant="caption" color="text.secondary" display="block">เลขพัสดุ (Tracking No.)</Typography>
//                                                     <Typography variant="body2" fontWeight={700} sx={{ letterSpacing: 0.5 }}>{order.tracking_number}</Typography>
//                                                 </Box>
//                                                 {/* <IconButton size="small" onClick={() => handleCopy(order.tracking_number!)}>
//                                                     <ContentCopy fontSize="small" color="primary" />
//                                                 </IconButton> */}
//                                                 <CopyButton text={order.tracking_number!} color="primary" />
//                                             </Box>
//                                         )}
//                                     </CardContent>
//                                 </Card>
//                             );
//                         })
//                     ) : (
//                         <Box sx={{ textAlign: "center", py: 8, color: "#bbb" }}>
//                             <LocalShipping sx={{ fontSize: 56, mb: 1, opacity: 0.3 }} />
//                             <Typography variant="body2">{t.Privilege.noParcelMsg}</Typography>
//                         </Box>
//                     )}
//                 </Stack>
//             )}

//             {/* QR Code Dialog */}
//             <Dialog
//                 open={Boolean(selectedCoupon)}
//                 onClose={() => setSelectedCoupon(null)}
//                 PaperProps={{ sx: { borderRadius: 5, p: 2, textAlign: 'center' } }}
//             >
//                 {selectedCoupon && (
//                     <DialogContent>
//                         <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>{selectedCoupon.pname}</Typography>
//                         <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>แสดง QR Code นี้กับเจ้าหน้าที่เพื่อรับสิทธิ์</Typography>

//                         <Box sx={{ p: 2, bgcolor: '#fff', display: 'inline-block', borderRadius: 3, boxShadow: '0 0 20px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
//                             <QRCodeSVG value={selectedCoupon.redeem_code || ""} size={200} level="H" includeMargin />
//                         </Box>

//                         <Typography variant="h5" fontWeight={900} sx={{ mt: 2, letterSpacing: 3, color: '#FF7B00' }}>
//                             {selectedCoupon.redeem_code}
//                         </Typography>

//                         <IconButton
//                             onClick={() => setSelectedCoupon(null)}
//                             sx={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
//                         >
//                             <CloseIcon />
//                         </IconButton>
//                     </DialogContent>
//                 )}
//             </Dialog>

//         </Box>
//     );
// }

import React, { useState, useMemo } from "react";
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
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogContent,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    stepConnectorClasses,
    styled
} from "@mui/material";

import {
    ArrowDownward,
    LocalShipping,
    CheckCircle,
    Cancel,
    Inventory,
    Close as CloseIcon,
    QrCode2 as QrCode2Icon
} from "@mui/icons-material";

import dayjs from "dayjs";
import "dayjs/locale/th";
import "dayjs/locale/lo";
import "dayjs/locale/my";
import "dayjs/locale/en";
import { QRCodeSVG } from "qrcode.react";
import CopyButton from "@/Components/CopyButton";
import { useLanguage } from "@/context/LanguageContext";
import "dayjs/locale/lo";
import "dayjs/locale/my";
import "dayjs/locale/en";

interface RedeemItem {
    id: number;
    pid: string;
    pname: string;
    point_tran: number;
    trandate: string;
    transaction_type?: string;
    product_type?: string;
    redeem_code?: string;
    coupon_status?: 'active' | 'used' | 'expired';
    coupon_expired_at?: string;
    coupon_created_at?: string;
}

interface OrderItem {
    id: number;
    order_number: string;
    product_name: string;
    status: string;
    tracking_number: string | null;
    created_at: string;
    points_redeemed: number;
}

interface RedeemHistoryProps {
    data: RedeemItem[];
    orders?: OrderItem[];
}

const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: { borderColor: '#FF7B00' },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: { borderColor: '#FF7B00' },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.mode === 'dark' ? '#878787' : '#eaeaf0',
        borderTopWidth: 3,
        borderRadius: 1,
    },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
    ({ theme, ownerState }) => ({
        color: theme.palette.mode === 'dark' ? '#878787' : '#eaeaf0',
        display: 'flex',
        height: 22,
        alignItems: 'center',
        ...(ownerState.active && { color: '#FF7B00' }),
        '& .QontoStepIcon-completedIcon': { color: '#FF7B00', zIndex: 1, fontSize: 18 },
        '& .QontoStepIcon-circle': { width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' },
    }),
);

function QontoStepIcon(props: any) {
    const { active, completed, className } = props;
    return (
        <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
            {completed ? <CheckCircle className="QontoStepIcon-completedIcon" /> : <div className="QontoStepIcon-circle" />}
        </QontoStepIconRoot>
    );
}

export default function RedeemHistory({ data = [], orders = [] }: RedeemHistoryProps) {
    const { t, language } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [tab, setTab] = useState(0);
    const [selectedCoupon, setSelectedCoupon] = useState<RedeemItem | null>(null);
    const [sort, setSort] = useState("desc");
    const [year, setYear] = useState("ทั้งหมด");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = isMobile ? 7 : 12;

    const isThaiRes = language === "th";
    const currentLocale = language === "th" ? "th" : language === "lao" ? "lo" : language === "myanmar" ? "my" : "en";
    
    const formatDate = (date: string | dayjs.Dayjs, formatStr: string = "D MMM YY") => {
        let d = dayjs(date).locale(currentLocale);
        if (isThaiRes) {
            return d.add(543, 'year').format(formatStr);
        }
        return d.format(formatStr);
    };

    const formatDateTime = (date: string | dayjs.Dayjs) => {
        return formatDate(date, "D MMM YY HH:mm");
    };

    const availableYears = useMemo(() => {
        if (!data) return [t.Privilege.allHistory];
        const years = Array.from(new Set(data.map((d) => dayjs(d.trandate).year()))).sort((a, b) => b - a);
        return [t.Privilege.allHistory, ...years.map(String)];
    }, [data, t.Privilege.allHistory]);

    const filteredByType = useMemo(() => {
        if (!data) return [];
        if (tab === 1) return data.filter((d) => d.point_tran > 0);
        if (tab === 2) return data.filter((d) => d.point_tran < 0);
        return data; // Tab 0 แสดงทั้งหมด
    }, [data, tab]);

    const filteredByYear = useMemo(() => {
        return year === t.Privilege.allHistory
            ? filteredByType
            : filteredByType.filter((d) => dayjs(d.trandate).year().toString() === year);
    }, [filteredByType, year, t.Privilege.allHistory]);

    const sortedHistory = useMemo(() => {
        return [...filteredByYear].sort((a, b) => {
            const da = dayjs(a.trandate);
            const db = dayjs(b.trandate);
            return sort === "desc" ? db.diff(da) : da.diff(db);
        });
    }, [filteredByYear, sort]);

    const totalPages = Math.ceil(sortedHistory.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const visibleHistory = sortedHistory.slice(startIndex, startIndex + rowsPerPage);

    const visibleOrders = useMemo(() => {
        if (!orders) return [];
        return [...orders].sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at)));
    }, [orders]);

    const getActiveStep = (status: string) => {
        switch (status) {
            case 'pending': return 0;
            case 'processing': return 1;
            case 'shipped': return 2;
            case 'completed': return 3;
            default: return 0;
        }
    };
    const steps = [t.Privilege.received, t.Privilege.preparing, t.Privilege.shippedStatus, t.Privilege.completedStatus];

    const handleTabChange = (_: any, v: number) => {
        setTab(v);
        setCurrentPage(1);
    };

    return (
        <Box sx={{ mt: 1, px: isMobile ? 1 : 2, pb: 4 }}>
            <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                    mb: 1.5,
                    "& .Mui-selected": { color: "#FF7B00", fontWeight: 700 },
                    "& .MuiTabs-indicator": { backgroundColor: "#FF7B00" },
                    "& .MuiTabs-flexContainer": { justifyContent: "space-evenly"}
                }}
            >
                <Tab label={t.Privilege.allHistory} />
                <Tab label={t.Privilege.earned} />
                <Tab label={t.Privilege.used} />
                <Tab
                    label={t.Privilege.trackParcel}
                    icon={<LocalShipping sx={{ fontSize: 18, mb: 0 }} />}
                    iconPosition="start"
                    sx={{ minHeight: 48 }}
                />
            </Tabs>

            {/* Filter Section - แสดงเฉพาะแท็บประวัติ 0, 1, 2 */}
            {tab !== 3 && (
                <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ mb: 2 }}>
                    <Select
                        size="small"
                        value={year}
                        onChange={(e) => { setYear(e.target.value); setCurrentPage(1); }}
                        sx={{ flex: 1, borderRadius: 2 }}
                    >
                        {availableYears.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                    </Select>
                    <Stack direction="row" spacing={1}>
                        <Select
                            size="small"
                            value={sort}
                            onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
                            sx={{ flex: 1, borderRadius: 2 }}
                        >
                            <MenuItem value="desc">{t.Privilege.latest}</MenuItem>
                            <MenuItem value="asc">{t.Privilege.oldest}</MenuItem>
                        </Select>
                        <IconButton onClick={() => { setSort(sort === "desc" ? "asc" : "desc"); setCurrentPage(1); }}>
                            <ArrowDownward sx={{ transform: sort === "asc" ? "rotate(180deg)" : "0deg", transition: "0.3s" }} />
                        </IconButton>
                    </Stack>
                </Stack>
            )}

            <Divider sx={{ mb: 2, borderStyle: tab === 3 ? 'none' : 'solid' }} />

            {/* CONTENT AREA */}
            {tab !== 3 ? (
                <>
                    <Stack spacing={0}>
                        {visibleHistory.map((item, index) => {
                            const isRedeem = item.point_tran < 0;
                            const color = isRedeem ? "#F55014" : "#2E7D32";
                            const dateText = formatDate(item.trandate);
                            const pointText = `${isRedeem ? "" : "+"}${item.point_tran.toLocaleString()}`;

                            return (
                                <Box key={index} sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr auto" : "1fr 100px 100px", alignItems: "center", py: 1.8, borderBottom: "1px solid #f0f0f0" }}>
                                    <Box sx={{ overflow: 'hidden' }}>
                                        <Typography fontWeight={700} sx={{ fontSize: 14, color: isRedeem ? "#F55014" : "#222", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {isRedeem ? `${t.Privilege.redeemPrefix} ${item.pname}` : item.pname}
                                        </Typography>
                                        {isMobile && <Typography variant="caption" color="text.secondary">{dateText}</Typography>}
                                    </Box>
                                    {!isMobile && <Typography variant="body2" sx={{ textAlign: "center", color: "#666" }}>{dateText}</Typography>}
                                    <Typography sx={{ textAlign: "right", fontWeight: 800, fontSize: 15, color: color }}>
                                        {pointText}
                                    </Typography>
                                </Box>
                            );
                        })}

                        {visibleHistory.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 6, color: '#999' }}>
                                <Typography variant="body2">{t.Privilege.noHistory}</Typography>
                            </Box>
                        )}
                    </Stack>

                    {totalPages > 1 && (
                        <Stack alignItems="center" sx={{ mt: 3, mb: 3 }}>
                            <Pagination count={totalPages} page={currentPage} onChange={(_, v) => setCurrentPage(v)} color="primary" size="small" />
                        </Stack>
                    )}
                </>
            ) : (
                <Stack spacing={2.5}>
                    {visibleOrders.length > 0 ? (
                        visibleOrders.map((order) => {
                            const activeStep = getActiveStep(order.status);
                            const isCancelled = order.status === 'cancelled';

                            return (
                                <Card key={order.id} variant="outlined" sx={{ borderRadius: 3, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t.Privilege.orderDate}: {formatDateTime(order.created_at)}
                                                </Typography>
                                                <Stack direction="row" alignItems="center">
                                                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#FF7B00' }}>
                                                        #{order.order_number}
                                                    </Typography>
                                                    <CopyButton text={order.order_number} color="primary" />
                                                </Stack>
                                            </Box>
                                            <Chip
                                                label={isCancelled ? t.Privilege.cancelledStatus : (order.status === 'completed' ? t.Privilege.completedStatus : (order.status === 'shipped' ? t.Privilege.shippedStatus : t.Privilege.processingStatus))}
                                                size="small"
                                                sx={{
                                                    bgcolor: isCancelled ? '#ffebee' : (order.status === 'completed' ? '#e8f5e9' : '#fff3e0'),
                                                    color: isCancelled ? '#d32f2f' : (order.status === 'completed' ? '#2e7d32' : '#e65100'),
                                                    fontWeight: 700
                                                }}
                                            />
                                        </Stack>
                                        <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
                                        <Stack direction="row" spacing={2} mb={3} alignItems="center">
                                            <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Inventory sx={{ color: '#bdbdbd' }} />
                                            </Box>
                                            <Box sx={{ overflow: 'hidden' }}>
                                                <Typography variant="body2" fontWeight={600} noWrap>{order.product_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{t.Privilege.used} {order.points_redeemed.toLocaleString()} {t.Privilege.points}</Typography>
                                            </Box>
                                        </Stack>
                                        {!isCancelled ? (
                                            <Box sx={{ width: '100%', mb: 2 }}>
                                                <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
                                                    {steps.map((label) => (
                                                        <Step key={label}>
                                                            <StepLabel StepIconComponent={QontoStepIcon}>
                                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#666' }}>{label}</Typography>
                                                            </StepLabel>
                                                        </Step>
                                                    ))}
                                                </Stepper>
                                            </Box>
                                        ) : (
                                            <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2, display: 'flex', gap: 1, alignItems: 'center', color: '#d32f2f' }}>
                                                <Cancel fontSize="small" />
                                                <Typography variant="caption" fontWeight={600}>{t.Privilege.parcelCancelledMsg}</Typography>
                                            </Box>
                                        )}
                                        {order.status === 'shipped' && order.tracking_number && (
                                            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F5F5F5', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">{t.Privilege.trackingNo}</Typography>
                                                    <Typography variant="body2" fontWeight={700} sx={{ letterSpacing: 0.5 }}>{order.tracking_number}</Typography>
                                                </Box>
                                                <CopyButton text={order.tracking_number} color="primary" />
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <Box sx={{ textAlign: "center", py: 8, color: "#bbb" }}>
                            <LocalShipping sx={{ fontSize: 56, mb: 1, opacity: 0.3 }} />
                            <Typography variant="body2">{t.Privilege.noParcelMsg}</Typography>
                        </Box>
                    )}
                </Stack>
            )}
        </Box>
    );
}