import MobileAuthenticatedLayout from "@/Layouts/MobileAuthenticatedLayout";
import { Box, Typography, Container, Button, Stack } from "@mui/material";
import { Head, router } from "@inertiajs/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function InfoTerm() {
    return (
        <MobileAuthenticatedLayout title="ข้อกำหนดและเงื่อนไข (Terms & Conditions)">
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

            <Head title="ข้อกำหนดและเงื่อนไข (Terms & Conditions)" />

            <Container
                maxWidth="md"
                sx={{
                    mt: 0,
                    mb: 8,
                    py: 2,
                    lineHeight: 1.8,
                    "& p": { mb: 2 },
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    ข้อกำหนดและเงื่อนไข
                </Typography>

                <Typography paragraph color="text.secondary">
                    นโยบายการใช้คุกกี้นี้ จะอธิบายถึงประเภท เหตุผล และลักษณะการใช้คุกกี้ รวมถึงวิธีการจัดการคุกกี้
                    ของเว็บไซต์ทั้งหมดของ <b>บริษัท พัมคิน คอร์ปอเรชั่น จำกัด </b>
                    โดยในแต่ละเว็บไซต์อาจมีการใช้คุกกี้แตกต่างกันไป
                    โดยท่านสามารถดูรายการคุกกี้ได้ที่หน้าการตั้งค่าคุกกี้ในแต่ละเว็บไซต์ที่ท่านเข้าใช้งาน ดังนี้
                </Typography>

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    1. คุกกี้ (Cookies) คืออะไร ?
                </Typography>
                <Typography paragraph color="text.secondary" sx={{ pl: 2 }}>
                    คุกกี้ คือ ข้อมูลคอมพิวเตอร์ขนาดเล็ก (text file)
                    ที่จะถูกติดตั้งหรือบันทึกลงบนคอมพิวเตอร์หรืออุปกรณ์อิเล็กทรอนิกส์ของท่านเมื่อท่านเข้าชมเว็บไซต์
                    คุกกี้จะจดจำข้อมูลการใช้งานเว็บไซต์ของท่าน ทั้งนี้ เราจะเรียกเทคโนโลยีอื่นที่ทำหน้าที่คล้ายคลึงกันว่าคุกกี้ด้วย
                </Typography>

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    2. เราใช้คุกกี้อย่างไรบ้าง ?
                </Typography>
                <Typography paragraph color="text.secondary" sx={{ pl: 2 }}>
                    เราจะใช้คุกกี้เมื่อท่านได้เข้าเยี่ยมชมเว็บไซต์ของเรา โดยการใช้งานคุกกี้ของเราแบ่งออกตามลักษณะของการใช้งานได้ดังนี้
                </Typography>

                <Stack spacing={0} sx={{ pl: 2 }}>
                    <Box>
                        <Typography fontWeight="bold" color="text.secondary">
                            • คุกกี้ที่จำเป็น (Strictly Necessary Cookies)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                            คุกกี้ประเภทนี้มีความจำเป็นต่อการทำงานของเว็บไซต์
                            เพื่อให้เว็บไซต์สามารถทำงานได้เป็นปกติ มีความปลอดภัย
                            และทำให้ท่านสามารถเข้าใช้เว็บไซต์ได้ เช่น การเข้าสู่ระบบหรือการยืนยันตัวตน
                            ทั้งนี้ ท่านไม่สามารถปิดการใช้งานคุกกี้ประเภทนี้ผ่านระบบของเว็บไซต์ได้
                        </Typography>
                    </Box>

                    <Box>
                        <Typography fontWeight="bold" color="text.secondary">
                            • คุกกี้เพื่อการวิเคราะห์ (Analytic Cookies)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                            คุกกี้ประเภทนี้จะเก็บข้อมูลการใช้งานเว็บไซต์ของท่าน
                            เพื่อให้เราสามารถวัดผล ประเมิน ปรับปรุง และพัฒนาเนื้อหาสินค้า/บริการและเว็บไซต์ของเรา
                            เพื่อเพิ่มประสบการณ์ที่ดีในการใช้เว็บไซต์ของท่าน
                            ทั้งนี้ หากท่านไม่ยินยอมให้เราใช้คุกกี้ประเภทนี้
                            เราจะไม่สามารถวัดผล ประเมิน และพัฒนาเว็บไซต์ได้
                        </Typography>
                    </Box>

                    <Box>
                        <Typography fontWeight="bold" color="text.secondary">
                            • คุกกี้เพื่อช่วยในการใช้งาน (Functional Cookies)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                            คุกกี้ประเภทนี้จะช่วยจดจำข้อมูลคอมพิวเตอร์หรืออุปกรณ์อิเล็กทรอนิกส์ที่ท่านใช้เข้าชมเว็บไซต์
                            เช่น ข้อมูลการลงทะเบียน การเข้าสู่ระบบ การตั้งค่าภาษาที่แสดงบนเว็บไซต์ หรือที่อยู่จัดส่งสินค้า
                            เพื่อให้ท่านสามารถใช้งานเว็บไซต์ได้สะดวกยิ่งขึ้น โดยไม่ต้องให้ข้อมูลหรือตั้งค่าใหม่ทุกครั้ง
                            ทั้งนี้ หากท่านไม่ยินยอมให้เราใช้คุกกี้ประเภทนี้
                            ท่านอาจใช้งานเว็บไซต์ได้ไม่สะดวกและไม่เต็มประสิทธิภาพ
                        </Typography>
                    </Box>

                    <Box>
                        <Typography fontWeight="bold" color="text.secondary">
                            • คุกกี้เพื่อปรับเนื้อหาให้เข้ากับกลุ่มเป้าหมาย (Targeting Cookies)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 1}}>
                            คุกกี้ประเภทนี้จะเก็บข้อมูลต่าง ๆ ซึ่งอาจรวมถึงข้อมูลส่วนบุคคลของท่าน
                            และสร้างโปรไฟล์เกี่ยวกับตัวท่าน เพื่อให้เราสามารถวิเคราะห์และนำเสนอเนื้อหา
                            สินค้า/บริการ หรือโฆษณาที่เหมาะสมกับความสนใจของท่านได้
                            ทั้งนี้ หากท่านไม่ยินยอมให้เราใช้คุกกี้ประเภทนี้
                            ท่านอาจได้รับข้อมูลและโฆษณาทั่วไปที่ไม่ตรงกับความสนใจของท่าน
                        </Typography>
                    </Box>
                </Stack>

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    3. การใช้คุกกี้โดยบุคคลที่สาม (Third-Party Cookies)
                </Typography>
                <Typography paragraph color="text.secondary" sx={{ pl: 2 }}>
                    เว็บไซต์ของเรามีการใช้คุกกี้โดยบุคคลที่สาม
                    ซึ่งลักษณะการใช้งานและการตั้งค่าจะเป็นไปตามคุกกี้ในข้อ 2
                    โดยท่านจะไม่สามารถเลือกตั้งค่าการใช้งานเฉพาะคุกกี้โดยบุคคลที่สามได้
                </Typography>

                <Typography paragraph color="text.secondary" sx={{ pl: 2 }}>
                    ทั้งนี้ เราไม่สามารถควบคุมการใช้ข้อมูลของบุคคลที่สามนั้นได้
                    ท่านสามารถตรวจสอบรายชื่อของบุคคลที่สาม
                    รวมถึงนโยบายความเป็นส่วนตัว (Privacy Notice)
                    และนโยบายการใช้คุกกี้ของบุคคลที่สามซึ่งอาจแตกต่างจากเว็บไซต์ของเราได้ที่เว็บไซต์ของบุคคลที่สามนั้น ๆ
                </Typography>

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    4. การจัดการคุกกี้
                </Typography>
                <Typography paragraph color="text.secondary" sx={{ pl: 2 }}>
                    ท่านสามารถเลือกตั้งค่าคุกกี้แต่ละประเภท (ยกเว้นคุกกี้ที่จำเป็น)
                    ได้โดยผ่านเมนู “การตั้งค่าคุกกี้” หรือการตั้งค่าในเว็บเบราว์เซอร์ (web browser)
                    เช่น การห้ามติดตั้งคุกกี้ลงบนอุปกรณ์ของท่าน ทั้งนี้
                    การปิดการใช้งานคุกกี้อาจส่งผลให้ท่านไม่สามารถใช้เว็บไซต์ได้อย่างมีประสิทธิภาพ
                </Typography>

                <Typography paragraph color="text.secondary">
                    <b>บริษัท พัมคิน คอร์ปอเรชัน จำกัด</b><br />
                    เลขที่ 4 ซอยพระรามที่ 2 ซอย 54 แยก 4-13 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพฯ 10150
                </Typography>
            </Container>
        </MobileAuthenticatedLayout>
    );
}
