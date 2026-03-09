import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { useLanguage } from "@/context/LanguageContext";
import { router } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import {
    Box, Button, Typography, Grid, Paper, Divider, Container
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

// กำหนด Type ของ Props ตามที่คุณมีในหน้า Edit
interface ProfileShowProps {
    customer: any;
    vat?: any;
}

export default function ProfileShow({ customer, vat }: ProfileShowProps) {
    const { t } = useLanguage();

    // ฟังก์ชันสำหรับแสดงค่า ถ้าไม่มีข้อมูลให้แสดง "-"
    const displayValue = (value: string | null | undefined) => {
        return value ? value : "-";
    };

    return (
        <MobileAuthenticatedLayout title={t.Customer.title.mainTitle}>
            <Head title={t.Customer.title.mainTitle} />

            <Container maxWidth="md" sx={{ mt: 10, mb: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
                        sx={{ borderRadius: 1, px: 1.5, py: 0.5, fontSize: 13, textTransform: "none" }}
                        onClick={() => router.get(route("customer.profile.welcome"))}
                    >
                        {t.Customer.routeRedirect || "กลับหน้าหลัก"}
                    </Button>

                    <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                        sx={{ borderRadius: 1, px: 1.5, py: 0.5, fontSize: 13, textTransform: "none" }}
                        onClick={() => router.get(route("customer.profile.edit"))}
                    >
                        {t.Customer.show.editButton}
                    </Button>
                </Box>
 
                <header className="mb-4">
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {t.Customer.show.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t.Customer.show.subtitle}
                    </Typography>
                </header>
 
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: '#F54927' }}>
                        {t.Customer.form.formLengend}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
 
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Typography variant="caption" color="text.secondary">{t.Customer.show.fullName}</Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {displayValue(customer?.cust_firstname)} {displayValue(customer?.cust_lastname)}
                            </Typography>
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="caption" color="text.secondary">{t.Customer.form.gender}</Typography>
                            <Typography variant="body1" fontWeight="medium">{displayValue(customer?.cust_gender)}</Typography>
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="caption" color="text.secondary">{t.Customer.form.tel}</Typography>
                            <Typography variant="body1" fontWeight="medium">{displayValue(customer?.cust_tel)}</Typography>
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="caption" color="text.secondary">{t.Customer.form.email}</Typography>
                            <Typography variant="body1" fontWeight="medium">{displayValue(customer?.cust_email)}</Typography>
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="caption" color="text.secondary">{t.Customer.form.birthdate}</Typography>
                            <Typography variant="body1" fontWeight="medium">{displayValue(customer?.cust_birthdate)}</Typography>
                        </Grid>
                    </Grid>
 
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="caption" color="text.secondary">{t.Customer.form.address}</Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {displayValue(customer?.cust_full_address)} {displayValue(customer?.cust_subdistrict)} {displayValue(customer?.cust_district)} {displayValue(customer?.cust_province)} {displayValue(customer?.cust_zipcode)}
                        </Typography>
                    </Box>
                </Paper>
 
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: '#F54927' }}>
                        {t.Customer.show.taxInfoTitle}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
 
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Typography variant="caption" color="text.secondary">{t.Customer.show.taxName}</Typography>
                            <Typography variant="body1" fontWeight="medium">{displayValue(vat?.vat_cust_name)}</Typography>
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="caption" color="text.secondary">{t.Customer.show.taxTel}</Typography>
                            <Typography variant="body1" fontWeight="medium">{displayValue(vat?.vat_tel_c)}</Typography>
                        </Grid>
                    </Grid>
 
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="caption" color="text.secondary">{t.Customer.show.taxAddress}</Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {displayValue(vat?.vat_cust_address)} {displayValue(vat?.vat_cust_province)} {displayValue(vat?.vat_cust_district)} {displayValue(vat?.vat_cust_subdistrict)} {displayValue(vat?.vat_cust_zipcode)}
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </MobileAuthenticatedLayout>
    );
}