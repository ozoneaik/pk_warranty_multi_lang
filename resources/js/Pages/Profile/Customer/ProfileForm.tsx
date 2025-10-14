import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useLanguage } from '@/context/LanguageContext';
import { Transition } from '@headlessui/react';
import { router, useForm } from "@inertiajs/react";
import { Autocomplete, Button, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { green } from '@mui/material/colors';
import { FormEventHandler, useState, useEffect } from "react";
import Swal from 'sweetalert2';

import PROVINCES_JSON from '@/data/province.json';
import DISTRICTS_JSON from '@/data/district.json';
import SUBDISTRICTS_JSON from '@/data/sub_district.json';

type Province = { id: number; name_th: string; name_en?: string; };
type Amphure = { id: number; province_id: number; name_th: string; };
type Tambon = { id: number; district_id: number; zip_code: number; name_th: string; };

export default function ProfileForm({ customer, vat, className = '' }: ProfileFormProps) {
    const { t } = useLanguage();
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        id: customer?.id || "",
        cust_firstname: customer?.cust_firstname || "",
        cust_lastname: customer?.cust_lastname || "",
        cust_gender: customer?.cust_gender || "",
        cust_email: customer?.cust_email || "",
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
    const [taxProvinces, setTaxProvinces] = useState<Province[]>([]);
    const [taxAmphures, setTaxAmphures] = useState<Amphure[]>([]);
    const [taxTambons, setTaxTambons] = useState<Tambon[]>([]);

    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const res = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province.jsonfdfd");
                if (!res.ok) throw new Error("API Province failed");
                const data: Province[] = await res.json();
                setProvinces(data);
                setTaxProvinces(data);
                console.log("✅ Loaded provinces from API");
            } catch (err) {
                console.warn("⚠️ Province API failed, using local JSON");
                setProvinces(PROVINCES_JSON as Province[]);
                setTaxProvinces(PROVINCES_JSON as Province[]);
            }
        };
        loadProvinces();
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            let allAmphures: Amphure[] = [];
            let allTambons: Tambon[] = [];

            try {
                const amphureRes = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json");
                const tambonRes = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json");
                if (!amphureRes.ok || !tambonRes.ok) throw new Error("API error");
                allAmphures = await amphureRes.json();
                allTambons = await tambonRes.json();
                console.log("✅ Loaded district/tambon from API");
            } catch {
                console.warn("⚠️ Amphure/Tambon API failed, using local JSON");
                allAmphures = DISTRICTS_JSON as Amphure[];
                allTambons = SUBDISTRICTS_JSON as Tambon[];
            }

            // --- ตั้งค่า Customer ---
            if (customer?.cust_province) {
                const selectedProvince = provinces.find(p => p.name_th === customer.cust_province);
                if (selectedProvince) {
                    const filteredAmphures = allAmphures.filter(a => a.province_id == selectedProvince.id);
                    setAmphures(filteredAmphures);

                    if (customer.cust_district) {
                        const selectedAmphure = filteredAmphures.find(a => a.name_th === customer.cust_district);
                        if (selectedAmphure) {
                            const filteredTambons = allTambons.filter(t => t.district_id == selectedAmphure.id);
                            setTambons(filteredTambons);
                        }
                    }
                }
            }

            // --- ตั้งค่า Tax ---
            if (customer?.tax_province) {
                const selectedTaxProvince = provinces.find(p => p.name_th === customer.tax_province);
                if (selectedTaxProvince) {
                    const filteredTaxAmphures = allAmphures.filter(a => a.province_id == selectedTaxProvince.id);
                    setTaxAmphures(filteredTaxAmphures);

                    if (customer.tax_district) {
                        const selectedTaxAmphure = filteredTaxAmphures.find(a => a.name_th === customer.tax_district);
                        if (selectedTaxAmphure) {
                            const filteredTaxTambons = allTambons.filter(t => t.district_id == selectedTaxAmphure.id);
                            setTaxTambons(filteredTaxTambons);
                        }
                    }
                }
            }
        };
        if (provinces.length > 0 && customer) loadInitialData();
    }, [provinces, customer]);

    // ✅ handleProvinceChange (fallback)
    const handleProvinceChange = async (province: Province | null) => {
        if (province) {
            setData("cust_province", province.name_th);
            let allAmphures: Amphure[] = [];
            try {
                const res = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json");
                if (!res.ok) throw new Error("API fail");
                allAmphures = await res.json();
            } catch {
                console.warn("⚠️ Amphure API failed, using local JSON");
                allAmphures = DISTRICTS_JSON as Amphure[];
            }
            setAmphures(allAmphures.filter(a => a.province_id == province.id));
            setTambons([]);
        } else {
            setData("cust_province", "");
            setAmphures([]);
            setTambons([]);
        }
        setData("cust_district", "");
        setData("cust_subdistrict", "");
        setData("cust_zipcode", "");
    };

    const handleAmphureChange = async (amphure: Amphure | null) => {
        if (amphure) {
            setData("cust_district", amphure.name_th);
            let allTambons: Tambon[] = [];
            try {
                const res = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json");
                if (!res.ok) throw new Error("API fail");
                allTambons = await res.json();
            } catch {
                console.warn("⚠️ Tambon API failed, using local JSON");
                allTambons = SUBDISTRICTS_JSON as Tambon[];
            }
            setTambons(allTambons.filter(t => t.district_id == amphure.id));
        } else {
            setData("cust_district", "");
            setTambons([]);
        }
        setData("cust_subdistrict", "");
        setData("cust_zipcode", "");
    };

    const handleTambonChange = (tambon: Tambon | null) => {
        if (tambon) {
            setData("cust_subdistrict", tambon.name_th);
            setData("cust_zipcode", String(tambon.zip_code));
        } else {
            setData("cust_subdistrict", "");
            setData("cust_zipcode", "");
        }
    };

    const handleTaxProvinceChange = async (province: Province | null) => {
        if (province) {
            setData("tax_province", province.name_th);
            let allAmphures: Amphure[] = [];
            try {
                const res = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json");
                if (!res.ok) throw new Error("API fail");
                allAmphures = await res.json();
            } catch {
                console.warn("⚠️ Tax Amphure API failed, using local JSON");
                allAmphures = DISTRICTS_JSON as Amphure[];
            }
            setTaxAmphures(allAmphures.filter(a => a.province_id == province.id));
            setTaxTambons([]);
        } else {
            setData("tax_province", "");
            setTaxAmphures([]);
            setTaxTambons([]);
        }
        setData("tax_district", "");
        setData("tax_subdistrict", "");
        setData("tax_zipcode", "");
    };

    const handleTaxAmphureChange = async (amphure: Amphure | null) => {
        if (amphure) {
            setData("tax_district", amphure.name_th);
            let allTambons: Tambon[] = [];
            try {
                const res = await fetch("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json");
                if (!res.ok) throw new Error("API fail");
                allTambons = await res.json();
            } catch {
                console.warn("⚠️ Tax Tambon API failed, using local JSON");
                allTambons = SUBDISTRICTS_JSON as Tambon[];
            }
            setTaxTambons(allTambons.filter(t => t.district_id == amphure.id));
        } else {
            setData("tax_district", "");
            setTaxTambons([]);
        }
        setData("tax_subdistrict", "");
        setData("tax_zipcode", "");
    };

    const handleTaxTambonChange = (tambon: Tambon | null) => {
        if (tambon) {
            setData("tax_subdistrict", tambon.name_th);
            setData("tax_zipcode", String(tambon.zip_code));
        } else {
            setData("tax_subdistrict", "");
            setData("tax_zipcode", "");
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
                tax_zipcode: String(data.cust_zipcode || ""),
            });
            setTaxAmphures(amphures);
            setTaxTambons(tambons);
        } else {
            setData({
                ...data,
                tax_name: "",
                tax_tel: "",
                tax_address: "",
                tax_province: "",
                tax_district: "",
                tax_subdistrict: "",
                tax_zipcode: "",
            });
            setTaxAmphures([]);
            setTaxTambons([]);
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
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            title: 'บันทึกข้อมูลผิดพลาด',
                            icon: 'error',
                        });
                    },
                });
            }
        });
    };

    return (
        <section className={className}>
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
                onClick={() => router.get(route("customer.profile.welcome"))}
            >
                {t.Customer.routeRedirect}
            </Button>

            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {t.Customer.title.mainTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {/* คุณสามารถแก้ไขข้อมูลส่วนตัวและที่อยู่ใบกำกับภาษีได้ที่นี่ */}
                    {t.Customer.title.sub}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <fieldset className="border border-gray-300 rounded-md p-4 dark:border-gray-700">
                    <legend className="text-md font-semibold text-gray-700 dark:text-gray-200">
                        {t.Customer.form.formLengend}
                    </legend>
                    <div>
                        <InputLabel htmlFor="cust_firstname" value={t.Customer.form.firstname} required />
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
                        <InputLabel htmlFor="cust_lastname" value={t.Customer.form.lastname} required />
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
                        <InputLabel htmlFor="cust_gender" value={t.Customer.form.gender} required />
                        <select
                            id="cust_gender"
                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm"
                            value={data.cust_gender}
                            onChange={(e) => setData('cust_gender', e.target.value)}
                            required
                        >
                            <option value=""> {'--- กรุณาเลือกเพศ ---'} </option>
                            <option value="ชาย">{t.Customer.form.male}</option>
                            <option value="หญิง">{t.Customer.form.female}</option>
                        </select>

                        <InputError className="mt-2" message={errors.cust_gender} />
                    </div>
                    <div className='mt-4'>
                        <InputLabel htmlFor="cust_tel" value={t.Customer.form.tel} required />
                        <TextInput
                            id="cust_tel"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                            className="mt-1 block w-full"
                            value={data.cust_tel}
                            onChange={(e) => {
                                const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                                setData('cust_tel', onlyNums);
                            }}
                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                            }}
                            required
                        />
                        <InputError className="mt-2" message={errors.cust_tel} />
                    </div>
                    <div className="mt-4">
                        <InputLabel htmlFor="cust_birthdate" value={t.Customer.form.birthdate} required />
                        <TextInput
                            id="cust_birthdate"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.cust_birthdate}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => {
                                const selectedDate = e.target.value;
                                const today = new Date().toISOString().split("T")[0];
                                if (selectedDate > today) {
                                    setData("cust_birthdate", today);
                                } else {
                                    setData("cust_birthdate", selectedDate);
                                }
                            }}
                            required
                        />
                        <InputError className="mt-2" message={errors.cust_birthdate} />
                    </div>
                    <div className='mt-4'>
                        <InputLabel htmlFor="cust_email" value={t.Customer.form.email} />
                        <TextInput
                            id="cust_email"
                            className="mt-1 block w-full"
                            value={data.cust_email}
                            onChange={(e) => setData('cust_email', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.cust_email} />
                    </div>
                    <div className='mt-4'>
                        <InputLabel htmlFor="cust_full_address" value={t.Customer.form.address} required />
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
                            <InputLabel htmlFor="cust_province" value={t.Customer.form.province} required />
                            <Autocomplete
                                options={provinces}
                                getOptionLabel={(option) => option.name_th}
                                value={provinces.find((p) => p.name_th === data.cust_province) || null}
                                onChange={(e, v) => handleProvinceChange(v)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <InputError className="mt-2" message={errors.cust_province} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        <div>
                            <InputLabel htmlFor="cust_district" value={t.Customer.form.district} required />
                            <Autocomplete
                                options={amphures}
                                getOptionLabel={(option) => option.name_th}
                                value={amphures.find((a) => a.name_th === data.cust_district) || null}
                                onChange={(e, v) => handleAmphureChange(v)}
                                renderInput={(params) => (
                                    <TextField {...params} />
                                )}
                            />
                            <InputError className="mt-2" message={errors.cust_district} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        <div>
                            <InputLabel htmlFor="cust_subdistrict" value={t.Customer.form.subdistrict} required />
                            <Autocomplete
                                options={tambons}
                                getOptionLabel={(option) => option.name_th}
                                value={tambons.find((t) => t.name_th === data.cust_subdistrict) || null}
                                onChange={(e, v) => handleTambonChange(v)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <InputError className="mt-2" message={errors.cust_subdistrict} />
                        </div>
                        <div>
                            <InputLabel htmlFor="cust_zipcode" value={t.Customer.form.zipcode} required />
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
                        {/* ที่อยู่ใบกำกับภาษี */}
                        {t.Customer.form.tax.title}
                        <label className="flex items-center gap-2 text-sm font-normal">
                            <input
                                type="checkbox"
                                checked={sameAsProfile}
                                onChange={handleCheckboxChange}
                            />
                            {t.Customer.form.tax.sameAsProfile}
                        </label>
                    </legend>

                    <div className="space-y-4 mt-4">
                        <InputLabel htmlFor="tax_name" value={t.Customer.form.firstname} required />
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
                        <InputLabel htmlFor="tax_tel" value={t.Customer.form.tel} required />
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
                        <InputLabel htmlFor="tax_address" value={t.Customer.form.address} required />
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
                        <div>
                            <InputLabel htmlFor="tax_province" value={t.Customer.form.province} required />
                            <Autocomplete
                                options={taxProvinces}
                                getOptionLabel={(option) => option.name_th}
                                value={taxProvinces.find((p) => p.name_th === data.tax_province) || null}
                                onChange={(e, v) => handleTaxProvinceChange(v)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <InputError className="mt-2" message={errors.tax_province} />
                        </div>
                        <div className='mt-4'>
                            <InputLabel htmlFor="tax_district" value={t.Customer.form.district} required />
                            <Autocomplete
                                options={taxAmphures}
                                getOptionLabel={(option) => option.name_th}
                                value={taxAmphures.find((a) => a.name_th === data.tax_district) || null}
                                onChange={(e, v) => handleTaxAmphureChange(v)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <InputError className="mt-2" message={errors.tax_district} />
                        </div>
                    </div>
                    <div>
                        <div className='mt-4'>
                            <InputLabel htmlFor="tax_subdistrict" value={t.Customer.form.subdistrict} required />
                            <Autocomplete
                                options={taxTambons}
                                getOptionLabel={(option) => option.name_th}
                                value={taxTambons.find((t) => t.name_th === data.tax_subdistrict) || null}
                                onChange={(e, v) => handleTaxTambonChange(v)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <InputError className="mt-2" message={errors.tax_subdistrict} />
                        </div>

                        <div className='mt-4'>
                            <InputLabel htmlFor="tax_zipcode" value={t.Customer.form.zipcode} required />
                            <TextInput
                                id="tax_zipcode"
                                className="mt-1 block w-full"
                                value={data.tax_zipcode}
                                onChange={(e) => setData('tax_zipcode', e.target.value)}
                                required
                                disabled
                            />
                            <InputError className="mt-2" message={errors.tax_zipcode} />
                        </div>
                    </div>
                </fieldset>

                <div className="flex items-center gap-4 mt-8">
                    <PrimaryButton disabled={processing}>{t.Customer.form.buttonSave}</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t.Customer.form.saved}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}