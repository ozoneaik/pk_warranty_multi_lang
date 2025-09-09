import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Box, Card, CardContent, Stack, Typography, Chip, Avatar, Grid, TextField, InputAdornment, Container, useTheme, useMediaQuery } from "@mui/material";
import { CheckCircle, Cancel, Search } from "@mui/icons-material";
import { useLanguage } from "@/context/LanguageContext";

interface HistoryProps {
    id: number,
    sn: string,
    pid: string,
    p_name: string,
    status: boolean
}

export default function WarrantyHistory({ histories }: { histories: [] }) {
    const { t } = useLanguage();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    return (
        <MobileAuthenticatedLayout title={t.History.title}>
            <Container sx={{
                position: "sticky", top: 70, zIndex: 10,
                backgroundColor: "white", pb: 1,
            }}>
                <TextField
                    fullWidth size="small"
                    placeholder={t.History.Filter.Input.Placeholder}
                    label={t.History.Filter.Input.Label}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

            </Container>

            <Container maxWidth={isMobile ? 'sm' : 'lg'} sx={{ flexGrow: 1, mt: 8, mb: 7, px: 2, py: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <Stack spacing={2.5}>
                            {histories.map((item: HistoryProps) => (
                                <Card
                                    key={item.id}
                                    elevation={2}
                                    sx={{
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: 3
                                        }
                                    }}
                                >
                                    <CardContent sx={{ padding: 3 }}>
                                        <Box display='flex' gap={3} alignItems='flex-start'>
                                            {/* รูปสินค้า */}
                                            <Box
                                                sx={{
                                                    borderRadius: 2,overflow: 'hidden',
                                                    boxShadow: 1,flexShrink: 0
                                                }}
                                            >
                                                <img
                                                    src={`https://images.dcpumpkin.com/images/product/500/${item.pid}.jpg`}
                                                    alt={item.p_name}
                                                    width={90}
                                                    height={90}
                                                    style={{
                                                        objectFit: 'cover',
                                                        display: 'block'
                                                    }}
                                                />
                                            </Box>

                                            {/* ข้อมูลสินค้า */}
                                            <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                                                {/* ชื่อสินค้า */}
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: '1rem',
                                                        lineHeight: 1.3,
                                                        color: 'text.primary'
                                                    }}
                                                >
                                                    {item.p_name}
                                                </Typography>

                                                {/* S/N และ รหัสสินค้า */}
                                                <Stack spacing={0.5}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: 'text.secondary',
                                                                fontWeight: 500,
                                                                minWidth: 'fit-content'
                                                            }}
                                                        >
                                                            {t.History.Card.SerialNumber} :
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontFamily: 'monospace',
                                                                backgroundColor: 'grey.100',
                                                                padding: '2px 6px',
                                                                borderRadius: 1,
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {item.sn}
                                                        </Typography>
                                                    </Box>

                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: 'text.secondary',
                                                                fontWeight: 500,
                                                                minWidth: 'fit-content'
                                                            }}
                                                        >
                                                            {t.History.Card.ProductCode}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontFamily: 'monospace',
                                                                backgroundColor: 'grey.100',
                                                                padding: '2px 6px',
                                                                borderRadius: 1,
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {item.pid}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                {/* สถานะรับประกัน */}
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip
                                                        icon={item.status ? <CheckCircle /> : <Cancel />}
                                                        label={item.status ? t.History.Card.Warranty.isTrue : t.History.Card.Warranty.isFalse}
                                                        color={item.status ? 'success' : 'error'}
                                                        variant="filled"
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                            height: 28
                                                        }}
                                                    />
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>

            </Container>

        </MobileAuthenticatedLayout>
    )
}