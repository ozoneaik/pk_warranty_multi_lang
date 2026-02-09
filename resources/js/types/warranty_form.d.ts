import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import { PageProps as AppPageProps } from './';

declare global {

    interface PowerAccessoriesData {
        battery?: PowerAccessoryItem[];
        charger?: PowerAccessoryItem[];
    }

    interface ProductDetail {
        pid?: string;
        p_name?: string;
        pname?: string;
        warranty_status?: boolean;
        fac_model?: string;
        p_path?: string;
        image?: string;
        warrantyperiod?: string;
        warrantycondition?: string;
        warrantynote?: string;
        sp_warranty?: {
            spname: string;
            spcode?: { pidsp: string };
        }[];
        // เพิ่มตรงนี้
        power_accessories?: PowerAccessoriesData | null;
    }

    interface PowerAccessoryItem {
        id: number;
        accessory_sku: string;
        product_name: string;
        warranty_period: string;
        warranty_condition: string;
        warranty_note: string;
        no: number;
    }

    /* eslint-disable no-var */
    var route: typeof ziggyRoute;

    interface WarrantyFormProps {
        data: {
            warranty_file: string,
            serial_number: string,
            model_code: string,
            model_name: string,
            product_name: string,
            buy_from: string,
            buy_date: string,
            phone?: string,
            store_name: string,
            customer_code?: string,
            pc_code: string;
        },
        setData: any,
        processing: boolean,
        errors: any,
        post: any
    }

    // interface ProductDetail {
    //     pid?: string,
    //     p_name?: string,
    //     warranty_status?: boolean,
    //     fac_model? : string,
    //     p_path? : string
    // }
    interface ProductDetail {
        pid?: string;
        p_name?: string;
        pname?: string;
        warranty_status?: boolean;
        fac_model?: string;
        p_path?: string;
        image?: string;
        // เพิ่มจาก ProductDetailComponent
        warrantyperiod?: string;
        warrantycondition?: string;
        warrantynote?: string;
        sp_warranty?: {
            spname: string;
            spcode?: { pidsp: string };
        }[];
    }
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps { }
}
