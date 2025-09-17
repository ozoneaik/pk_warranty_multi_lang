import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useLanguage } from '@/context/LanguageContext';
import { Transition } from '@headlessui/react';
import { useForm } from "@inertiajs/react";
import { Autocomplete, TextField } from '@mui/material';
import { green } from '@mui/material/colors';
import { FormEventHandler, useState, useEffect } from "react";
import Swal from 'sweetalert2';

export default function ProfileForm({ customer, vat, className = '' }: ProfileFormProps) {
    const { t } = useLanguage();
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        id: customer?.id || "",
        cust_firstname: customer?.cust_firstname || "",
        cust_lastname: customer?.cust_lastname || "",
        cust_gender: customer?.cust_gender || "",
        cust_tel: customer?.cust_tel || "",
        cust_birthdate: customer?.cust_birthdate || "",
        cust_full_address: customer?.cust_full_address || "",
        cust_province: customer?.cust_province || "",
        cust_district: customer?.cust_district || "",
        cust_subdistrict: customer?.cust_subdistrict || "",
        cust_zipcode: customer?.cust_zipcode || "",

        tax_name: customer?.tax_name || "",
        tax_tel: customer?.tax_tel || "",
        tax_address: customer?.tax_address || "",
        tax_province: customer?.tax_province || "",
        tax_district: customer?.tax_district || "",
        tax_subdistrict: customer?.tax_subdistrict || "",
        tax_zipcode: customer?.tax_zipcode || "",
    });

    const [sameAsProfile, setSameAsProfile] = useState(false);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [amphures, setAmphures] = useState<Amphure[]>([]);
    const [tambons, setTambons] = useState<Tambon[]>([]);

    useEffect(() => {
        fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json")
            .then(res => res.json())
            .then((data: Province[]) => setProvinces(data));
    }, []);

    const handleProvinceChange = async (province: Province | null) => {
        if (province) {
            setData("cust_province", province.name_th); 
            const amphureRes = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json");
            const allAmphures = await amphureRes.json();
            setAmphures(allAmphures.filter((a: any) => a.province_id == province.id));
            setTambons([]);
            setData("cust_district", "");
            setData("cust_subdistrict", "");
            setData("cust_zipcode", "");
        }
    };

    const handleAmphureChange = async (amphure: Amphure | null) => {
        if (amphure) {
            setData("cust_district", amphure.name_th); 
            const tambonRes = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json");
            const allTambons = await tambonRes.json();
            setTambons(allTambons.filter((t: any) => t.amphure_id == amphure.id));
            setData("cust_subdistrict", "");
            setData("cust_zipcode", "");
        }
    };

    const handleTambonChange = (tambon: Tambon | null) => {
        if (tambon) {
            setData("cust_subdistrict", tambon.name_th); 
            setData("cust_zipcode", tambon.zip_code);
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSameAsProfile(checked);

        if (checked) {
            setData({
                ...data,
                tax_name: `${data.cust_firstname || ""} ${data.cust_lastname || ""}`.trim(),
                tax_tel: data.cust_tel || "",
                tax_address: data.cust_full_address || "",
                tax_province: data.cust_province || "",
                tax_district: data.cust_district || "",
                tax_subdistrict: data.cust_subdistrict || "",
                tax_zipcode: data.cust_zipcode || "",
            });
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'คุณต้องการบันทึกข้อมูลใช่หรือไม่',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#F54927',
        }).then((confirm) => {
            if (confirm.isConfirmed) {
                patch(route("customer.profile.update"), {
                    onFinish: () => {
                        Swal.fire({
                            title: 'บันทึกข้อมูลเสร็จสิ้น',
                            icon: 'success',
                            timer: 2000,
                            confirmButtonColor: 'green',
                        })
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'บันทึกข้อมูลผิดพลาด',
                            icon: 'error',
                        })
                    }
                });
            } else {
                console.log('Not Confirmed')
            }
        })
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {t.Customer.title}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    คุณสามารถแก้ไขข้อมูลส่วนตัวและที่อยู่ใบกำกับภาษีได้ที่นี่
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <fieldset className="border border-gray-300 rounded-md p-4 dark:border-gray-700">
                    <legend className="text-md font-semibold text-gray-700 dark:text-gray-200">ข้อมูลส่วนตัว</legend>
                    <div>
                        <InputLabel htmlFor="cust_firstname" value="ชื่อ" required />
                        <TextInput
                            id="cust_firstname"
                            className="mt-1 block w-full"
                            value={data.cust_firstname}
                            onChange={(e) => setData('cust_firstname', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.cust_firstname} />
                    </div>
                    <div className='mt-4'>
                        <InputLabel htmlFor="cust_lastname" value="นามสกุล" required />
                        <TextInput
                            id="cust_lastname"
                            className="mt-1 block w-full"
                            value={data.cust_lastname}
                            onChange={(e) => setData('cust_lastname', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.cust_lastname} />
                    </div>
                    <div className="mt-4">
                        <InputLabel htmlFor="cust_gender" value="เพศ" required />
                        <select
                            id="cust_gender"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm"
                            value={data.cust_gender}
                            onChange={(e) => setData('cust_gender', e.target.value)}
                            required
                        >
                            <option value=""> เลือกเพศ </option>
                            <option value="ชาย">ชาย</option>
                            <option value="หญิง">หญิง</option>
                            <option value="อื่น ๆ">อื่น ๆ</option>
                        </select>

                        <InputError className="mt-2" message={errors.cust_gender} />
                    </div>
                    <div className='mt-4'>
                        <InputLabel htmlFor="cust_tel" value="เบอร์โทร" required />
                        <TextInput
                            id="cust_tel"
                            className="mt-1 block w-full"
                            value={data.cust_tel}
                            onChange={(e) => setData('cust_tel', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.cust_tel} />
                    </div>
                    <div className='mt-4'>
                        <InputLabel htmlFor="cust_birthdate" value="วันเกิด" required />
                        <TextInput
                            id="cust_birthdate"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.cust_birthdate}
                            onChange={(e) => setData('cust_birthdate', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.cust_birthdate} />
                    </div>
                    <div className='mt-4'>
                        <InputLabel htmlFor="cust_full_address" value="ที่อยู่" required />
                        <TextInput
                            id="cust_full_address"
                            className="mt-1 block w-full"
                            value={data.cust_full_address}
                            onChange={(e) => setData('cust_full_address', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.cust_full_address} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        <div>
                            <InputLabel htmlFor="cust_province" value="จังหวัด" required />
                            <Autocomplete
                                options={provinces}
                                getOptionLabel={(option) => option.name_th}
                                value={provinces.find((p) => p.name_th === data.cust_province) || null}
                                onChange={(e, v) => handleProvinceChange(v)}
                                renderInput={(params) => <TextField {...params} placeholder="เลือกจังหวัด" />}
                            />
                            <InputError className="mt-2" message={errors.cust_province} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        <div>
                            <InputLabel htmlFor="cust_district" value="อำเภอ" required />
                            <Autocomplete
                                options={amphures}
                                getOptionLabel={(option) => option.name_th}
                                value={amphures.find((a) => a.name_th === data.cust_district) || null}
                                onChange={(e, v) => handleAmphureChange(v)}
                                renderInput={(params) => <TextField {...params} placeholder="เลือกอำเภอ" />}
                            />
                            <InputError className="mt-2" message={errors.cust_district} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        <div>
                            <InputLabel htmlFor="cust_subdistrict" value="ตำบล/แขวง" required />
                            <Autocomplete
                                options={tambons}
                                getOptionLabel={(option) => option.name_th}
                                value={tambons.find((t) => t.name_th === data.cust_subdistrict) || null}
                                onChange={(e, v) => handleTambonChange(v)}
                                renderInput={(params) => <TextField {...params} placeholder="เลือกตำบล" />}
                            />
                            <InputError className="mt-2" message={errors.cust_subdistrict} />
                        </div>
                        <div>
                            <InputLabel htmlFor="cust_zipcode" value="รหัสไปรษณีย์" required />
                            <TextInput
                                id="cust_zipcode"
                                className="mt-1 block w-full"
                                value={data.cust_zipcode}
                                onChange={(e) => setData("cust_zipcode", e.target.value)}
                                required
                                disabled
                            />
                            <InputError className="mt-2" message={errors.cust_zipcode} />
                        </div>
                    </div>
                </fieldset>

                {/* ---------- Tax Address Info ---------- */}
                <fieldset className="border border-gray-300 rounded-md p-4 dark:border-gray-700">
                    <legend className="text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        ที่อยู่ใบกำกับภาษี
                        <label className="flex items-center gap-2 text-sm font-normal">
                            <input
                                type="checkbox"
                                checked={sameAsProfile}
                                onChange={handleCheckboxChange}
                            />
                            ใช้ข้อมูลเดียวกับที่อยู่ส่วนตัว
                        </label>
                    </legend>

                    <div className="space-y-4 mt-4">
                        <InputLabel htmlFor="tax_name" value="ชื่อ" required />
                        <TextInput
                            id="tax_name"
                            className="mt-1 block w-full"
                            value={data.tax_name}
                            onChange={(e) => setData('tax_name', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.tax_name} />
                    </div>
                    <div className='mt-4'>
                        <InputLabel htmlFor="tax_tel" value="เบอร์โทร" required />
                        <TextInput
                            id="tax_tel"
                            className="mt-1 block w-full"
                            value={data.tax_tel}
                            onChange={(e) => setData('tax_tel', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.tax_tel} />
                    </div>
                    <div className='mt-4'>
                        <InputLabel htmlFor="tax_address" value="ที่อยู่" required />
                        <TextInput
                            id="tax_address"
                            className="mt-1 block w-full"
                            value={data.tax_address}
                            onChange={(e) => setData('tax_address', e.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.tax_address} />
                    </div>
                    <div className='mt-4'>
                        <div className='gap-4'>
                            <InputLabel htmlFor="tax_province" value="จังหวัด" required />
                            <TextInput
                                id="tax_province"
                                className="mt-1 block w-full"
                                value={data.tax_province}
                                onChange={(e) => setData('tax_province', e.target.value)}
                                required
                            />
                            <InputError className="mt-2" message={errors.tax_province} />
                        </div>
                        <div className='mt-4'>
                            <InputLabel htmlFor="tax_district" value="อำเภอ/เขต" required />
                            <TextInput
                                id="tax_district"
                                className="mt-1 block w-full"
                                value={data.tax_district}
                                onChange={(e) => setData('tax_district', e.target.value)}
                                required
                            />
                            <InputError className="mt-2" message={errors.tax_district} />
                        </div>
                    </div>
                    <div>
                        <div className='mt-4'>
                            <InputLabel htmlFor="tax_subdistrict" value="ตำบล/แขวง" required />
                            <TextInput
                                id="tax_subdistrict"
                                className="mt-1 block w-full"
                                value={data.tax_subdistrict}
                                onChange={(e) => setData('tax_subdistrict', e.target.value)}
                                required
                            />
                            <InputError className="mt-2" message={errors.tax_subdistrict} />
                        </div>
                        <div className='mt-4'>
                            <InputLabel htmlFor="tax_zipcode" value="รหัสไปรษณีย์" required />
                            <TextInput
                                id="tax_zipcode"
                                className="mt-1 block w-full"
                                value={data.tax_zipcode}
                                onChange={(e) => setData('tax_zipcode', e.target.value)}
                                required
                            />
                            <InputError className="mt-2" message={errors.tax_zipcode} />
                        </div>
                    </div>
                </fieldset>

                <div className="flex items-center gap-4 mt-8">
                    <PrimaryButton disabled={processing}>บันทึกข้อมูลทั้งหมด</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            ข้อมูลถูกบันทึกแล้ว
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}