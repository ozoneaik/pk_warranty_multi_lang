import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { useForm, usePage } from "@inertiajs/react";
import { Assessment, FileUpload } from "@mui/icons-material";
import { Box, Button, Container, Autocomplete, FormControl, FormLabel, Grid, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography, useMediaQuery, useTheme, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useRef, useState } from "react";
import ProductDetailComponent from "./ProductDetailComponent";
import { useLanguage } from "@/context/LanguageContext";
import ExampleWarrantyFile from "./ExampleWarrantyFile";
import { PreviewFileUpload } from "./PreviewFileUpload";
import axios from "axios";
import dayjs from "dayjs";

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

    const { data, setData, processing, errors }: WarrantyFormProps = useForm({
        warranty_file: '',
        serial_number: '',
        // @ts-ignore
        phone: user.phone,
        model_code: '',
        model_name: '',
        product_name: '',
        buy_from: 'เลือก',
        buy_date: '',
        store_name: ''
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showForm, setShowForm] = useState(false);
    const [checking, setChecking] = useState(false);

    const [storeList, setStoreList] = useState<StoreItemProps | any>([]);
    const [loadingBuyform, setLoadingBuyFrom] = useState(false);

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
        try {
            setShowProduct(false);
            setChecking(true);
            setShowForm(false);
            const response = await axios.get(route('warranty.check.sn', { sn: data.serial_number }));
            const skusetFirstIndex = response.data.data.skuset[0];
            const res_product = response.data.data.assets[skusetFirstIndex];
            setShowProduct(true);
            setShowForm(true);
            setProductDetail({
                p_path: import.meta.env.VITE_PRODUCT_IMAGE_URI + "/" + res_product.pid + '.jpg',
                pid: res_product.pid,
                p_name: res_product.pname,
                fac_model: res_product.facmodel,
                warranty_status: false
            });
            setData('model_code', res_product.pid);
            setData('model_name', res_product.facmodel);
            setData('product_name', res_product.pname);
        } catch (error: any) {
            const error_msg = error.response?.data?.message || error.message;
            alert(error_msg)
            setShowForm(false);
        } finally {
            setChecking(false);
        }
    }

    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(data);
    }

    const handleBuyFromChange = (value: string) => {
        setData('buy_from', value);
        setLoadingBuyFrom(true);
        setData('store_name', null)
        // clear timeout เดิมก่อน
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // ตั้งเวลาใหม่
        debounceRef.current = setTimeout(() => {
            handleChangeStoreName(value);
        }, 500); // หน่วง 500ms
    };

    const handleChangeStoreName = async (buy_from: string) => {
        try {
            const response = await axios(route('warranty.get_store_name', { store_name: buy_from }));
            console.log(response.data.list.value);
            setStoreList(response.data.list.value)
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingBuyFrom(false);
        }
    }
    return (
        <MobileAuthenticatedLayout>
            {openExampleFile && <ExampleWarrantyFile open={openExampleFile} setOpen={setOpenExampleFile} />}
            {openModal && <PreviewFileUpload open={openModal} setOpen={setOpenModal} preview={preview} />}
            <Container maxWidth={isMobile ? 'sm' : 'lg'} sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {showForm && (
                            <Grid size={12}>
                                <Box
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        border: "2px dashed #ccc", borderRadius: 2,
                                        p: 2, textAlign: "center", cursor: "pointer",
                                        bgcolor: "#fafafa", "&:hover": { bgcolor: "#f0f0f0" },
                                    }}
                                >
                                    {preview ? (
                                        <Stack spacing={1}>
                                            <Box
                                                component="img" src={preview} alt="Warranty Preview"
                                                sx={{ maxHeight: 120, objectFit: "contain" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenModal(true);
                                                }}
                                            />
                                            <Button size="small">
                                                {t.Warranty.Form.file} ใหม่
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <>
                                            <FileUpload fontSize="large" color="primary" />
                                            <Typography color="text.secondary">
                                                {t.Warranty.Form.file}
                                            </Typography>
                                        </>

                                    )}
                                    <input
                                        ref={fileInputRef} type="file" accept="image/*" required
                                        hidden onChange={handleFileChange} name="warranty_file"
                                    />
                                </Box>
                                <br />
                                <Button fullWidth variant="outlined" onClick={() => setOpenExampleFile(true)}>
                                    {t.Warranty.Form.example_file}
                                </Button>
                            </Grid>
                        )}
                        <Grid size={12}>
                            <FormControl fullWidth>
                                <FormLabel htmlFor="serial_number" required>
                                    {t.Warranty.Form.serial_number}
                                </FormLabel>
                                <TextField
                                    id="serial_number" name="serial_number"
                                    value={data.serial_number} onChange={handleOnChange}
                                    required disabled={processing || checking} placeholder={t.Warranty.Placeholder.serial_number}
                                />
                            </FormControl>
                        </Grid>
                        <Grid size={12}>
                            <Stack direction='row' justifyContent='end'>
                                <Button
                                    disabled={!data.serial_number} loading={processing || checking}
                                    onClick={handleCheckSn}
                                >
                                    ตรวจสอบรับประกัน
                                </Button>
                            </Stack>
                        </Grid>
                        {showProduct && <ProductDetailComponent productDetail={ProductDetail} />}
                        {showForm && (
                            <>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="phone" required>
                                            {t.Warranty.Form.phone}
                                        </FormLabel>
                                        <TextField
                                            id="phone" name="phone" type="tel"
                                            value={data.phone} onChange={handleOnChange}
                                            required disabled={processing} 
                                            placeholder={t.Warranty.Placeholder.phone}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="buy_from" required>
                                            {t.Warranty.Form.buy_from}
                                        </FormLabel>
                                        <Select
                                            required
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={data.buy_from}
                                            variant="outlined"
                                            onChange={(e: SelectChangeEvent) => handleBuyFromChange(e.target.value)}
                                        >
                                            <MenuItem disabled value={'เลือก'}>
                                                เลือก
                                            </MenuItem>
                                            {channel_list.map((channel, index) => (
                                                <MenuItem key={index} value={channel}>
                                                    {channel}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {loadingBuyform ? (
                                    <>
                                        <CircularProgress /> {data.buy_from}
                                    </>
                                ) : (
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <FormLabel htmlFor="store_name" required>
                                                {t.Warranty.Form.store_name}
                                            </FormLabel>
                                            <Autocomplete
                                                options={storeList.map(
                                                    (item: any) => `${item.custgroup}${item.custname}${item.branch}`
                                                )}
                                                value={data.store_name}
                                                onChange={(_, newValue) => setData('store_name', newValue)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="outlined"
                                                        fullWidth
                                                    />
                                                )}
                                            />
                                        </FormControl>
                                    </Grid>
                                )}

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <FormLabel htmlFor="buy_date" required>
                                            {t.Warranty.Form.buy_date}
                                        </FormLabel>
                                        <DatePicker
                                            name="buy_date"
                                            onChange={(newValue) => {
                                                setData("buy_date", newValue ? newValue.format("YYYY-MM-DD") : "");
                                            }}
                                            maxDate={dayjs()}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid size={12}>
                                    <Button fullWidth variant="contained" type="submit" startIcon={<Assessment />}>
                                        {t.Warranty.Form.submit}
                                    </Button>
                                </Grid>
                            </>
                        )}

                    </Grid>
                </form>
            </Container >

        </MobileAuthenticatedLayout >
    )
}