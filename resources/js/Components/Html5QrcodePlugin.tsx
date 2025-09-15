import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Stack,
    Chip
} from "@mui/material";
import { Refresh, CameraAlt, CheckCircle } from "@mui/icons-material";

const qrcodeRegionId = "html5qr-code-full-region";

// สร้าง config สำหรับ QR Scanner
const createConfig = (props: any) => {
    const config: any = {
        fps: props.fps || 10,
        qrbox: props.qrbox || 250,
        aspectRatio: props.aspectRatio || 1.0,
        disableFlip: props.disableFlip !== undefined ? props.disableFlip : false,
    };

    // ตั้งค่ากล้องเริ่มต้น
    if (props.defaultCamera === "back") {
        config.facingMode = { exact: "environment" };
    } else if (props.defaultCamera === "front") {
        config.facingMode = "user";
    }

    return config;
};

interface Html5QrcodeScannerProps {
    fps?: number;
    qrbox?: number;
    aspectRatio?: number;
    disableFlip?: boolean;
    defaultCamera?: "back" | "front";
    verbose?: boolean;
    qrCodeSuccessCallback: (decodedText: string, decodedResult?: any) => void;
    qrCodeErrorCallback?: (error: any) => void;
}

const Html5QrcodePlugin = (props: Html5QrcodeScannerProps) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    // ฟังก์ชันจัดการความสำเร็จ
    const handleSuccess = (decodedText: string, decodedResult: any) => {
        if (props.qrCodeSuccessCallback && !isScanning) {
            setIsScanning(true);
            props.qrCodeSuccessCallback(decodedText, decodedResult);

            // รีเซ็ตสถานะหลังจาก 2 วินาที
            setTimeout(() => setIsScanning(false), 2000);
        }
    };

    // ฟังก์ชันจัดการข้อผิดพลาด
    const handleError = (error: any) => {
        // เฉพาะ error ที่จำเป็นเท่านั้นที่จะแสดง (ไม่แสดง scanning error ปกติ)
        if (props.qrCodeErrorCallback && error.includes && !error.includes("No QR code found")) {
            props.qrCodeErrorCallback(error);
        }
    };

    // เริ่มต้น Scanner
    const initializeScanner = () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!props.qrCodeSuccessCallback) {
                throw new Error("qrCodeSuccessCallback is required");
            }

            const config = createConfig(props);
            const verbose = props.verbose === true;

            // ล้าง scanner เดิมก่อน
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }

            const html5QrcodeScanner = new Html5QrcodeScanner(
                qrcodeRegionId,
                config,
                verbose
            );

            scannerRef.current = html5QrcodeScanner;

            html5QrcodeScanner.render(handleSuccess, handleError);

            // จำลองการโหลดเสร็จ
            setTimeout(() => setIsLoading(false), 1000);

        } catch (err: any) {
            setError(err.message || "เกิดข้อผิดพลาดในการเริ่มต้นกล้อง");
            setIsLoading(false);
        }
    };

    // รีเฟรช Scanner
    const refreshScanner = () => {
        initializeScanner();
    };

    // เริ่มต้นเมื่อ component mount
    useEffect(() => {
        initializeScanner();

        // ล้างทิ้งเมื่อ component unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((error) => {
                    console.error("Failed to clear html5QrcodeScanner: ", error);
                });
                scannerRef.current = null;
            }
        };
    }, []);

    return (
        <Stack spacing={2}>
            {/* สถานะการสแกน */}
            {isScanning && (
                <Alert
                    severity="success"
                    icon={<CheckCircle />}
                    sx={{ borderRadius: 2 }}
                >
                    <Typography fontWeight="bold">
                        สแกน QR Code สำเร็จแล้ว!
                    </Typography>
                </Alert>
            )}

            {/* แสดงข้อผิดพลาด */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ borderRadius: 2 }}
                    action={
                        <Button color="inherit" size="small" onClick={refreshScanner}>
                            ลองใหม่
                        </Button>
                    }
                >
                    <Typography variant="body2">
                        {error}
                    </Typography>
                </Alert>
            )}

            {/* คำแนะนำ */}
            <Box textAlign="center" px={2}>
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" mb={1}>
                    <CameraAlt color="primary" fontSize="small" />
                    <Chip
                        label={isLoading ? "กำลังเปิดกล้อง..." : "พร้อมสแกน"}
                        color={isLoading ? "default" : "success"}
                        size="small"
                    />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    วางกล้องให้ตรงกับ QR Code และรอจนกว่าจะสแกนได้
                </Typography>
            </Box>

            {/* พื้นที่แสดงกล้อง */}
            <Box
                sx={{
                    position: 'relative',
                    width: "100%",
                    minHeight: 300,
                    bgcolor: "#f5f5f5",
                    border: "2px solid",
                    borderColor: isScanning ? "success.main" : "grey.300",
                    borderRadius: 2,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* Loading Spinner */}
                {isLoading && (
                    <Stack spacing={2} alignItems="center">
                        <CircularProgress size={40} />
                        <Typography variant="body2" color="text.secondary">
                            กำลังเตรียมกล้อง...
                        </Typography>
                    </Stack>
                )}

                {/* QR Scanner พื้นที่ */}
                <Box
                    id={qrcodeRegionId}
                    sx={{
                        width: "100%",
                        height: "100%",
                        minHeight: 250,
                        // ซ่อน loading เมื่อ scanner พร้อม
                        display: isLoading ? 'none' : 'block',
                        '& video': {
                            borderRadius: 1,
                        },
                        // ปรับแต่ง UI ของ html5-qrcode
                        '& #qr-shaded-region': {
                            borderRadius: '8px !important',
                        }
                    }}
                />

                {/* Success Overlay */}
                {isScanning && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 2,
                        }}
                    >
                        <Stack alignItems="center" spacing={1}>
                            <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                สแกนสำเร็จ!
                            </Typography>
                        </Stack>
                    </Box>
                )}
            </Box>

            {/* ปุ่มควบคุม */}
            <Box display="flex" justifyContent="center" gap={1}>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={refreshScanner}
                    disabled={isLoading}
                    sx={{ borderRadius: 2 }}
                >
                    รีเฟรชกล้อง
                </Button>
            </Box>

            {/* เคล็ดลับการใช้งาน */}
            <Box
                sx={{
                    bgcolor: 'info.50',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'info.200'
                }}
            >
                <Typography variant="caption" color="info.dark" display="block" gutterBottom fontWeight="bold">
                    💡 เคล็ดลับการสแกน QR Code:
                </Typography>
                <Typography variant="caption" color="info.dark" component="div">
                    • ถือมือให้นิ่ง และให้แสงสว่างเพียงพอ<br />
                    • วาง QR Code ให้อยู่ในกรอบสี่เหลี่ยม<br />
                    • หาก QR Code เล็ก ให้เข้าไปใกล้ๆ<br />
                    • หากไม่สามารถสแกนได้ ลองกดรีเฟรชกล้อง
                </Typography>
            </Box>
        </Stack>
    );
};

export default Html5QrcodePlugin;