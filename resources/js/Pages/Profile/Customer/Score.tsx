import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Box, Typography, Stack, Button } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import { Head, router } from "@inertiajs/react";
import { useLanguage } from "@/context/LanguageContext";

export default function ScorePage() {
    const { t } = useLanguage();
    return (
        <MobileAuthenticatedLayout title={t.Score.title}>
            <Head title={t.Score.title} />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "80vh",
                    textAlign: "center",
                    p: 2,
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <ConstructionIcon sx={{ fontSize: 80, color: "#F54927" }} />
                    <Typography variant="h5" fontWeight="bold">
                        {t.Score.FeatureIsDeveloping}
                    </Typography>
                    {/* <Typography variant="body1" color="text.secondary">
                        เรากำลังทำให้ระบบคะแนนสะสมสมบูรณ์แบบมากที่สุดสำหรับคุณ
                    </Typography> */}

                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, borderRadius: 2 }}
                        onClick={() => router.get(route("customer.profile.welcome"))}
                    >
                        {t.Customer.routeRedirect}
                    </Button>
                </Stack>
            </Box>
        </MobileAuthenticatedLayout>
    );
}
