import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { Assessment, FileUpload } from "@mui/icons-material";
import { Box, Button, FormControl, FormLabel, Grid, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useRef, useState } from "react";
import ProductDetailComponent from "./ProductDetailComponent";
import { useLanguage } from "@/context/LanguageContext";

interface WarrantyFormProps {
    data: {
        warranty_file: string,
        serial_number: string,
        model_code: string,
        model_name: string,
        product_name: string,
        buy_from: string,
        buy_date : string,
        phone: string,
        store_name : string
    },
    setData: (key : string, value : any) => void,
    processing: boolean,
    errors: any
}

interface ProductDetail {
    pid?: string,
    p_name?: string,
    warranty_status?: boolean
}

export default function WarrantyForm() {
    const {t} = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [showProduct, setShowProduct] = useState(false);
    const [ProductDetail, setProductDetail] = useState<ProductDetail>();

    const { data, setData, processing, errors }: WarrantyFormProps = useForm({
        warranty_file: '',
        serial_number: '',
        phone: '',
        model_code: '',
        model_name: '',
        product_name: '',
        buy_from: '',
        buy_date : '',
        store_name: ''
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        alert('hello')
        setShowProduct(true);
        setProductDetail({
            pid: '50277',
            p_name: 'เครื่องเจียรมือ',
            warranty_status: false
        });
        setData('model_code', '50277');
        setData('model_name' , 'เครื่องเจียรมือ');
        setData('product_name', 'เครื่องเจียรมือ');
    }

    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(data);
    }
    return (
        <MobileAuthenticatedLayout>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
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
                                <Box
                                    component="img" src={preview} alt="Warranty Preview"
                                    sx={{ maxHeight: 120, objectFit: "contain" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenModal(true);
                                    }}
                                />
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
                        <Button fullWidth variant="outlined">
                            {t.Warranty.Form.example_file}
                        </Button>
                    </Grid>
                    <Grid size={12}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="serial_number" required>
                                {t.Warranty.Form.serial_number}
                            </FormLabel>
                            <TextField
                                id="serial_number" name="serial_number"
                                value={data.serial_number} onChange={handleOnChange}
                                required disabled={processing} placeholder={t.Warranty.Placeholder.serial_number}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={12}>
                        <Stack direction='row' justifyContent='end'>
                            <Button disabled={!data.serial_number} onClick={handleCheckSn}>
                                ตรวจสอบรับประกัน
                            </Button>
                        </Stack>
                    </Grid>
                    {showProduct && <ProductDetailComponent productDetail={ProductDetail} />}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="phone" required>
                                {t.Warranty.Form.phone}
                            </FormLabel>
                            <TextField
                                id="phone" name="phone" type="tel"
                                value={data.phone} onChange={handleOnChange}
                                required disabled={processing} placeholder={t.Warranty.Placeholder.phone}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="buy_from" required>
                                {t.Warranty.Form.buy_from}
                            </FormLabel>
                            <TextField
                                id="buy_from" name="buy_from"
                                value={data.buy_from} onChange={handleOnChange}
                                required disabled={processing} placeholder={t.Warranty.Placeholder.buy_from}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="store_name" required>
                                {t.Warranty.Form.store_name}
                            </FormLabel>
                            <TextField
                                id="store_name" name="store_name"
                                value={data.store_name} onChange={handleOnChange}
                                required disabled={processing} placeholder={t.Warranty.Placeholder.store_name}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <FormLabel htmlFor="buy_date" required>
                                {t.Warranty.Form.buy_date}
                            </FormLabel>
                            <DatePicker />
                        </FormControl>
                    </Grid>
                    <Grid size={12}>
                        <Button fullWidth variant="contained" type="submit" startIcon={<Assessment />}>
                            {t.Warranty.Form.submit}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </MobileAuthenticatedLayout>
    )
}