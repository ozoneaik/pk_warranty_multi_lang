import React, { useState, useMemo } from "react";
import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    Chip,
    Grid,
    TextField,
    InputAdornment,
    Container,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { CheckCircle, Cancel, Search } from "@mui/icons-material";
import { useLanguage } from "@/context/LanguageContext";

interface HistoryProps {
    id: number;
    sn: string;
    pid: string;
    p_name: string;
    status: boolean;
    model_code: string;
    model_name: string;
    approval: string;
    serial_number: string;
    product_name: string;
    slip: string;
    insurance_expire: string;
}

const productPathMaster = import.meta.env.VITE_PRODUCT_IMAGE_URI;

export default function WarrantyHistory({ histories }: { histories: HistoryProps[] }) {
    const { t } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // state สำหรับเก็บคำค้นหา
    const [searchTerm, setSearchTerm] = useState("");

    // filter ข้อมูลตามคำค้นหา
    const filteredHistories = useMemo(() => {
        const search = searchTerm.toLowerCase();
        return histories.filter((item) => {
            return (
                item.serial_number?.toLowerCase().includes(search) ||
                item.model_code?.toLowerCase().includes(search) ||
                item.model_name?.toLowerCase().includes(search) ||
                item.product_name?.toLowerCase().includes(search)
            );
        });
    }, [searchTerm, histories]);

    return (
        <MobileAuthenticatedLayout title={t.History.title}>
            {/* กล่อง search */}
            <Container
                sx={{
                    position: "sticky",
                    top: 70,
                    zIndex: 10,
                    backgroundColor: "white",
                    pb: 1,
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t.History.Filter.Input.Placeholder}
                    label={t.History.Filter.Input.Label}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            )
                        }
                    }}
                />
            </Container>

            <Container
                maxWidth={isMobile ? "sm" : "lg"}
                sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}
            >
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <Stack spacing={2.5}>
                            {filteredHistories.length > 0 ? (
                                filteredHistories.map((item) => (
                                    <Card
                                        key={item.id}
                                        elevation={2}
                                        sx={{
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            transition: "transform 0.2s ease-in-out",
                                            "&:hover": {
                                                transform: "translateY(-2px)",
                                                boxShadow: 3,
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ padding: 3 }}>
                                            <Box display="flex" gap={3} alignItems="flex-start">
                                                {/* รูปสินค้า */}
                                                <Stack spacing={1}>
                                                    <Box
                                                        sx={{
                                                            borderRadius: 2,
                                                            overflow: "hidden",
                                                            boxShadow: 1,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <img
                                                            src={productPathMaster + `/${item.model_code}.jpg`}
                                                            onError={(e: any) => {
                                                                e.target.src = import.meta.env.VITE_DEFAULT_IMAGE;
                                                            }}
                                                            alt={item.model_name + item.product_name}
                                                            width={90}
                                                            height={90}
                                                            style={{
                                                                objectFit: "cover",
                                                                display: "block",
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            borderRadius: 2,
                                                            overflow: "hidden",
                                                            boxShadow: 1,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <img
                                                            src={item.slip}
                                                            alt={item.model_name + item.product_name}
                                                            width={90}
                                                            height={90}
                                                            style={{
                                                                objectFit: "cover",
                                                                display: "block",
                                                            }}
                                                            onError={(e: any) => {
                                                                e.target.src = import.meta.env.VITE_DEFAULT_IMAGE;
                                                            }}
                                                        />
                                                    </Box>
                                                </Stack>

                                                {/* ข้อมูลสินค้า */}
                                                <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: "1rem",
                                                            lineHeight: 1.3,
                                                            color: "text.primary",
                                                        }}
                                                    >
                                                        {item.model_code} {item.model_name} {item.product_name}
                                                    </Typography>

                                                    {/* S/N และรหัสสินค้า */}
                                                    <Stack spacing={0.5}>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: "text.secondary",
                                                                    fontWeight: 500,
                                                                    minWidth: "fit-content",
                                                                }}
                                                            >
                                                                {t.History.Card.SerialNumber} :
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontFamily: "monospace",
                                                                    backgroundColor: "grey.100",
                                                                    padding: "2px 6px",
                                                                    borderRadius: 1,
                                                                    fontSize: "0.8rem",
                                                                }}
                                                            >
                                                                {item.serial_number}
                                                            </Typography>
                                                        </Box>

                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: "text.secondary",
                                                                    fontWeight: 500,
                                                                    minWidth: "fit-content",
                                                                }}
                                                            >
                                                                {t.History.Card.ProductCode}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontFamily: "monospace",
                                                                    backgroundColor: "grey.100",
                                                                    padding: "2px 6px",
                                                                    borderRadius: 1,
                                                                    fontSize: "0.8rem",
                                                                }}
                                                            >
                                                                {item.model_code} {item.model_name}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>

                                                    {/* สถานะรับประกัน */}
                                                    <Box sx={{ mt: 1 }}>
                                                        <Chip
                                                            icon={
                                                                item?.approval === "Y" ? <CheckCircle /> : <Cancel />
                                                            }
                                                            label={
                                                                item?.approval === "Y"
                                                                    ? t.History.Card.Warranty.isTrue
                                                                    : t.History.Card.Warranty.isFalse
                                                            }
                                                            color={item?.approval === "Y" ? "success" : "error"}
                                                            variant="filled"
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: "0.75rem",
                                                                height: 28,
                                                            }}
                                                        />
                                                    </Box>
                                                    {item?.approval && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Chip
                                                                icon={
                                                                    item?.approval === "Y" ? <CheckCircle /> : <Cancel />
                                                                }
                                                                label={`รับประกันถึง : ${item.insurance_expire}`}
                                                                color={item?.approval === "Y" ? "success" : "error"}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    fontSize: "0.75rem",
                                                                    height: 28,
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" textAlign="center">
                                    ไม่พบข้อมูลที่ตรงกับ "{searchTerm}"
                                </Typography>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </MobileAuthenticatedLayout>
    );
}
