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
            phone?: string,
            store_name: string,
            customer_code? : string,
        },
        setData: any,
        processing: boolean,
        errors: any,
        post : any
    }
    
    interface ProductDetail {
        pid?: string,
        p_name?: string,
        warranty_status?: boolean,
        fac_model? : string,
        p_path? : string
    }
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps { }
}
