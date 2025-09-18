import { PageProps as AppPageProps } from "./";

declare global {
    interface CustomerProfile {
        id?: number;
        cust_firstname?: string;
        cust_lastname?: string;
        cust_gender?: string;
        cust_email?: string | null;
        cust_tel?: string;
        cust_birthdate?: string;
        cust_full_address?: string;
        cust_province?: string;
        cust_district?: string;
        cust_subdistrict?: string;
        cust_zipcode?: string;

        tax_name?: string;
        tax_tel?: string;
        tax_address?: string;
        tax_province?: string;
        tax_district?: string;
        tax_subdistrict?: string;
        tax_zipcode?: string;
    }

    interface ProfileFormProps {
        customer?: CustomerProfile;
        className?: string;
        vat: any;
    }

    interface Province {
        id: number;
        name_th: string;
        name_en: string;
    }

    interface Amphure {
        id: number;
        province_id: number;
        name_th: string;
        name_en: string;
    }

    interface Tambon {
        id: number;
        amphure_id: number;
        name_th: string;
        name_en: string;
        zip_code: string;
    }
}
declare module "@inertiajs/core" {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}
