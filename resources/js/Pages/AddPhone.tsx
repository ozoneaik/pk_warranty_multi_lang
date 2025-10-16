import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Alert, Container } from "@mui/material";
import { WarningRounded } from "@mui/icons-material";
import { router } from "@inertiajs/react";

export default function AddPhone() {
    const [phone, setPhone] = useState<string>("");
    const [otpSent, setOtpSent] = useState<boolean>(false);
    const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
    const [generatedOtp, setGeneratedOtp] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [timer, setTimer] = useState<number>(0);

    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    // const handleSendOtp = async () => {
    //     if (!/^\d{10}$/.test(phone)) {
    //         setError("กรุณากรอกเบอร์โทร 10 หลัก");
    //         return;
    //     }
    //     setError("");

    //     const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    //     setGeneratedOtp(otpCode);
    //     setOtp(["", "", "", ""]);
    //     inputRefs.current[0]?.focus();
    //     setOtpSent(true);
    //     setTimer(30);

    //     try {
    //         const result = await .post(route('send.otp'), {
    //             phone,
    //             otp: otpCode
    //         });

    //         if (!result.data.success) {
    //             setError(result.data.error || "ส่ง SMS ล้มเหลว");
    //             setOtpSent(false);
    //             setTimer(0);
    //         } else {
    //             console.log("SMS sent:", result.data.data);
    //         }
    //     } catch (err: any) {
    //         setError(err.message);
    //         setOtpSent(false);
    //         setTimer(0);
    //     }
    // };

    const handleSendOtp = async () => {
        if (!/^\d{10}$/.test(phone)) {
            setError("กรุณากรอกเบอร์โทร 10 หลัก");
            return;
        }
        setError("");

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(otpCode);
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
        setOtpSent(true);
        setTimer(30);

        try {
            const result = await axios.post(route('send.otp'), {
                phone,
                otp: otpCode
            });

            if (!result.data.success) {
                setError(result.data.message || result.data.error || "ส่ง SMS ล้มเหลว");
                setOtpSent(false);
                setTimer(0);
            } else {
                console.log("SMS sent:", result.data.data);
            }
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "เกิดข้อผิดพลาดในการส่ง OTP";
            setError(msg);
            setOtpSent(false);
            setTimer(0);
        }
    };

    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number
    ) => {
        const val = (e.target as HTMLInputElement).value;
        if (!/^\d?$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        if (val && index < 3) inputRefs.current[index + 1]?.focus();
    };

    const verifyOtp = () => {
        if (timer <= 0) {
            setError("OTP หมดอายุ กรุณาส่งใหม่");
            return;
        }
        const enteredOtp = otp.join("");
        if (enteredOtp === generatedOtp) {
            router.post(route('add.phone.store', { phone: phone }));
        } else {
            setError("OTP ไม่ถูกต้อง");
        }
    };

    return (
        <Container>
            <Box
                sx={{
                    maxWidth: 400, mx: "auto", mt: 5, display: "flex",
                    flexDirection: "column", gap: 2,
                }}
            >
                <Typography variant="h6" textAlign="center" fontWeight='bold'>
                    เพิ่มเบอร์โทร
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                    กรุณากรอกเบอร์โทรศัพท์ของท่าน เพื่อใช้ในการยืนยันตัวตน
                    และเชื่อมต่อกับข้อมูลการลงทะเบียนสินค้าในระบบ
                    หลังจากกรอกเบอร์โทร เราจะส่งรหัสยืนยัน (OTP) ไปยังเบอร์ที่ท่านระบุ
                    โปรดกรอกรหัสภายใน <strong>30 วินาที</strong> เพื่อยืนยันความถูกต้อง
                </Typography>

                <TextField
                    label="เบอร์โทร"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpSent}
                />
                <Alert color="warning" icon={<WarningRounded />}>
                    เมื่อกดส่ง OTP กรุณาอย่าเปลี่ยนหน้าเว็บ แล้วกรอก OTP ภายใน 30 วินาที
                </Alert>
                <Button
                    variant="contained"
                    onClick={handleSendOtp}
                    disabled={otpSent && timer > 0}
                >
                    {otpSent && timer > 0 ? `ส่งซ้ำใน ${timer} วิ` : "ส่ง OTP"}
                </Button>

                {otpSent && (
                    <>
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            {otp.map((digit, index) => (
                                <TextField
                                    key={index}
                                    value={digit}
                                    type="number"
                                    inputProps={{ maxLength: 1, style: { textAlign: "center" } }}
                                    onChange={(e) => handleOtpChange(e, index)}
                                    inputRef={(el) => (inputRefs.current[index] = el)}
                                />
                            ))}
                        </Box>
                        <Button variant="contained" color="success" onClick={verifyOtp}>
                            ยืนยัน OTP
                        </Button>
                    </>
                )}

                {error && <Alert severity="error">{error}</Alert>}
            </Box>
        </Container>

    );
}
