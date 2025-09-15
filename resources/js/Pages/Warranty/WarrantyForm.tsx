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
    const [ProductDetail, setProductDetail] = useState<ProductDetail>();

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
    const [openModal, setOpenModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showForm, setShowForm] = useState(false);
    const [checking, setChecking] = useState(false);

    const [storeList, setStoreList] = useState<StoreItemProps[]>([]);
    const [loadingBuyform, setLoadingBuyFrom] = useState(false);

    // QR Scanner states
    const [openQrScanner, setOpenQrScanner] = useState(false);
    const [qrScanSuccess, setQrScanSuccess] = useState(false);

    // Cleanup debounce on unmount
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

    const handleCheckSn = async () => {
        if (!data.serial_number.trim()) {
            alert('กรุณาใส่หมายเลขซีเรียล');
            return;
        }

        try {
            setShowProduct(false);
            setChecking(true);
            setShowForm(false);

            const response = await axios.get(route('warranty.check.sn', { sn: data.serial_number.trim() }));
            const skusetFirstIndex = response.data.data.skuset[0];
            const res_product = response.data.data.assets[skusetFirstIndex];

            setShowProduct(true);
            setShowForm(true);
            setProductDetail({
                p_path: `${import.meta.env.VITE_PRODUCT_IMAGE_URI}/${res_product.pid}.jpg`,
                pid: res_product.pid,
                p_name: res_product.pname,
                fac_model: res_product.facmodel,
                warranty_status: false
            });

            setData({
                ...data,
                model_code: res_product.pid,
                model_name: res_product.facmodel,
                product_name: res_product.pname,
            });
        } catch (error: any) {
            const error_msg = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาด';
            alert(error_msg);
            setShowForm(false);
        } finally {
            setChecking(false);
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('warranty.form.store'), {
            forceFormData: true,
            onError: (e) => {
                console.error("Errors: ", e);
            },
            onFinish: () => {
                console.log("Submit finished");
            }
        });
    }

    const handleBuyFromChange = useCallback((value: string) => {
        setData('buy_from', value);
        setLoadingBuyFrom(true);
        setData('store_name', '');
        setStoreList([]);

        // Clear existing timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set new timeout
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
                                    onClick={() => fileInputRef.current?.click()}
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
                                            borderColor: "primary.main"
                                        },
                                    }}
                                >
                                    {preview ? (
                                        <Stack spacing={2}>
                                            <Box
                                                component="img"
                                                src={preview}
                                                alt="Warranty Preview"
                                                sx={{
                                                    maxHeight: 120,
                                                    objectFit: "contain",
                                                    borderRadius: 1
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenModal(true);
                                                }}
                                            />
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
                                                คลิกเพื่ออัพโหลดใบรับประกัน (รูปภาพเท่านั้น)
                                            </Typography>
                                        </Stack>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        required
                                        // hidden
                                        style={{ zIndex: -1 }}
                                        onChange={handleFileChange}
                                        name="warranty_file"
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
                                <TextField
                                    id="serial_number"
                                    name="serial_number"
                                    value={data.serial_number}
                                    onChange={handleOnChange}
                                    required
                                    disabled={processing || checking}
                                    placeholder={t.Warranty.Placeholder.serial_number}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid>

                        {/* Check Serial Number Button */}
                        <Grid size={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                disabled={!data.serial_number.trim() || checking}
                                onClick={handleCheckSn}
                                sx={{ py: 1.5, borderRadius: 2 }}
                            >
                                {checking ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        กำลังตรวจสอบ...
                                    </>
                                ) : (
                                    'ตรวจสอบรับประกัน'
                                )}
                            </Button>
                        </Grid>

                        {/* Product Detail */}
                        {showProduct && <ProductDetailComponent productDetail={ProductDetail} />}

                        {/* Form Fields */}
                        {showForm && (
                            <>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="phone" required sx={{ mb: 1, fontWeight: 'medium' }}>
                                            {t.Warranty.Form.phone}
                                        </FormLabel>
                                        <TextField
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={handleOnChange}
                                            required
                                            disabled={processing}
                                            placeholder={t.Warranty.Placeholder.phone}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="customer_code" sx={{ mb: 1, fontWeight: 'medium' }}>
                                            {t.Warranty.Form.customer_code}
                                        </FormLabel>
                                        <TextField
                                            id="customer_code"
                                            name="customer_code"
                                            value={data.customer_code}
                                            onChange={handleOnChange}
                                            disabled={processing}
                                            placeholder={t.Warranty.Placeholder.customer_code}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={handleOpenQrScanner}
                                                                color="primary"
                                                                sx={{
                                                                    bgcolor: 'primary.50',
                                                                    '&:hover': { bgcolor: 'primary.100' }
                                                                }}
                                                            >
                                                                <QrCode />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
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
                                                เลือกช่องทางการซื้อ
                                            </MenuItem>
                                            {channel_list.map((channel, index) => (
                                                <MenuItem key={index} value={channel}>
                                                    {channel}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="store_name" required sx={{ mb: 1, fontWeight: 'medium' }}>
                                            {t.Warranty.Form.store_name}
                                        </FormLabel>
                                        {loadingBuyform ? (
                                            <Box display="flex" alignItems="center" gap={1} p={2}>
                                                <CircularProgress size={20} />
                                                <Typography variant="body2">กำลังโหลดร้านค้า...</Typography>
                                            </Box>
                                        ) : (
                                            <Autocomplete
                                                options={storeList.map(
                                                    (item) => `${item.custgroup} ${item.custname} ${item.branch}`
                                                )}
                                                value={data.store_name}
                                                onChange={(_, newValue) => setData('store_name', newValue || '')}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="outlined"
                                                        fullWidth
                                                        placeholder="เลือกร้านค้า"
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                    />
                                                )}
                                                noOptionsText="ไม่พบร้านค้า"
                                            />
                                        )}
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
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
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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