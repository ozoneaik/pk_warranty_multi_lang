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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Tab,
    Tabs,
} from "@mui/material";
import { Edit, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";

interface Channel {
    id: number;
    name: string;
    is_active: boolean;
}

interface Dealer {
    id: number;
    channel_id: number;
    CustID: string | null;
    name: string;
    branch: string | null;
    is_active: boolean;
}

export default function DealerIndex({
    dealers,
    channels,
}: {
    dealers: Dealer[];
    channels: Channel[];
}) {
    const [activeTab, setActiveTab] = useState(0);

    // ── Dealer form ──────────────────────────────────────────────
    const [openDealerDialog, setOpenDealerDialog] = useState(false);
    const [isDealerEdit, setIsDealerEdit] = useState(false);

    const {
        data: dealerData,
        setData: setDealerData,
        post: postDealer,
        put: putDealer,
        processing: dealerProcessing,
        reset: resetDealer,
        errors: dealerErrors,
        clearErrors: clearDealerErrors,
    } = useForm({
        id: null as number | null,
        channel_id: channels[0]?.id ?? 1,
        CustID: "",
        name: "",
        branch: "",
        is_active: true,
    });

    const handleOpenCreateDealer = () => {
        resetDealer();
        clearDealerErrors();
        setIsDealerEdit(false);
        setOpenDealerDialog(true);
    };

    const handleOpenEditDealer = (dealer: Dealer) => {
        clearDealerErrors();
        setDealerData({
            id: dealer.id,
            channel_id: dealer.channel_id || channels[0]?.id || 1,
            CustID: dealer.CustID || "",
            name: dealer.name,
            branch: dealer.branch || "",
            is_active: !!dealer.is_active,
        });
        setIsDealerEdit(true);
        setOpenDealerDialog(true);
    };

    const handleCloseDealerDialog = () => {
        setOpenDealerDialog(false);
        setTimeout(() => resetDealer(), 200);
    };

    const handleSubmitDealer = (e: React.FormEvent) => {
        e.preventDefault();
        if (isDealerEdit && dealerData.id) {
            putDealer(route("admin.dealers.update", dealerData.id), {
                onSuccess: () => {
                    handleCloseDealerDialog();
                    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "อัปเดตสำเร็จ", showConfirmButton: false, timer: 2000 });
                },
            });
        } else {
            postDealer(route("admin.dealers.store"), {
                onSuccess: () => {
                    handleCloseDealerDialog();
                    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "เพิ่มร้านค้าสำเร็จ", showConfirmButton: false, timer: 2000 });
                },
            });
        }
    };

    const toggleActive = (dealer: Dealer) => {
        router.put(
            route("admin.dealers.update", dealer.id),
            { channel_id: dealer.channel_id, CustID: dealer.CustID, name: dealer.name, branch: dealer.branch, is_active: !dealer.is_active },
            { preserveScroll: true },
        );
    };

    const handleDeleteDealer = (id: number) => {
        Swal.fire({
            title: "ยืนยันการลบ?", text: "คุณไม่สามารถย้อนกลับได้!", icon: "warning",
            showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#9ca3af",
            confirmButtonText: "ลบข้อมูล", cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("admin.dealers.destroy", id), {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire({ toast: true, position: "top-end", icon: "success", title: "ลบข้อมูลสำเร็จ", showConfirmButton: false, timer: 2000 }),
                });
            }
        });
    };

    const getChannelName = (id: number) => {
        const channel = channels.find((c) => c.id === id);
        return channel ? channel.name : "ไม่ระบุ";
    };

    // ── Channel form ─────────────────────────────────────────────
    const [openChannelDialog, setOpenChannelDialog] = useState(false);
    const [isChannelEdit, setIsChannelEdit] = useState(false);

    const {
        data: channelData,
        setData: setChannelData,
        post: postChannel,
        put: putChannel,
        processing: channelProcessing,
        reset: resetChannel,
        errors: channelErrors,
        clearErrors: clearChannelErrors,
    } = useForm({ id: null as number | null, name: "", is_active: true });

    const handleOpenCreateChannel = () => {
        resetChannel();
        clearChannelErrors();
        setIsChannelEdit(false);
        setOpenChannelDialog(true);
    };

    const handleOpenEditChannel = (channel: Channel) => {
        clearChannelErrors();
        setChannelData({ id: channel.id, name: channel.name, is_active: !!channel.is_active });
        setIsChannelEdit(true);
        setOpenChannelDialog(true);
    };

    const toggleChannelActive = (channel: Channel) => {
        router.put(
            route("admin.dealers.channels.update", channel.id),
            { name: channel.name, is_active: !channel.is_active },
            { preserveScroll: true },
        );
    };

    const handleCloseChannelDialog = () => {
        setOpenChannelDialog(false);
        setTimeout(() => resetChannel(), 200);
    };

    const handleSubmitChannel = (e: React.FormEvent) => {
        e.preventDefault();
        if (isChannelEdit && channelData.id) {
            putChannel(route("admin.dealers.channels.update", channelData.id), {
                onSuccess: () => {
                    handleCloseChannelDialog();
                    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "อัปเดต Channel สำเร็จ", showConfirmButton: false, timer: 2000 });
                },
            });
        } else {
            postChannel(route("admin.dealers.channels.store"), {
                onSuccess: () => {
                    handleCloseChannelDialog();
                    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "เพิ่ม Channel สำเร็จ", showConfirmButton: false, timer: 2000 });
                },
            });
        }
    };

    const handleDeleteChannel = (id: number) => {
        Swal.fire({
            title: "ยืนยันการลบ Channel?", text: "Channel ที่มีร้านค้าอยู่จะไม่สามารถลบได้", icon: "warning",
            showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#9ca3af",
            confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("admin.dealers.channels.destroy", id), {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire({ toast: true, position: "top-end", icon: "success", title: "ลบ Channel สำเร็จ", showConfirmButton: false, timer: 2000 }),
                    onError: (errors) => {
                        Swal.fire({ icon: "error", title: "ไม่สามารถลบได้", text: errors.channel ?? "เกิดข้อผิดพลาด" });
                    },
                });
            }
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <h2 className="font-bold text-2xl text-gray-800">จัดการร้านค้าตัวแทนจำหน่าย</h2>
                    <p className="text-sm text-gray-500">เพิ่ม ลบ แก้ไข รายชื่อร้านค้าและช่องทางจำหน่าย</p>
                </div>
            }
        >
            <Head title="Manage Dealers" />

            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
                        <Tabs 
                            value={activeTab} 
                            onChange={(_, v) => setActiveTab(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                        >
                            <Tab label={`ร้านค้าตัวแทนจำหน่าย (${dealers.length})`} />
                            <Tab label={`ช่องทางหลัก / Channel (${channels.length})`} />
                        </Tabs>
                    </Box>

                    {/* ── Tab 0: Dealers ── */}
                    {activeTab === 0 && (
                        <div>
                            <div className="flex justify-between items-center p-5 border-b border-gray-50">
                                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                                    รายการร้านค้า
                                </Typography>
                                <Button variant="contained" startIcon={<Plus />} onClick={handleOpenCreateDealer} sx={{ borderRadius: 2 }}>
                                    เพิ่มร้านค้าใหม่
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ช่องทาง (Channel)</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cust ID</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อร้านค้า</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">สาขา</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 text-center uppercase tracking-wider">สถานะ</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 text-right uppercase tracking-wider">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {dealers.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">ยังไม่มีข้อมูลร้านค้าตัวแทนจำหน่าย</td>
                                            </tr>
                                        ) : (
                                            dealers.map((dealer) => (
                                                <tr key={dealer.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <Chip label={getChannelName(dealer.channel_id)} size="small" color="primary" variant="outlined" sx={{ fontWeight: "bold" }} />
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{dealer.CustID || "-"}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{dealer.name}</td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">{dealer.branch || "-"}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Switch checked={!!dealer.is_active} onChange={() => toggleActive(dealer)} color="success" size="small" />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <IconButton onClick={() => handleOpenEditDealer(dealer)} size="small" color="primary" sx={{ mr: 1, bgcolor: "primary.50" }}>
                                                            <Edit size={16} />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleDeleteDealer(dealer.id)} size="small" color="error" sx={{ bgcolor: "error.50" }}>
                                                            <Trash2 size={16} />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 1: Channels ── */}
                    {activeTab === 1 && (
                        <div>
                            <div className="flex justify-between items-center p-5 border-b border-gray-50">
                                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                                    รายการช่องทางหลัก
                                </Typography>
                                <Button variant="contained" startIcon={<Plus />} onClick={handleOpenCreateChannel} sx={{ borderRadius: 2 }}>
                                    เพิ่ม Channel ใหม่
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">#</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อช่องทาง (Channel)</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ร้านค้าที่ใช้</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 text-center uppercase tracking-wider">สถานะ</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 text-right uppercase tracking-wider">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {channels.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">ยังไม่มี Channel</td>
                                            </tr>
                                        ) : (
                                            channels.map((channel) => {
                                                const dealerCount = dealers.filter((d) => d.channel_id === channel.id).length;
                                                return (
                                                    <tr key={channel.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 text-gray-400 text-sm">{channel.id}</td>
                                                        <td className="px-6 py-4 font-medium text-gray-900">{channel.name}</td>
                                                        <td className="px-6 py-4">
                                                            {dealerCount > 0 ? (
                                                                <Chip label={`${dealerCount} ร้านค้า`} size="small" color="info" variant="outlined" />
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">ยังไม่มีร้านค้า</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <Switch checked={!!channel.is_active} onChange={() => toggleChannelActive(channel)} color="success" size="small" />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <IconButton onClick={() => handleOpenEditChannel(channel)} size="small" color="primary" sx={{ mr: 1, bgcolor: "primary.50" }}>
                                                                <Edit size={16} />
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={() => handleDeleteChannel(channel.id)}
                                                                size="small"
                                                                color="error"
                                                                sx={{ bgcolor: "error.50" }}
                                                                disabled={dealerCount > 0}
                                                            >
                                                                <Trash2 size={16} />
                                                            </IconButton>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Dialog เพิ่ม/แก้ไข Dealer ── */}
            <Dialog open={openDealerDialog} onClose={handleCloseDealerDialog} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
                <form onSubmit={handleSubmitDealer}>
                    <DialogTitle fontWeight="bold" sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #f1f5f9", pb: 2 }}>
                        {isDealerEdit ? "แก้ไขข้อมูลร้านค้า" : "เพิ่มร้านค้าใหม่"}
                    </DialogTitle>
                    <DialogContent className="space-y-5 pt-6 pb-2">
                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="channel-label">ช่องทางหลัก (Channel)</InputLabel>
                            <Select
                                labelId="channel-label"
                                value={dealerData.channel_id}
                                label="ช่องทางหลัก (Channel)"
                                onChange={(e) => setDealerData("channel_id", Number(e.target.value))}
                            >
                                {channels.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField fullWidth label="รหัสลูกค้า (Cust ID)" value={dealerData.CustID} onChange={(e) => setDealerData("CustID", e.target.value)} helperText="ปล่อยว่างได้หากไม่มีรหัสลูกค้า" error={!!dealerErrors.CustID} />
                        <TextField fullWidth label="ชื่อร้านค้า" value={dealerData.name} onChange={(e) => setDealerData("name", e.target.value)} required error={!!dealerErrors.name} helperText={dealerErrors.name} />
                        <TextField fullWidth label="สาขา (ถ้ามี)" value={dealerData.branch} onChange={(e) => setDealerData("branch", e.target.value)} error={!!dealerErrors.branch} helperText={dealerErrors.branch || "ปล่อยว่างได้หากไม่มีสาขา"} />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: "1px solid #f1f5f9" }}>
                        <Button onClick={handleCloseDealerDialog} color="inherit" sx={{ fontWeight: 600 }}>ยกเลิก</Button>
                        <Button type="submit" variant="contained" disabled={dealerProcessing} sx={{ fontWeight: 600, px: 4, borderRadius: 2 }}>
                            {dealerProcessing ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* ── Dialog เพิ่ม/แก้ไข Channel ── */}
            <Dialog open={openChannelDialog} onClose={handleCloseChannelDialog} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
                <form onSubmit={handleSubmitChannel}>
                    <DialogTitle fontWeight="bold" sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #f1f5f9", pb: 2 }}>
                        {isChannelEdit ? "แก้ไข Channel" : "เพิ่ม Channel ใหม่"}
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <TextField
                            fullWidth
                            label="ชื่อช่องทาง (Channel)"
                            value={channelData.name}
                            onChange={(e) => setChannelData("name", e.target.value)}
                            required
                            autoFocus
                            error={!!channelErrors.name}
                            helperText={channelErrors.name}
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: "1px solid #f1f5f9" }}>
                        <Button onClick={handleCloseChannelDialog} color="inherit" sx={{ fontWeight: 600 }}>ยกเลิก</Button>
                        <Button type="submit" variant="contained" disabled={channelProcessing} sx={{ fontWeight: 600, px: 4, borderRadius: 2 }}>
                            {channelProcessing ? "กำลังบันทึก..." : "บันทึก"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </AdminLayout>
    );
}
