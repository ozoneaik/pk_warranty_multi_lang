
import { useLanguage } from "@/context/LanguageContext";
import { Box, Card, CardContent, CardMedia, Stack, Typography } from "@mui/material";


interface ProductDetail {
    pid: string,
    p_name: string,
    warranty_status: boolean,
    fac_model: string
}

const BoxStyle = {
    width: '100%',
    borderRadius: 2,
    p: 2
}


export default function ProductDetailComponent({ productDetail }: { productDetail: ProductDetail | any }) {
    const { t } = useLanguage();
    return (
        <Card
            sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                p: 2,
                borderRadius: 3,
                boxShadow: 3,
                backgroundColor: productDetail.warranty_status ? "#e8f5e9" : "#ffebee",
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.01)" },
            }}
        >
            {/* รูปสินค้า */}
            <CardMedia
                component="img"
                sx={{
                    width: 120,
                    height: 120,
                    objectFit: "contain",
                    borderRadius: 2,
                    bgcolor: "#fff",
                }}
                image={productDetail.p_path}
                alt={productDetail.p_name}
            />

            {/* รายละเอียดสินค้า */}
            <CardContent sx={{ flex: 1 }}>
                <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {t.Warranty.Form.DetailPd}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        <strong>{t.Warranty.Form.CodePd} :</strong> {productDetail.pid} ({productDetail.fac_model})
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        <strong>{t.Warranty.Form.NamePd} :</strong> {productDetail.p_name}
                    </Typography>

                    <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{
                            color: productDetail.warranty_status ? "green" : "red",
                        }}
                    >
                        {t.Warranty.Form.StatusWaranty}:{" "}
                        {productDetail.warranty_status ? t.History.Card.Warranty.isTrue : t.History.Card.Warranty.isFalse}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    )
}