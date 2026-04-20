import React, { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Switch,
    Typography,
    IconButton,
} from "@mui/material";
import { Edit, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";

interface Dealer {
    id: number;
    name: string;
    branch: string | null;
    is_active: boolean;
}

export default function DealerIndex({ dealers }: { dealers: Dealer[] }) {
    const [openDialog, setOpenDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const { data, setData, post, put, processing, reset, errors, clearErrors } =
        useForm({
            id: null as number | null,
            name: "",
            branch: "",
            is_active: true,
        });

    const handleOpenCreate = () => {
        reset();
        clearErrors();
        setIsEdit(false);
        setOpenDialog(true);
    };

    const handleOpenEdit = (dealer: Dealer) => {
        clearErrors();
        setData({
            id: dealer.id,
            name: dealer.name,
            branch: dealer.branch || "",
            is_active: !!dealer.is_active,
        });
        setIsEdit(true);
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setTimeout(() => reset(), 200); // ดีเลย์เล็กน้อยกัน Modal กระตุกตอนปิด
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && data.id) {
            put(route("admin.dealers.update", data.id), {
                onSuccess: () => {
                    handleClose();
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: "อัปเดตสำเร็จ",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                },
            });
        } else {
            post(route("admin.dealers.store"), {
                onSuccess: () => {
                    handleClose();
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: "เพิ่มร้านค้าสำเร็จ",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                },
            });
        }
    };

    // ✅ แก้ไข: ตอน Toggle ให้ส่งข้อมูลเดิมไปด้วย ไม่งั้น Validation Backend จะเด้ง Error ว่า name หาย
    const toggleActive = (dealer: Dealer) => {
        router.put(
            route("admin.dealers.update", dealer.id),
            {
                name: dealer.name,
                branch: dealer.branch,
                is_active: !dealer.is_active, // สลับสถานะ
            },
            { preserveScroll: true },
        );
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: "ยืนยันการลบ?",
            text: "คุณไม่สามารถย้อนกลับได้!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#9ca3af",
            confirmButtonText: "ลบข้อมูล",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("admin.dealers.destroy", id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: "top-end",
                            icon: "success",
                            title: "ลบข้อมูลสำเร็จ",
                            showConfirmButton: false,
                            timer: 2000,
                        });
                    },
                });
            }
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <h2 className="font-bold text-2xl text-gray-800">
                        จัดการร้านค้าตัวแทนจำหน่าย
                    </h2>
                    <p className="text-sm text-gray-500">
                        เพิ่ม ลบ แก้ไข
                        รายชื่อร้านค้าสำหรับหน้าลงทะเบียนรับประกัน
                    </p>
                </div>
            }
        >
            <Head title="Manage Dealers" />

            <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <Typography variant="h6" fontWeight="bold">
                        รายการร้านค้า ({dealers.length})
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Plus />}
                        onClick={handleOpenCreate}
                        sx={{ borderRadius: 2 }}
                    >
                        เพิ่มร้านค้าใหม่
                    </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    ชื่อร้านค้า
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    สาขา
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 text-center uppercase tracking-wider">
                                    สถานะ
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 text-right uppercase tracking-wider">
                                    จัดการ
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {dealers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        ยังไม่มีข้อมูลร้านค้าตัวแทนจำหน่าย
                                    </td>
                                </tr>
                            ) : (
                                dealers.map((dealer) => (
                                    <tr
                                        key={dealer.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {dealer.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {dealer.branch || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Switch
                                                checked={!!dealer.is_active}
                                                onChange={() =>
                                                    toggleActive(dealer)
                                                }
                                                color="success"
                                                size="small"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <IconButton
                                                onClick={() =>
                                                    handleOpenEdit(dealer)
                                                }
                                                size="small"
                                                color="primary"
                                                sx={{
                                                    mr: 1,
                                                    bgcolor: "primary.50",
                                                }}
                                            >
                                                <Edit size={16} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() =>
                                                    handleDelete(dealer.id)
                                                }
                                                size="small"
                                                color="error"
                                                sx={{ bgcolor: "error.50" }}
                                            >
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Dialog เพิ่ม/แก้ไข */}
                <Dialog
                    open={openDialog}
                    onClose={handleClose}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <form onSubmit={handleSubmit}>
                        <DialogTitle
                            fontWeight="bold"
                            sx={{
                                bgcolor: "#f8fafc",
                                borderBottom: "1px solid #f1f5f9",
                                pb: 2,
                            }}
                        >
                            {isEdit ? "แก้ไขข้อมูลร้านค้า" : "เพิ่มร้านค้าใหม่"}
                        </DialogTitle>
                        <DialogContent className="space-y-5 pt-6 pb-2">
                            <TextField
                                fullWidth
                                label="ชื่อร้านค้า"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                required
                                error={!!errors.name}
                                helperText={errors.name}
                                sx={{ mt: 1 }}
                            />
                            <TextField
                                fullWidth
                                label="สาขา (ถ้ามี)"
                                value={data.branch}
                                onChange={(e) =>
                                    setData("branch", e.target.value)
                                }
                                error={!!errors.branch}
                                helperText={
                                    errors.branch || "ปล่อยว่างได้หากไม่มีสาขา"
                                }
                            />
                        </DialogContent>
                        <DialogActions
                            sx={{ p: 3, borderTop: "1px solid #f1f5f9" }}
                        >
                            <Button
                                onClick={handleClose}
                                color="inherit"
                                sx={{ fontWeight: 600 }}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={processing}
                                sx={{ fontWeight: 600, px: 4, borderRadius: 2 }}
                            >
                                {processing ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
