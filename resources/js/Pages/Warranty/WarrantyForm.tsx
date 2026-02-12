import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Assessment, FileUpload, QrCode, Close, CameraAlt, CheckCircleOutline, BatteryChargingFull, KeyboardArrowUp, KeyboardArrowDown, InfoOutlined } from "@mui/icons-material";
import {
    Box, Button, Container, Autocomplete, FormControl, FormLabel,
    Grid, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography,
    useMediaQuery, useTheme, CircularProgress, InputAdornment, Dialog,
    DialogContent, DialogTitle, IconButton, Chip, Alert,
    Collapse
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
import { Power } from "lucide-react";

interface StoreItemProps {
    custgroup: string;
    custname: string;
    branch: string;
}

interface Channel {
    id: number;
    name: string;
}

const mapAccessoryToProductDetail = (item: PowerAccessoryItem): ProductDetail => {
    // ดึง base url ของรูปภาพจาก env
    const productPathMaster = import.meta.env.VITE_PRODUCT_IMAGE_URI || "";

    return {
        pid: item.accessory_sku,
        pname: item.product_name,
        fac_model: item.accessory_sku, // ใช SKU เป็นชื่อรุ่นแทน
        // สร้าง URL รูปภาพเอง: path/sku.jpg
        image: `${productPathMaster}/${item.accessory_sku}.jpg`,
        warrantyperiod: item.warranty_period,
        warrantycondition: item.warranty_condition,
        warrantynote: item.warranty_note,
        power_accessories: null,
        is_combo: false
    };
};

const PowerAccessoriesList = ({ accessories }: { accessories: PowerAccessoriesData | null | undefined }) => {
    const [expanded, setExpanded] = useState(false);

    if (!accessories) return null;

    const batteryList = accessories.battery || [];
    const chargerList = accessories.charger || [];
    const totalCount = batteryList.length + chargerList.length;

    if (totalCount === 0) return null;

    return (
        <Box sx={{
            mt: 2,
            mb: 1,
        }}>
            {/* Header: สไตล์เดียวกับ Combo Set */}
            <Box
                onClick={() => setExpanded(!expanded)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    px: 1,
                    py: 1,
                    mb: 1,
                    bgcolor: 'primary.50',
                    borderRadius: 2,
                    // border: '1px dashed',
                    borderColor: 'primary.200',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'primary.100' }
                }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircleOutline color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                        power accessories ({totalCount} รายการ)
                    </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'primary.main', p: 0.5 }}>
                    {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
            </Box>

            {/* ส่วนรายการสินค้า (แสดงเหมือน Product Detail) */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Stack spacing={1} sx={{ mt: 0 }}>
                    {/* วนลูป Battery */}
                    {batteryList.map((item, index) => (
                        <Box key={`bat-${item.id}-${index}`} sx={{ position: 'relative' }}>
                            {/* (Optional) ใส่ Label บอกว่าเป็นแบตเตอรี่ ถ้าต้องการ */}
                            <Chip label="Battery" size="small" color="success" variant="outlined" sx={{ mb: 1 }} />
                            <ProductDetailComponent productDetail={mapAccessoryToProductDetail(item)} />
                        </Box>
                    ))}

                    {/* วนลูป Charger */}
                    {chargerList.map((item, index) => (
                        <Box key={`chg-${item.id}-${index}`} sx={{ position: 'relative' }}>
                            {/* (Optional) ใส่ Label บอกว่าเป็นแท่นชาร์จ ถ้าต้องการ */}
                            <Chip label="Charger" size="small" color="warning" variant="outlined" sx={{ mb: 1 }} />
                            <ProductDetailComponent productDetail={mapAccessoryToProductDetail(item)} />
                        </Box>
                    ))}
                </Stack>
            </Collapse>
        </Box>
    );
};

const getComboItemDetail = (sku: string, mainDetail: ProductDetail) => {
    // @ts-ignore : assets อาจจะเป็น dynamic key
    const asset = mainDetail.assets?.[sku];
    if (!asset) return null;

    return {
        pid: asset.pid,
        pname: asset.pname,
        fac_model: asset.fac_model,
        image: Array.isArray(asset.imagesku) ? asset.imagesku[0] : asset.imagesku,
        warrantyperiod: asset.warrantyperiod,
        warrantycondition: asset.warrantycondition,
        warrantynote: asset.warrantynote,
        power_accessories: null
    };
};

const getMainAssetDetail = (mainAsset: any) => {
    if (!mainAsset) return null;

    return {
        pid: mainAsset.pid,
        pname: mainAsset.pname,
        fac_model: mainAsset.facmodel,
        image: Array.isArray(mainAsset.imagesku) ? mainAsset.imagesku[0] : (mainAsset.imagesku || mainAsset.image),
        warrantyperiod: mainAsset.warrantyperiod,
        warrantycondition: mainAsset.warrantycondition,
        warrantynote: mainAsset.warrantynote,
        power_accessories: null
    };
};

export default function WarrantyForm({ channel_list, has_phone, current_phone }: { channel_list: Channel[]; has_phone: boolean; current_phone: string }) {
    // const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    console.log("📦 [WarrantyForm] channel_list:", channel_list);
    // @ts-ignore
    const { user } = usePage().props.auth;
    const { t } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [openExampleFile, setOpenExampleFile] = useState(false);

    const [showProduct, setShowProduct] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [ProductDetail, setProductDetail] = useState<ProductDetail | null>(null);

    const [snVerified, setSnVerified] = useState(false);
    const [expandCombo, setExpandCombo] = useState(false);

    const { data, setData, processing, errors, post }: WarrantyFormProps = useForm({
        warranty_file: '',
        serial_number: '',
        // @ts-ignore
        // phone: user.phone,
        phone: current_phone,
        model_code: '',
        model_name: '',
        product_name: '',
        buy_from: 'เลือก',
        buy_date: '',
        store_name: '',
        customer_code: '',
        pc_code: '',
    });

    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [openModal, setOpenModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showForm, setShowForm] = useState(false);
    const [checking, setChecking] = useState(false);

    const [storeList, setStoreList] = useState<string[]>([]);
    const [loadingBuyform, setLoadingBuyFrom] = useState(false);

    // QR Scanner
    const [openQrScanner, setOpenQrScanner] = useState(false);
    const [qrScanSuccess, setQrScanSuccess] = useState(false);

    const [showReferralField, setShowReferralField] = useState(false);
    const [storeLabel, setStoreLabel] = useState<string>(t.Warranty.Form.store_name);

    const [openPcQrScanner, setOpenPcQrScanner] = useState(false);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // รีเซ็ตเฉพาะตอนผู้ใช้ “พิมพ์แก้”
    // const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = e.target;

    //     if (name === 'serial_number' || name === 'model_code') {
    //         setShowProduct(false);
    //         setShowForm(false);
    //         setSnVerified(false);
    //         setProductDetail(null);
    //         setPreview(null);
    //         setFileName('');
    //     }

    //     setData(name, value);
    // };

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'serial_number') {
            setShowProduct(false);
            setShowForm(false);
            setSnVerified(false);
            setProductDetail(null);
            setPreview(null);
            setFileName('');

            setData((prev: any) => ({
                ...prev,
                serial_number: value,
                model_code: '',
                model_name: '',
                product_name: '',
            }));
            return;
        }

        if (name === 'model_code') {
            setShowProduct(false);
            setShowForm(false);
            setSnVerified(false);
            setProductDetail(null);
            setPreview(null);
            setFileName('');
        }

        setData(name, value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("warranty_file", file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleCheckProduct = async () => {
        const serial = data.serial_number.trim();
        const model = data.model_code.trim();

        // ต้องมีอย่างน้อยหนึ่งอย่าง
        if (!serial && !model) {
            Swal.fire({
                title: 'กรุณากรอกหมายเลขเครื่อง (S/N)',
                icon: 'warning',
                confirmButtonColor: '#F54927',
            });
            return;
        }

        try {
            setLoadingProduct(true);
            setShowProduct(false);
            setShowForm(false);
            setSnVerified(false);

            // ส่งพารามิเตอร์ที่ผู้ใช้กรอกเท่านั้น
            const payload: any = {};
            if (serial) payload.sn = serial;
            if (model) payload.model_code = model;

            const response = await axios.post(route('warranty.check.sn'), payload);
            console.log("🔍 API Response:", response.data);

            // ไม่ว่าซ้ำหรือไม่ ถ้ามี product_detail ให้แสดงกล่องสินค้าได้
            const pd = response.data?.data?.product_detail;
            if (pd) {
                setProductDetail(pd);
                setShowProduct(true);
                setShowForm(false);
                setSnVerified(false);

                // เติม field อัตโนมัติ (ถ้าไม่มีในฟอร์ม)
                setData((prev: any) => ({
                    ...prev,
                    model_code: prev.model_code || pd.pid || "",
                    model_name: pd.fac_model || "",
                    product_name: pd.pname || "",
                }));

                Swal.fire({
                    title: 'ตรวจสอบสินค้าสำเร็จ',
                    text: 'กรุณากด "ลงทะเบียนรับประกัน" เพื่อดำเนินการต่อ',
                    icon: 'success',
                    confirmButtonColor: '#28a745',
                });
            } else {
                Swal.fire({
                    title: 'ไม่พบข้อมูลสินค้า',
                    text: 'กรุณาตรวจสอบ S/N หรือ รหัสสินค้า แล้วลองใหม่อีกครั้ง',
                    icon: 'warning',
                    confirmButtonColor: '#F54927',
                });
                setShowProduct(false);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'เกิดข้อผิดพลาดระหว่างตรวจสอบสินค้า';
            Swal.fire({ title: msg, icon: 'error', confirmButtonColor: '#F54927' });
            setShowProduct(false);
        } finally {
            setLoadingProduct(false);
        }
    };

    // ตรวจสอบการรับประกัน/ลงทะเบียน: เช็ก duplicate แล้ว “บล็อก”
    const handleCheckSn = async () => {
        const serial = data.serial_number.trim();
        const model = data.model_code.trim();

        if (!serial) {
            return Swal.fire({ title: 'กรุณากรอก Serial Number', icon: 'warning', confirmButtonColor: '#F54927' });
        }

        // if (!model) {
        //     return Swal.fire({ title: 'กรุณากรอกรหัสสินค้า', icon: 'warning', confirmButtonColor: '#F54927' });
        // }

        try {
            setChecking(true);
            setShowForm(false);
            setSnVerified(false);

            const response = await axios.post(route('warranty.check.sn'), { sn: serial, model_code: model });

            const status = response.data?.status;
            const isDup = status === 'duplicate' || response.data?.data?.duplicate === true;

            if (isDup) {
                return Swal.fire({
                    title: response.data?.message || 'รายการนี้ถูกลงทะเบียนรับประกันแล้ว',
                    icon: 'error',
                    confirmButtonColor: '#F54927',
                });
            }

            setShowForm(true);
            setSnVerified(true);

            if (response.data?.data?.product_detail) {
                setProductDetail(response.data.data.product_detail);
                setShowProduct(true);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || "เกิดข้อผิดพลาด";
            Swal.fire({ title: msg, icon: 'error', confirmButtonColor: '#F54927' });
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
        if (!data.buy_from || data.buy_from === 'เลือก') {
            Swal.fire(t.Warranty.Validate.AlertMessage.buy_from, '', 'warning');
            return;
        }
        if (!data.store_name?.trim()) {
            Swal.fire(t.Warranty.Validate.AlertMessage.store_name, '', 'warning');
            return;
        }
        if (!data.buy_date) {
            Swal.fire(t.Warranty.Validate.AlertMessage.buy_date, '', 'warning');
            return;
        }

        // ✅ เช็คเบอร์โทร (ถ้าไม่มีในระบบ ต้องกรอก)
        if (!has_phone) {
            if (!data.phone || data.phone.length !== 10) {
                Swal.fire('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก', '', 'warning');
                return;
            }
        }

        post(route('warranty.form.store'), {
            forceFormData: true,
            onError: (errors: any) => {
                console.error("Errors: ", errors);
                const messages = Object.values(errors).join('\n');
                if (messages) Swal.fire('ข้อมูลไม่ถูกต้อง', messages, 'error');
            },
            onFinish: () => {
                console.log("Submit finished");
            },
        });
    };

    const handleBuyFromChange = useCallback((value: string) => {
        console.log("🟠 [handleBuyFromChange] เริ่มทำงาน", { value });
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
        console.log("🔍 ตรวจสอบร้านค้า:", { value, isBigStore });

        setStoreLabel(isBigStore ? "Branch Name (ชื่อสาขา)" : t.Warranty.Form.store_name);
        setShowReferralField(isBigStore);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { handleChangeStoreName(value); }, 500);

        console.log("✅ [handleBuyFromChange] ตั้งค่าครบแล้ว", {
            buy_from: value,
            storeLabel: isBigStore ? "Branch Name (ชื่อสาขา)" : t.Warranty.Form.store_name,
            showReferralField: isBigStore,
        });
    }, [setData]);

    // const handleChangeStoreName = async (buy_from: string) => {
    //     console.log("📦 [handleChangeStoreName] เริ่มโหลดร้าน:", buy_from);
    //     if (!buy_from || buy_from === 'เลือก') { setLoadingBuyFrom(false); return; }

    //     try {
    //         const response = await axios.get(route('warranty.get_store_name', { store_name: buy_from }));
    //         console.log("✅ [handleChangeStoreName] ตอบกลับจาก API:", response.data);
    //         setStoreList(response.data.list.value || []);
    //     } catch (error) {
    //         console.error('Error fetching store names:', error);
    //         setStoreList([]);
    //     } finally {
    //         setLoadingBuyFrom(false);
    //     }
    // };

    const handleChangeStoreName = async (buy_from: string) => {
        console.log("📦 [handleChangeStoreName] เริ่มโหลดร้าน:", buy_from);

        if (!buy_from || buy_from === 'เลือก') {
            setLoadingBuyFrom(false);
            return;
        }

        // ✅ หา ID จาก channel_list โดยเทียบกับชื่อ (buy_from)
        // channel_list เป็น any[] หรือสร้าง interface ให้ชัดเจนก็ได้
        const selectedChannel = channel_list.find((c: any) => c.name === buy_from);
        const channelId = selectedChannel ? selectedChannel.id : null;

        if (!channelId) {
            console.warn("❌ ไม่พบ ID ของช่องทางนี้:", buy_from);
            setLoadingBuyFrom(false);
            return;
        }

        try {
            // ✅ ส่ง ID ไปที่ Controller แทนการส่งชื่อ
            const response = await axios.get(route('warranty.get_store_name', { id: channelId }));

            console.log("✅ [handleChangeStoreName] ตอบกลับจาก API:", response.data);

            // ✅ setStoreList ตามโครงสร้างที่ API ใหม่ส่งกลับมา (Array of Strings)
            setStoreList(response.data.list || []);

        } catch (error) {
            console.error('Error fetching store names:', error);
            setStoreList([]);
        } finally {
            setLoadingBuyFrom(false);
        }
    };

    // const handleQrSuccess = (decodedText: string) => {
    //     setData('customer_code', decodedText);
    //     setQrScanSuccess(true);
    //     setOpenQrScanner(false);
    //     setTimeout(() => setQrScanSuccess(false), 3000);
    // };

    const handleQrSuccess = (decodedText: string) => {
        setData('pc_code', decodedText);
        setQrScanSuccess(true);
        setOpenQrScanner(false);
        setTimeout(() => setQrScanSuccess(false), 3000);
    };

    const handleOpenQrScanner = () => setOpenQrScanner(true);
    const handleCloseQrScanner = () => setOpenQrScanner(false);


    const handlePcQrSuccess = (decodedText: string) => {
        setData('pc_code', decodedText); // ใส่ค่าลงใน form data
        setOpenPcQrScanner(false); // ปิดกล้อง
        // Swal.fire('สแกนสำเร็จ', `รหัส PC: ${decodedText}`, 'success'); // (Optional: แสดงแจ้งเตือน)
    };

    return (
        <MobileAuthenticatedLayout title={t.Warranty.title}>
            <Head title={t.Warranty.title} />

            {/* Modals */}
            {openExampleFile && <ExampleWarrantyFile open={openExampleFile} setOpen={setOpenExampleFile} />}
            {openModal && <PreviewFileUpload open={openModal} setOpen={setOpenModal} preview={preview} />}

            {/* QR Scanner Dialog */}
            <Dialog open={openQrScanner} onClose={handleCloseQrScanner} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                            <CameraAlt color="primary" />
                            <Typography variant="h6" fontWeight="bold">สแกน QR Code</Typography>
                        </Box>
                        <IconButton onClick={handleCloseQrScanner} size="small"><Close /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box textAlign="center" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                            นำกล้องไปสแกน QR Code เพื่อรับรหัสลูกค้าอัตโนมัติ
                        </Typography>
                    </Box>
                    <Html5QrcodePlugin defaultCamera="back" fps={10} qrbox={250} disableFlip={false} qrCodeSuccessCallback={handleQrSuccess} />
                </DialogContent>
            </Dialog>

            <Container maxWidth={isMobile ? 'sm' : 'lg'} sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}>
                {qrScanSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setQrScanSuccess(false)}>
                        สแกน QR Code สำเร็จแล้ว! รหัสลูกค้าถูกเพิ่มเข้าฟอร์มอัตโนมัติ
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>

                        {/* File Upload Section */}
                        {/* {showForm && (
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
                                        "&:hover": { bgcolor: preview ? "primary.100" : "#f0f0f0", borderColor: "primary.main" },
                                    }}
                                >
                                    <label htmlFor="warranty_file" style={{ cursor: "pointer" }}>
                                        {preview ? (
                                            <Stack spacing={2}>
                                                <Box
                                                    component="img"
                                                    src={preview}
                                                    alt="Warranty Preview"
                                                    sx={{ maxHeight: 120, objectFit: "contain", borderRadius: 1, mx: "auto" }}
                                                    onClick={(e) => { e.stopPropagation(); setOpenModal(true); }}
                                                />
                                                <Typography variant="body2" color="text.secondary" noWrap sx={{ fontStyle: "italic", textAlign: "center" }}>
                                                    {fileName || "ยังไม่ได้เลือกไฟล์"}
                                                </Typography>
                                                <Chip label="เปลี่ยนไฟล์ใหม่" color="primary" variant="outlined" size="small" />
                                            </Stack>
                                        ) : (
                                            <Stack spacing={1}>
                                                <FileUpload fontSize="large" color="primary" />
                                                <Typography color="text.secondary" fontWeight="medium">{t.Warranty.Form.file}</Typography>
                                                <Typography variant="caption" color="text.secondary">{t.Warranty.Form.validateFile}</Typography>
                                            </Stack>
                                        )}
                                    </label>
                                    <input
                                        id="warranty_file"
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setData("warranty_file", file);
                                                setPreview(URL.createObjectURL(file));
                                                setFileName(file.name);
                                            }
                                        }}
                                        ref={fileInputRef}
                                    />
                                </Box>
                                <Box mt={2}>
                                    <Button fullWidth variant="outlined" onClick={() => setOpenExampleFile(true)} sx={{ py: 1.5 }}>
                                        {t.Warranty.Form.example_file}
                                    </Button>
                                </Box>
                            </Grid>
                        )} */}

                        {/* Serial Number */}
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
                                                // handleCheckSn();
                                                handleCheckProduct();
                                            }
                                        }}
                                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                                                    model_code: '',
                                                    model_name: '',
                                                    product_name: '',
                                                    buy_from: 'เลือก',
                                                    buy_date: '',
                                                    store_name: '',
                                                    customer_code: '',
                                                    pc_code: '',
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

                        {/* Model Code */}
                        {showProduct && (
                            <Grid size={12}>
                                <FormControl fullWidth>
                                    <FormLabel htmlFor="model_code" required sx={{ mb: 1, fontWeight: 'medium' }}>
                                        รหัสสินค้า
                                    </FormLabel>
                                    <TextField
                                        id="model_code"
                                        name="model_code"
                                        value={data.model_code}
                                        onChange={handleOnChange}
                                        required
                                        disabled
                                        placeholder="รหัสรุ่นสินค้า"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </FormControl>
                            </Grid>
                        )}

                        {/* ปุ่มตรวจสอบสินค้า */}
                        {!showProduct && !snVerified && (
                            <Grid size={12}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleCheckProduct}
                                    disabled={loadingProduct || checking}
                                    sx={{ py: 1.5, borderRadius: 2 }}
                                >
                                    {loadingProduct ? (<><CircularProgress size={20} sx={{ mr: 1 }} />กำลังตรวจสอบสินค้า...</>) : "ตรวจสอบสินค้า"}
                                </Button>
                            </Grid>
                        )}

                        {/* แสดงรายละเอียดสินค้า */}
                        {loadingProduct ? (
                            <Grid size={12}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", py: 4 }}>
                                    <CircularProgress size={32} sx={{ mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">{t.History.Information.loading || "กำลังโหลดข้อมูลสินค้า..."}</Typography>
                                </Box>
                            </Grid>
                        ) : (
                            showProduct && ProductDetail && (
                                <Grid size={12}>
                                    {/* Logic การแสดงผล Combo Set */}
                                    {ProductDetail.is_combo ? (
                                        <Stack spacing={0}>

                                            {/* 1. แสดงสินค้าหลัก (Main Asset / กล่องรวม) เสมอ */}
                                            {ProductDetail.main_assets && (
                                                <Box>
                                                    {/* <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                                                        สินค้าหลัก (Main Set):
                                                    </Typography> */}
                                                    {(() => {
                                                        const mainDetail = getMainAssetDetail(ProductDetail.main_assets);
                                                        return mainDetail ? <ProductDetailComponent productDetail={mainDetail} /> : null;
                                                    })()}
                                                </Box>
                                            )}

                                            {/* 2. ส่วนแสดงรายการสินค้าภายในชุด (Collapsible) */}
                                            {ProductDetail.combo_skus && ProductDetail.combo_skus.length > 0 && (
                                                <Box sx={{
                                                }}>
                                                    {/* Header ปุ่มกด ย่อ/ขยาย */}
                                                    <Box
                                                        onClick={() => setExpandCombo(!expandCombo)}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            gap: 1,
                                                            px: 1,
                                                            py: 0,
                                                            mb: 1,
                                                            mt: 1,
                                                            bgcolor: 'primary.50',
                                                            borderRadius: 2,
                                                            // border: '1px dashed',
                                                            borderColor: 'primary.200',
                                                            cursor: 'pointer',
                                                            userSelect: 'none',
                                                            transition: 'all 0.2s',
                                                            '&:hover': { bgcolor: 'primary.100' }
                                                        }}
                                                    >
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Assessment color="primary" />
                                                            <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                                                                combo set ({ProductDetail.combo_skus.length} รายการ)
                                                            </Typography>
                                                        </Box>
                                                        {/* ไอคอนลูกศร */}
                                                        <IconButton size="small" sx={{ color: 'primary.main', p: 0.5 }}>
                                                            {expandCombo ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                        </IconButton>
                                                    </Box>

                                                    {/* ส่วนเนื้อหาที่ ย่อ/ขยาย ได้ */}
                                                    <Collapse in={expandCombo} timeout="auto" unmountOnExit>
                                                        <Stack spacing={1} sx={{ mt: 0 }}>
                                                            {ProductDetail.combo_skus.map((sku) => {
                                                                const itemDetail = getComboItemDetail(sku, ProductDetail);
                                                                if (!itemDetail) return null;
                                                                return (
                                                                    <Box key={sku} sx={{ position: 'relative' }}>
                                                                        <ProductDetailComponent productDetail={itemDetail} />
                                                                    </Box>
                                                                );
                                                            })}
                                                        </Stack>
                                                    </Collapse>
                                                </Box>
                                            )}
                                        </Stack>
                                    ) : (
                                        // กรณีสินค้าเดี่ยว (Single Product)
                                        <ProductDetailComponent productDetail={ProductDetail} />
                                    )}
                                    {/* แสดง Accessories ต่อท้ายเสมอ (ถ้ามี) */}
                                    {ProductDetail.power_accessories && (
                                        <PowerAccessoriesList accessories={ProductDetail.power_accessories} />
                                    )}
                                </Grid>
                            )
                        )}

                        {/* ปุ่มตรวจสอบการรับประกัน */}
                        {!snVerified && (
                            <Grid size={12}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    disabled={!showProduct || checking}
                                    onClick={handleCheckSn}
                                    sx={{ py: 1.5, borderRadius: 2 }}
                                >
                                    {checking ? (<><CircularProgress size={20} sx={{ mr: 1 }} />{t.Warranty.Form.CheckingWaranty}</>) : t.Warranty.Form.CheckWaranty}
                                </Button>
                            </Grid>
                        )}

                        {/* ฟิลด์ลงทะเบียน */}
                        {showForm && (
                            <>
                                {!has_phone && (
                                    <Grid size={{ xs: 12, md: 12 }} sx={{ mt: 0 }}>
                                        <FormControl fullWidth>
                                            <FormLabel htmlFor="phone" required sx={{ mb: 1, fontWeight: "medium" }}>
                                                {t.Warranty.Form.phone}
                                            </FormLabel>

                                            <TextField
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={data.phone}
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
                                                // placeholder="เช่น 0812345678"
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
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: "text.secondary",
                                                                        fontWeight: 500,
                                                                        mr: 0.5,
                                                                    }}
                                                                >
                                                                </Typography>
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                )}

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
                                                "&:hover": { bgcolor: preview ? "primary.100" : "#f0f0f0", borderColor: "primary.main" },
                                            }}
                                        >
                                            <label htmlFor="warranty_file" style={{ cursor: "pointer" }}>
                                                {preview ? (
                                                    <Stack spacing={2}>
                                                        <Box
                                                            component="img"
                                                            src={preview}
                                                            alt="Warranty Preview"
                                                            sx={{ maxHeight: 120, objectFit: "contain", borderRadius: 1, mx: "auto" }}
                                                            onClick={(e) => { e.stopPropagation(); setOpenModal(true); }}
                                                        />
                                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ fontStyle: "italic", textAlign: "center" }}>
                                                            {fileName || "ยังไม่ได้เลือกไฟล์"}
                                                        </Typography>
                                                        <Chip label="เปลี่ยนไฟล์ใหม่" color="primary" variant="outlined" size="small" />
                                                    </Stack>
                                                ) : (
                                                    <Stack spacing={1}>
                                                        <FileUpload fontSize="large" color="primary" />
                                                        <Typography color="text.secondary" fontWeight="medium">{t.Warranty.Form.file}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{t.Warranty.Form.validateFile}</Typography>
                                                    </Stack>
                                                )}
                                            </label>
                                            {/* <input
                                                id="warranty_file"
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                hidden
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setData("warranty_file", file);
                                                        setPreview(URL.createObjectURL(file));
                                                        setFileName(file.name);
                                                    }
                                                }}
                                                ref={fileInputRef}
                                            /> */}
                                            <input
                                                id="capture_file"
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                hidden
                                                onChange={handleFileChange}
                                            />
                                            <input
                                                id="browse_file"
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={handleFileChange}
                                            />
                                            <Stack
                                                direction={isMobile ? "column" : "row"} // มือถือเรียงลง, จอใหญ่เรียงข้าง
                                                spacing={2}
                                                sx={{
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    mt: 2
                                                }}
                                            >
                                                <Button
                                                    fullWidth={isMobile} // เต็มจอเมื่อเป็นมือถือ
                                                    variant="contained"
                                                    onClick={() => document.getElementById('capture_file')?.click()}
                                                    startIcon={<CameraAlt />}
                                                >
                                                    ถ่ายรูปใหม่
                                                </Button>
                                                <Button
                                                    fullWidth={isMobile}
                                                    variant="outlined"
                                                    onClick={() => document.getElementById('browse_file')?.click()}
                                                    startIcon={<FileUpload />}
                                                >
                                                    เลือกจากคลังภาพ
                                                </Button>
                                            </Stack>
                                        </Box>
                                        <Box mt={2}>
                                            <Button fullWidth variant="outlined" onClick={() => setOpenExampleFile(true)} sx={{ py: 1.5 }}>
                                                {t.Warranty.Form.example_file}
                                            </Button>
                                        </Box>
                                    </Grid>
                                )}

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
                                            <MenuItem disabled value={'เลือก'}>{t.Warranty.Form.SelectBuyFrom}</MenuItem>
                                            {/* {channel_list.map((channel, index) => (
                                                <MenuItem key={index} value={channel}>{channel}</MenuItem>
                                            ))} */}
                                            {channel_list.map((channel: any, index) => {
                                                // ตรวจสอบว่า channel เป็น object หรือ string
                                                // ถ้าเป็น object ให้ดึง .name, ถ้าเป็น string ให้ใช้ค่าตัวมันเอง
                                                const channelName = typeof channel === 'object' && channel !== null ? channel.name : channel;

                                                return (
                                                    <MenuItem key={index} value={channelName}>
                                                        {channelName} {/* แสดงผลเฉพาะชื่อที่เป็น string */}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={12}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="store_name" required sx={{ mb: 1, fontWeight: 'medium' }}>
                                            {storeLabel}
                                        </FormLabel>
                                        {loadingBuyform ? (
                                            <Box display="flex" alignItems="center" gap={1} p={2}>
                                                <CircularProgress size={20} />
                                                <Typography variant="body2">กำลังโหลดร้านค้า...</Typography>
                                            </Box>
                                        ) : (
                                            <Autocomplete
                                                options={Array.from(new Set(storeList))}
                                                // ถ้าต้องการมั่นใจว่าไม่มีค่าว่างหลุดมา ให้ใช้แบบนี้แทนก็ได้ครับ
                                                // options={Array.from(new Set(storeList)).filter(Boolean)}
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

                                {/* {showReferralField && (
                                    <Grid size={12}>
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
                                                inputProps={{ maxLength: 5, inputMode: "numeric", pattern: "[0-9]*" }}
                                                disabled={processing}
                                                placeholder={t.Warranty.Validate.customer_code}
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                                slotProps={{
                                                    input: {
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                {false && (
                                                                    <IconButton
                                                                        onClick={handleOpenQrScanner}
                                                                        color="primary"
                                                                        sx={{ bgcolor: "primary.50", "&:hover": { bgcolor: "primary.100" } }}
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
                                )} */}

                                {showReferralField && (
                                    <Grid size={12}>
                                        <FormControl fullWidth>
                                            <FormLabel htmlFor="pc_code" sx={{ mb: 1, fontWeight: "medium" }}>
                                                {t.Warranty.Form.customer_code_title}
                                            </FormLabel>
                                            <TextField
                                                id="pc_code"
                                                name="pc_code"
                                                value={data.pc_code}
                                                onChange={(e) => {
                                                    // ✅ แก้ไข: รับค่าตามที่พิมพ์จริง (ไม่ต้องกรองเอาแค่ตัวเลข)
                                                    setData("pc_code", e.target.value);
                                                }}
                                                // ✅ แก้ไข: ลบ pattern และ inputMode numeric ออกเพื่อให้คีย์บอร์ดเป็นแบบปกติ
                                                inputProps={{
                                                    // สามารถใส่ maxLength หรือ style อื่นๆ ที่ต้องการได้ที่นี่
                                                }}
                                                disabled={processing}
                                                placeholder={t.Warranty.Validate.customer_code}
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                                slotProps={{
                                                    input: {
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                {false && (
                                                                    <IconButton
                                                                        onClick={handleOpenQrScanner}
                                                                        color="primary"
                                                                        sx={{ bgcolor: "primary.50", "&:hover": { bgcolor: "primary.100" } }}
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
                                            onChange={(newValue) => setData("buy_date", newValue ? newValue.format("YYYY-MM-DD") : "")}
                                            maxDate={dayjs()}
                                            minDate={dayjs().subtract(15, "days")}
                                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                            slotProps={{ textField: { readOnly: true, title: "กรุณาเลือกวันที่จากปฏิทินเท่านั้น" } }}
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
                                        sx={{ py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 'bold' }}
                                    >
                                        {processing ? 'กำลังส่งข้อมูล...' : t.Warranty.Form.submit}
                                    </Button>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </form>
            </Container>
            {/* --- PC QR Scanner Dialog --- */}
            <Dialog
                open={openPcQrScanner}
                onClose={() => setOpenPcQrScanner(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile} // ✅ 1. สั่งให้เต็มจอเมื่อเป็นมือถือ
                sx={{
                    '& .MuiDialog-paper': {
                        m: 0, // ลบขอบ
                        bgcolor: 'black' // พื้นหลังสีดำเหมือนแอปกล้อง
                    }
                }}
            >
                {/* ส่วนหัว (ทำเป็น Overlay ซ้อนบนกล้อง หรือแถบด้านบน) */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)'
                }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        สแกนรหัส PC
                    </Typography>
                    <IconButton onClick={() => setOpenPcQrScanner(false)} sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </Box>

                <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'black' }}>
                    <Box width="100%">
                        {/* กล้องจะเปิดอัตโนมัติเมื่อ Component นี้ถูกโหลด */}
                        <Html5QrcodePlugin
                            defaultCamera="back"
                            fps={10}
                            qrbox={250}
                            disableFlip={false}
                            qrCodeSuccessCallback={handlePcQrSuccess}
                        />
                        <Typography variant="body2" sx={{ color: '#ccc', textAlign: 'center', mt: 2 }}>
                            วาง QR Code ให้อยู่ในกรอบเพื่อสแกน
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </MobileAuthenticatedLayout>
    );
}