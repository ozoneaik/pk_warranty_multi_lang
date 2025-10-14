import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Box, Typography, Container, Button } from "@mui/material";
import { Head, router } from "@inertiajs/react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function InfoPDPA() {
    return (
        <MobileAuthenticatedLayout title="นโยบายความเป็นส่วนตัว (PDPA)">
            <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
                sx={{
                    mb: 2,
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    fontSize: 13,
                    textTransform: "none",
                }}
                onClick={() => router.get(route("customer.profile.score"))}
            >
                กลับ
            </Button>
            <Head title="นโยบายความเป็นส่วนตัว (PDPA)" />
            <Container maxWidth="md" sx={{ mt: 10, mb: 8, py: 2 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    นโยบายความเป็นส่วนตัว (PDPA)
                </Typography>
                <Typography paragraph>
                    
                </Typography>
                <Typography paragraph>
                    
                </Typography>
            </Container>
        </MobileAuthenticatedLayout>
    );
}