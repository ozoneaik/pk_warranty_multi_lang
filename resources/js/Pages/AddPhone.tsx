import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Alert, Container } from "@mui/material";
import { WarningRounded } from "@mui/icons-material";
import { router } from "@inertiajs/react";

// ฟังก์ชันส่ง SMS (แทน PHP curl)
async function sendSms(
    account: string,
    password: string,
    mobile_no: string,
    message: string
): Promise<{ result: boolean; task_id?: string; message_id?: string; error?: string }> {
    try {
        const formData = new URLSearchParams();
        formData.append("ACCOUNT", account);
        formData.append("PASSWORD", password);
        formData.append("MOBILE", mobile_no);
        formData.append("MESSAGE", message);
        formData.append("OPTION", "SEND_TYPE=General");

        const response = await axios.post("https://u8-2.sc4msg.com/SendMessage", formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const text = response.data as string;

        const results = text.trim().split("\n");
        if (results[results.length - 1] !== "END=OK") {
            return { result: false, error: "Incorrect Response: " + text };
        }

        if (results[0].trim() !== "STATUS=0") {
            return { result: false, error: results[0].trim() };
        }

        let task_id = "";
        let message_id = "";
        results.forEach((line) => {
            const [key, value] = line.split("=");
            if (key === "TASK_ID") task_id = value;
            if (key === "MESSAGE_ID") message_id = value;
        });

        return { result: true, task_id, message_id };
    } catch (err: any) {
        return { result: false, error: err.message };
    }
}

export default function AddPhone() {
    const [phone, setPhone] = useState<string>("");
    const [otpSent, setOtpSent] = useState<boolean>(false);
    const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
    const [generatedOtp, setGeneratedOtp] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [timer, setTimer] = useState<number>(0);

    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

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
                setError(result.data.error || "ส่ง SMS ล้มเหลว");
                setOtpSent(false);
                setTimer(0);
            } else {
                console.log("SMS sent:", result.data.data);
            }
        } catch (err: any) {
            setError(err.message);
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
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        const val = e.target.value;
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
            // alert("เพิ่มเบอร์โทรสำเร็จ 🎉");
            // setPhone("");
            // setOtp(["", "", "", ""]);
            // setOtpSent(false);
            // setGeneratedOtp("");
            // setError("");
            // setTimer(0);
        } else {
            setError("OTP ไม่ถูกต้อง");
        }
    };

    return (
        <Container>
            <Box
                sx={{
                    maxWidth: 400,
                    mx: "auto",
                    mt: 5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
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
