import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Box, Typography, Container, Button, Switch, FormControlLabel, Divider, Stack } from "@mui/material";
import { Head, router, usePage } from "@inertiajs/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

export default function InfoPDPA() {
    const { props }: any = usePage();
    const customer = props.customer || {};

    // 🟢 state toggle (ฐานข้อมูลเก็บ Y/N)
    const [acceptPolicy, setAcceptPolicy] = useState(customer.accept_policy === "Y");
    const [acceptPdpa, setAcceptPdpa] = useState(customer.accept_pdpa === "Y");

    // 🟢 ฟังก์ชันอัปเดต toggle
    const handleToggle = async (field: "accept_policy" | "accept_pdpa", value: boolean) => {
        if (field === "accept_policy") setAcceptPolicy(value);
        else setAcceptPdpa(value);

        try {
            await router.post(
                route("customer.profile.update.pdpa"),
                {
                    accept_policy: field === "accept_policy" ? (value ? "Y" : "N") : (acceptPolicy ? "Y" : "N"),
                    accept_pdpa: field === "accept_pdpa" ? (value ? "Y" : "N") : (acceptPdpa ? "Y" : "N"),
                },
                { preserveScroll: true }
            );

            // Swal.fire({
            //     icon: "success",
            //     title: "อัปเดตสำเร็จ",
            //     text: value
            //         ? "คุณได้ยินยอมตามนโยบายแล้ว"
            //         : "คุณได้ถอนความยินยอมเรียบร้อยแล้ว",
            //     timer: 2000,
            //     showConfirmButton: false,
            // });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถบันทึกข้อมูลได้",
            });
        }
    };

    return (
        <MobileAuthenticatedLayout title="นโยบายความเป็นส่วนตัว (PDPA)">
            <Head title="นโยบายความเป็นส่วนตัว (PDPA)" />
            <Container maxWidth="md" sx={{ mt: 1, mb: 8, py: 2 }}>
                <Button
                    variant="contained"
                    // color="primary"
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

                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    ยินยอมให้ใช้ข้อมูลเพื่อทำการตลาด
                </Typography>

                <Typography sx={{ mb: 2, color: "text.secondary" }}>
                    เราใส่ใจความเป็นส่วนตัวของคุณอยู่เสมอ
                    คุณสามารถเรียนรู้คำชี้แจงนโยบายการเก็บ รวบรวม และใช้ข้อมูลส่วนบุคคลได้ที่ นโยบาลความเป็นส่วนตัวข้อมูลของคุณจะถูกนำไปใช้เพื่อการโฆษณา และ การตลาด เพื่อประโยชน์ในการได้รับสินค้าหรือบริการของเรา เราใช้ข้อมูลของคุณเพื่อวิเคราะห์และปรับปรุงสินค้าหรือบริการ และ ทำการตลาดผ่าน Google, Facebook, pixel tracking code และอื่น ๆ เราใช้ข้อมุลดังกล่าวเพื่อให้สินค้าหรือบริการเหมาะสมกับคุณ, <br /><br />
                    เราอาจะส่งข้อมูลหรือจดหมายข่าวไปยังอีเมลของคุณ โดยมีวัตถุประสงค์เพื่อเสนอสิ่งที่น่าสนใจกับคุณ หากคุณไม่ต้องการรับกาาติดต่อสื่อสารจากเราผ่านทางอีเมลหรือช่องทางอื่น ๆ อีกต่อไป คุณสามารถติดต่อเราผ่าน Call Center ที่แจ้งด้านล่าง <br /><br />
                    หากคุณกดยินยอม หมายความ ว่าคุณยินยอมให้เราจะเก็บรักษาข้อมูลส่วนบุคคลของคุณ และ ให้เรานำข้อมูลของคุณไปใช้เพื่อการตลาดที่ระบุไว้ข้างต้น <br /><br />
                    ภายใต้กฎหมายคุ้มครองข้อมูล ส่วนบุคคลคุณมีสิทธิในการดําเนินการขอถอนความยินยอม หากคุณได้ยินยอมให้เราเก็บรวบรวมใช้หรือเปิดเผยข้อมูลส่วนบุคคลของคุณ สามารถถอนความยินยอมได้ตลอดเวลา โดยแจ้งการถอนความยินยอมได้ที่ Rocket Digital Call Center เบอร์โทรติดต่อ: 021159646 (รายละเอียดถอนความยินยอมเพิ่มเติมกรุณาตรวจสอบรายละเอียดที่ Privacy Notice) <br /><br />
                    บริษัทจะดำเนินการรับคำขอถอนความยินยอมภายใน 7 วันทำการ (จันทร์ - ศุกร์) และจะใช้เวลาประมาณ 30 วันทำการ เพื่อดำเนินการถอนความยินยอม
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* 🟢 สอง toggle */}
                <Stack spacing={2} alignItems="left" sx={{ mt: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={acceptPolicy}
                                onChange={(e) => handleToggle("accept_policy", e.target.checked)}
                                color="primary"
                            />
                        }
                        label="ยินยอมตามนโยบายความเป็นส่วนตัว (PDPA)"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={acceptPdpa}
                                onChange={(e) => handleToggle("accept_pdpa", e.target.checked)}
                                color="primary"
                            />
                        }
                        label="ยินยอมให้ใช้ข้อมูลส่วนบุคคลเพื่อการตลาด"
                    />
                </Stack>

                <Typography sx={{ mt: 2, color: "gray" }}>
                    การถอนความยินยอมอาจทำให้คุณพลาดโอกาสในการรับข้อเสนอผลิตภัณฑ์ บริการ และสิทธิพิเศษที่เหมาะสมกับความต้องการของคุณได้
                </Typography>

            </Container>
        </MobileAuthenticatedLayout>
    );
}