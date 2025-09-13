import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    Button,
    Divider,
} from "@mui/material";

const qrcodeRegionId = "html5qr-code-full-region";

const createConfig = (props: any) => {
    let config: any = {};
    if (props.fps) config.fps = props.fps;
    if (props.qrbox) config.qrbox = props.qrbox;
    if (props.aspectRatio) config.aspectRatio = props.aspectRatio;
    if (props.disableFlip !== undefined) config.disableFlip = props.disableFlip;

    // 👇 เพิ่มตรงนี้ ให้ default เปิดกล้องหลัง
    if (props.defaultCamera === "back") {
        config.facingMode = { exact: "environment" };
    } else if (props.defaultCamera === "front") {
        config.facingMode = "user";
    }

    return config;
};

const Html5QrcodePlugin = (props: any) => {
    useEffect(() => {
        const config = createConfig(props);
        const verbose = props.verbose === true;

        if (!props.qrCodeSuccessCallback) {
            throw new Error("qrCodeSuccessCallback is required callback.");
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(
            qrcodeRegionId,
            config,
            verbose
        );
        html5QrcodeScanner.render(
            props.qrCodeSuccessCallback,
            props.qrCodeErrorCallback
        );

        return () => {
            html5QrcodeScanner.clear().catch((error) => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, []);

    return (
        <Card
            variant="elevation" sx={{ bgcolor: '#ccc' }}
        >
            <CardHeader
                title={
                    <Typography variant="h6" fontWeight="bold">
                        แสกน QR CODE รับรหัสลูกค้า
                    </Typography>
                }
                subheader="ใช้กล้องสแกน QR Code ได้ทันที"
            />
            <Divider />
            <CardContent>
                <Box
                    id={qrcodeRegionId}
                    sx={{
                        textAlign: 'center',
                        width: "100%",
                        bgcolor: "#f9f9f9",
                        border: "2px dashed #ccc",
                        borderRadius: 2,
                        overflow: "hidden",
                    }}
                />
                <Box mt={2} textAlign="center">
                    <Button color="secondary">
                        รีเฟรชกล้อง
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default Html5QrcodePlugin;
