import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import { PageProps as AppPageProps } from './';

declare global {

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
            phone: string,
            store_name: string
        },
        setData: (key: string, value: any) => void,
        processing: boolean,
        errors: any
    }
    
    interface ProductDetail {
        pid?: string,
        p_name?: string,
        warranty_status?: boolean
    }
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps { }
}
