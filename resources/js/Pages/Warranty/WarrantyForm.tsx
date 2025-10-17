import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Assessment, FileUpload, QrCode, Close, CameraAlt } from "@mui/icons-material";
import {
    Box, Button, Container, Autocomplete, FormControl, FormLabel,
    Grid, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography,
    useMediaQuery, useTheme, CircularProgress, InputAdornment, Dialog,
    DialogContent, DialogTitle, IconButton, Chip, Alert
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useRef, useState, useCallback, useEffect } from "react";
import ProductDetailComponent from "./ProductDetailComponent";
import { useLanguage } from "@/context/LanguageContext";
import ExampleWarrantyFile from "./ExampleWarrantyFile";
import { PreviewFileUpload } from "./PreviewFileUpload";
import axios from "axios";
import dayjs from "dayjs";
import Html5QrcodePlugin from "@/Components/Html5QrcodePlugin";
import Swal from "sweetalert2";
interface StoreItemProps {
    custgroup: string;
    custname: string;
    branch: string;
}

export default function WarrantyForm({ channel_list }: { channel_list: [] }) {
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // @ts-ignore
    const { user } = usePage().props.auth;
    const { t } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [openExampleFile, setOpenExampleFile] = useState(false);

    const [showProduct, setShowProduct] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);
    // const [ProductDetail, setProductDetail] = useState<ProductDetail>();
    const [ProductDetail, setProductDetail] = useState<ProductDetail | null>(null);

    const [snVerified, setSnVerified] = useState(false); // ตรวจสอบ SN ผ่านหรือยัง
    const [refreshKey, setRefreshKey] = useState(0);

    const { data, setData, processing, errors, post }: WarrantyFormProps = useForm({
        warranty_file: '',
        serial_number: '',
        // @ts-ignore
        phone: user.phone,
        model_code: '',
        model_name: '',
        product_name: '',
        buy_from: 'เลือก',
        buy_date: '',
        store_name: '',
        customer_code: '',
    });

    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [openModal, setOpenModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showForm, setShowForm] = useState(false);
    const [checking, setChecking] = useState(false);

    const [storeList, setStoreList] = useState<StoreItemProps[]>([]);
    const [loadingBuyform, setLoadingBuyFrom] = useState(false);

    // QR Scanner states
    const [openQrScanner, setOpenQrScanner] = useState(false);
    const [qrScanSuccess, setQrScanSuccess] = useState(false);

    const [showReferralField, setShowReferralField] = useState(false);
    const [storeLabel, setStoreLabel] = useState<string>(t.Warranty.Form.store_name);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(name, value);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("warranty_file", file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleCheckProduct = async () => {
        if (!data.model_code.trim()) {
            Swal.fire({
                title: 'กรุณากรอกซีเรียลและรหัสสินค้าก่อนตรวจสอบ',
                icon: 'warning',
                confirmButtonColor: '#F54927',
            });
            return;
        }

        try {
            setLoadingProduct(true);
            setShowProduct(false);

            const response = await axios.post(route('warranty.check.sn'), {
                model_code: data.model_code.trim(),
                sn: data.serial_number.trim(),
            });

            console.log("🔍 API Response:", response.data);
            if (response.data?.status === 'duplicate') {
                Swal.fire({
                    title: response.data.message,
                    icon: 'error',
                    confirmButtonColor: '#F54927',
                });
                setShowProduct(false);
                return;
            }
            if (response.data?.data?.product_detail) {
                const pd = response.data.data.product_detail;
                setProductDetail(pd);
                setShowProduct(true);

                setData((prevData: typeof data) => ({
                    ...prevData,
                    model_code: pd.pid || "",
                    model_name: pd.fac_model || "",
                    product_name: pd.pname || "",
                }));
            }
            else {
                Swal.fire({
                    title: 'ไม่พบข้อมูลสินค้า',
                    icon: 'warning',
                    confirmButtonColor: '#F54927',
                });
                setShowProduct(false);
            }
        } catch (error: any) {
            let msg = error.response?.data?.message || 'เกิดข้อผิดพลาดระหว่างตรวจสอบสินค้า';
            Swal.fire({
                title: msg,
                icon: 'error',
                confirmButtonColor: '#F54927',
            });
            setShowProduct(false);
        } finally {
            setLoadingProduct(false);
        }
    };

    useEffect(() => {
        if (!data.serial_number && !data.model_code) return;
        if (showProduct || snVerified || showForm) {
            setShowProduct(false);
            setSnVerified(false);
            setShowForm(false);
            setProductDetail(null);

            console.log("🔄 Reset state because SN or SKU changed");
        }
    }, [data.serial_number, data.model_code]);

    const handleCheckSn = async () => {
        // if (!data.serial_number.trim() && !data.model_code.trim()) {
        //     alert('กรุณากรอก Serial Number หรือ รหัสสินค้า อย่างน้อยหนึ่งอย่าง');
        //     return;
        // }
        const serial = data.serial_number.trim();
        const model = data.model_code.trim();

        if (!serial) {
            Swal.fire({
                title: 'กรุณากรอก Serial Number',
                icon: 'warning',
                confirmButtonColor: '#F54927',
            });
            return;
        }

        if (!model) {
            Swal.fire({
                title: 'กรุณากรอกรหัสสินค้า',
                icon: 'warning',
                confirmButtonColor: '#F54927',
            });
            return;
        }
        try {
            setChecking(true);
            setShowForm(false);
            setShowProduct(false);
            setSnVerified(false);

            // เรียกหลังบ้านแค่รอบเดียว
            const response = await axios.post(route('warranty.check.sn'), {
                sn: data.serial_number.trim(),
                model_code: data.model_code.trim(),
            });

            // ถ้าผ่าน
            setShowForm(true);
            setSnVerified(true);

            // ถ้ามีข้อมูลสินค้าใน response.data.data.product_detail ให้ setProductDetail ด้วย
            if (response.data.data?.product_detail) {
                setProductDetail(response.data.data.product_detail);
                setShowProduct(true);
            }
        } catch (error: any) {
            let msg = error.response?.data?.message || error.message || "เกิดข้อผิดพลาด";
            Swal.fire({
                title: msg,
                icon: 'error',
                confirmButtonColor: '#F54927',
            });
            setShowForm(false);
            setSnVerified(false);
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!data.warranty_file) {
            Swal.fire(t.Warranty.Validate.AlertMessage.file, '', 'warning');
            return;
        }
        if (!data.buy_date) {
            Swal.fire(t.Warranty.Validate.AlertMessage.buy_date, '', 'warning');
            return;
        }
        if (!data.store_name?.trim()) {
            Swal.fire(t.Warranty.Validate.AlertMessage.store_name, '', 'warning');
            return;
        }
        if (!data.buy_from || data.buy_from === 'เลือก') {
            Swal.fire(t.Warranty.Validate.AlertMessage.buy_from, '', 'warning');
            return;
        }

        // if (!data.phone || data.phone.length !== 10) {
        //     Swal.fire(t.Warranty.Validate.AlertMessage.phone, '', 'warning');
        //     return;
        // }

        post(route('warranty.form.store'), {
            forceFormData: true,
            onError: (errors: any) => {
                console.error("Errors: ", errors);
                const messages = Object.values(errors).join('\n');
                if (messages) {
                    Swal.fire('ข้อมูลไม่ถูกต้อง', messages, 'error');
                }
            },
            onFinish: () => {
                console.log("Submit finished");
            },
        });
    };

    // const handleBuyFromChange = useCallback((value: string) => {
    //     setData('buy_from', value);
    //     setLoadingBuyFrom(true);
    //     setData('store_name', '');
    //     setStoreList([]);

    //     // Clear existing timeout
    //     if (debounceRef.current) {
    //         clearTimeout(debounceRef.current);
    //     }

    //     // Set new timeout
    //     debounceRef.current = setTimeout(() => {
    //         handleChangeStoreName(value);
    //     }, 500);
    // }, [setData]);


    const handleBuyFromChange = useCallback((value: string) => {
        setData('buy_from', value);
        setLoadingBuyFrom(true);
        setData('store_name', '');
        setStoreList([]);

        const requireReferral = [
            "ไทวัสดุ",
            "Homepro",
            "Mega home",
            "Dohome",
            "Global house",
            "ฮาร์ดแวร์เฮาส์",
        ];

        const isBigStore = requireReferral.includes(value);

        setStoreLabel(isBigStore ? "Branch Name (ชื่อสาขา)" : t.Warranty.Form.store_name);
        setShowReferralField(isBigStore);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            handleChangeStoreName(value);
        }, 500);
    }, [setData]);

    const handleChangeStoreName = async (buy_from: string) => {
        if (!buy_from || buy_from === 'เลือก') {
            setLoadingBuyFrom(false);
            return;
        }

        try {
            const response = await axios.get(route('warranty.get_store_name', { store_name: buy_from }));
            setStoreList(response.data.list.value || []);
        } catch (error) {
            console.error('Error fetching store names:', error);
            setStoreList([]);
        } finally {
            setLoadingBuyFrom(false);
        }
    }

    // QR Code success callback
    const handleQrSuccess = (decodedText: string) => {
        setData('customer_code', decodedText);
        setQrScanSuccess(true);
        setOpenQrScanner(false);

        // Show success message briefly
        setTimeout(() => setQrScanSuccess(false), 3000);
    };

    const handleOpenQrScanner = () => {
        setOpenQrScanner(true);
    };

    const handleCloseQrScanner = () => {
        setOpenQrScanner(false);
    };

    return (
        <MobileAuthenticatedLayout title={t.Warranty.title}>
            <Head title={t.Warranty.title} />

            {/* Modals */}
            {openExampleFile && <ExampleWarrantyFile open={openExampleFile} setOpen={setOpenExampleFile} />}
            {openModal && <PreviewFileUpload open={openModal} setOpen={setOpenModal} preview={preview} />}

            {/* QR Scanner Dialog */}
            <Dialog
                open={openQrScanner}
                onClose={handleCloseQrScanner}
                maxWidth="sm"
                fullWidth
            // PaperProps={{
            //     sx: {
            //         borderRadius: 2,
            //         minHeight: isMobile ? '80vh' : 'auto'
            //     }
            // }}
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                            <CameraAlt color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                                สแกน QR Code
                            </Typography>
                        </Box>
                        <IconButton onClick={handleCloseQrScanner} size="small">
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box textAlign="center" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                            นำกล้องไปสแกน QR Code เพื่อรับรหัสลูกค้าอัตโนมัติ
                        </Typography>
                    </Box>
                    <Html5QrcodePlugin
                        defaultCamera="back"
                        fps={10}
                        qrbox={250}
                        disableFlip={false}
                        qrCodeSuccessCallback={handleQrSuccess}
                    />
                </DialogContent>
            </Dialog>
            <Container maxWidth={isMobile ? 'sm' : 'lg'} sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}>
                {/* Success Alert for QR Scan */}
                {qrScanSuccess && (
                    <Alert
                        severity="success"
                        sx={{ mb: 2 }}
                        onClose={() => setQrScanSuccess(false)}
                    >
                        สแกน QR Code สำเร็จแล้ว! รหัสลูกค้าถูกเพิ่มเข้าฟอร์มอัตโนมัติ
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* File Upload Section */}
                        {showForm && (
                            <Grid size={12}>
                                <Box
                                    sx={{
                                        border: "2px dashed",
                                        borderColor: preview ? "primary.main" : "#ccc",
                                        borderRadius: 2,
                                        p: 3,
                                        textAlign: "center",
                                        cursor: "pointer",
                                        bgcolor: preview ? "primary.50" : "#fafafa",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            bgcolor: preview ? "primary.100" : "#f0f0f0",
                                            borderColor: "primary.main",
                                        },
                                    }}
                                >
                                    {/* ✅ ใช้ label ครอบ input เพื่อให้คลิกได้ครั้งเดียว */}
                                    <label htmlFor="warranty_file" style={{ cursor: "pointer" }}>
                                        {preview ? (
                                            <Stack spacing={2}>
                                                <Box
                                                    component="img"
                                                    src={preview}
                                                    alt="Warranty Preview"
                                                    sx={{
                                                        maxHeight: 120,
                                                        objectFit: "contain",
                                                        borderRadius: 1,
                                                        mx: "auto",
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenModal(true);
                                                    }}
                                                />

                                                {/* ✅ แสดงชื่อไฟล์ */}
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    noWrap
                                                    sx={{ fontStyle: "italic", textAlign: "center" }}
                                                >
                                                    {fileName || "ยังไม่ได้เลือกไฟล์"}
                                                </Typography>
                                                <Chip
                                                    label="เปลี่ยนไฟล์ใหม่"
                                                    color="primary"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </Stack>
                                        ) : (
                                            <Stack spacing={1}>
                                                <FileUpload fontSize="large" color="primary" />
                                                <Typography color="text.secondary" fontWeight="medium">
                                                    {t.Warranty.Form.file}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t.Warranty.Form.validateFile}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </label>
                                    <input
                                        id="warranty_file"
                                        type="file"
                                        accept="image/*"
                                        // required
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setData("warranty_file", file);
                                                setPreview(URL.createObjectURL(file));
                                                setFileName(file.name); // ✅ เก็บชื่อไฟล์
                                            }
                                        }}
                                    />
                                </Box>
                                <Box mt={2}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => setOpenExampleFile(true)}
                                        sx={{ py: 1.5 }}
                                    >
                                        {t.Warranty.Form.example_file}
                                    </Button>
                                </Box>
                            </Grid>
                        )}

                        {/* Serial Number Section */}
                        <Grid size={12}>
                            <FormControl fullWidth>
                                <FormLabel htmlFor="serial_number" required sx={{ mb: 1, fontWeight: 'medium' }}>
                                    {t.Warranty.Form.serial_number}
                                </FormLabel>
                                <Stack direction="row" spacing={1}>
                                    <TextField
                                        id="serial_number"
                                        name="serial_number"
                                        value={data.serial_number}
                                        onChange={handleOnChange}
                                        required
                                        disabled={processing || checking || snVerified}
                                        placeholder={t.Warranty.Placeholder.serial_number}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !snVerified) {
                                                e.preventDefault();
                                                handleCheckSn();
                                            }
                                        }}
                                        sx={{
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                    {snVerified && (
                                        <Button
                                            variant="outlined"
                                            color="warning"
                                            onClick={() => {
                                                setData({
                                                    ...data,
                                                    warranty_file: '',
                                                    serial_number: '',
                                                    // phone: '',
                                                    model_code: '',
                                                    model_name: '',
                                                    product_name: '',
                                                    buy_from: 'เลือก',
                                                    buy_date: '',
                                                    store_name: '',
                                                    customer_code: '',
                                                });

                                                setShowForm(false);
                                                setShowProduct(false);
                                                setPreview(null);
                                                setFileName('');
                                                setSnVerified(false);
                                            }}
                                        >
                                            {t.Warranty.Form.ChangeSerial}
                                        </Button>
                                    )}
                                </Stack>
                            </FormControl>
                        </Grid>

                        {/* Model Code Section */}
                        <Grid size={12}>
                            <FormControl fullWidth>
                                <FormLabel htmlFor="model_code" required sx={{ mb: 1, fontWeight: 'medium' }}>
                                    {/* {t.Warranty.Form.model_code || "รหัสรุ่นสินค้า (Model Code)"} */}
                                    รหัสสินค้า
                                </FormLabel>
                                <TextField
                                    id="model_code"
                                    name="model_code"
                                    value={data.model_code}
                                    onChange={handleOnChange}
                                    required
                                    disabled={processing || checking || snVerified}
                                    placeholder="กรอกรหัสรุ่นสินค้า"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        {/* ✅ ปุ่มตรวจสอบสินค้า (จะแสดงเฉพาะตอนที่ยังไม่ได้ตรวจสอบสินค้าเท่านั้น) */}
                        {!showProduct && !snVerified && (
                            <Grid size={12}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleCheckProduct}
                                    disabled={loadingProduct || checking}
                                    sx={{ py: 1.5, borderRadius: 2 }}
                                >
                                    {loadingProduct ? (
                                        <>
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            กำลังตรวจสอบสินค้า...
                                        </>
                                    ) : (
                                        "ตรวจสอบสินค้า"
                                    )}
                                </Button>
                            </Grid>
                        )}

                        {loadingProduct ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "column",
                                    py: 4,
                                    width: "100%",
                                }}
                            >
                                <CircularProgress size={32} sx={{ mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {t.History.Information.loading || "กำลังโหลดข้อมูลสินค้า..."}
                                </Typography>
                            </Box>
                        ) : (
                            showProduct && ProductDetail && (
                                <ProductDetailComponent productDetail={ProductDetail} />
                            )
                        )}

                        {/* ปุ่มตรวจสอบการรับประกัน (ขั้นตอนต่อไป) */}
                        {!snVerified && (
                            <Grid size={12}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    disabled={!showProduct || checking}
                                    onClick={handleCheckSn}
                                    sx={{ py: 1.5, borderRadius: 2 }}
                                >
                                    {checking ? (
                                        <>
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            {t.Warranty.Form.CheckingWaranty}
                                        </>
                                    ) : (
                                        t.Warranty.Form.CheckWaranty
                                    )}
                                </Button>
                            </Grid>
                        )}

                        {/* Form Fields */}
                        {showForm && (
                            <>
                                {/* <Grid size={12} sx={{ mt: 0 }}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="phone" required sx={{ mb: 1, fontWeight: "medium" }}>
                                            {t.Warranty.Form.phone}
                                        </FormLabel>
                                        <TextField
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            // value={data.phone}
                                            onChange={(e) => {
                                                const onlyDigits = e.target.value.replace(/\D/g, "");
                                                setData("phone", onlyDigits);
                                            }}
                                            inputProps={{
                                                maxLength: 10,
                                                pattern: "[0-9]*",
                                                inputMode: "numeric",
                                            }}
                                            required
                                            disabled={processing}
                                            placeholder="Example 0812349999"
                                            error={!!errors.phone || ((data.phone ?? '').length > 0 && (data.phone ?? '').length < 10)}
                                            helperText={
                                                errors.phone
                                                    ? errors.phone
                                                    : (data.phone ?? '').length > 0 && (data.phone ?? '').length < 10
                                                        ? "กรุณากรอกเบอร์โทรให้ครบ 10 หลัก"
                                                        : " "
                                            }
                                            sx={{
                                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                            }}
                                        // slotProps={{
                                        //     input: {
                                        //         startAdornment: (
                                        //             <InputAdornment position="start">
                                        //                 <Typography
                                        //                     variant="body2"
                                        //                     sx={{
                                        //                         color: "text.secondary",
                                        //                         fontWeight: 500,
                                        //                         mr: 0.5,
                                        //                     }}
                                        //                 >
                                        //                 </Typography>
                                        //             </InputAdornment>
                                        //         ),
                                        //     },
                                        // }}
                                        />
                                    </FormControl>
                                </Grid> */}

                                <Grid size={12}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="buy_from" required sx={{ mb: 1, fontWeight: 'medium' }}>
                                            {t.Warranty.Form.buy_from}
                                        </FormLabel>
                                        <Select
                                            required
                                            labelId="buy-from-select-label"
                                            id="buy_from"
                                            value={data.buy_from}
                                            variant="outlined"
                                            onChange={(e: SelectChangeEvent) => handleBuyFromChange(e.target.value)}

                                            sx={{ borderRadius: 2 }}
                                        >
                                            <MenuItem disabled value={'เลือก'}>
                                                {t.Warranty.Form.SelectBuyFrom}
                                            </MenuItem>
                                            {channel_list.map((channel, index) => (
                                                <MenuItem key={index} value={channel}>
                                                    {channel}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={12}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="store_name" required sx={{ mb: 1, fontWeight: 'medium' }}>
                                            {/* {t.Warranty.Form.store_name} */}
                                            {storeLabel}
                                        </FormLabel>
                                        {loadingBuyform ? (
                                            <Box display="flex" alignItems="center" gap={1} p={2}>
                                                <CircularProgress size={20} />
                                                <Typography variant="body2">กำลังโหลดร้านค้า...</Typography>
                                            </Box>
                                        ) : (
                                            <Autocomplete
                                                options={storeList.map(
                                                    // ${item.custgroup}
                                                    (item) => ` ${item.custname} ${item.branch}`
                                                )}
                                                value={data.store_name}
                                                onChange={(_, newValue) => setData('store_name', newValue || '')}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="outlined"
                                                        fullWidth
                                                        placeholder={t.Warranty.Form.SelectShop}
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                    />
                                                )}
                                                noOptionsText="ไม่พบร้านค้า"
                                            />
                                        )}
                                    </FormControl>
                                </Grid>
                                {showReferralField && (
                                    <Grid size={12} sx={{ mt: 0 }}>
                                        <FormControl fullWidth>
                                            <FormLabel htmlFor="customer_code" sx={{ mb: 1, fontWeight: "medium" }}>
                                                {t.Warranty.Form.customer_code_title}
                                            </FormLabel>

                                            <TextField
                                                id="customer_code"
                                                name="customer_code"
                                                value={data.customer_code}
                                                onChange={(e) => {
                                                    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 5);
                                                    setData("customer_code", onlyDigits);
                                                }}
                                                inputProps={{
                                                    maxLength: 5,
                                                    inputMode: "numeric",
                                                    pattern: "[0-9]*",
                                                }}
                                                disabled={processing}
                                                placeholder={t.Warranty.Validate.customer_code}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                                }}
                                                slotProps={{
                                                    input: {
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                {false && (
                                                                    <IconButton
                                                                        onClick={handleOpenQrScanner}
                                                                        color="primary"
                                                                        sx={{
                                                                            bgcolor: "primary.50",
                                                                            "&:hover": { bgcolor: "primary.100" },
                                                                        }}
                                                                    >
                                                                        <QrCode />
                                                                    </IconButton>
                                                                )}
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                )}
                                <Grid size={12}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="buy_date" required sx={{ mb: 1, fontWeight: 'medium' }}>
                                            {t.Warranty.Form.buy_date}
                                        </FormLabel>
                                        <DatePicker
                                            name="buy_date"
                                            onChange={(newValue) => {
                                                setData("buy_date", newValue ? newValue.format("YYYY-MM-DD") : "");
                                            }}
                                            maxDate={dayjs()}
                                            minDate={dayjs().subtract(15, "days")}
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                            slotProps={{
                                                textField: {
                                                    readOnly: true,
                                                    title: "กรุณาเลือกวันที่จากปฏิทินเท่านั้น",
                                                },
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={12}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        type="submit"
                                        startIcon={<Assessment />}
                                        disabled={processing}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 2,
                                            fontSize: '1rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {processing ? 'กำลังส่งข้อมูล...' : t.Warranty.Form.submit}
                                    </Button>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </form>
            </Container>
        </MobileAuthenticatedLayout>
    );
}