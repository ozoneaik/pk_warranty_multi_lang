import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import { PageProps as AppPageProps } from './';

// declare global {

//     interface PowerAccessoriesData {
//         battery?: PowerAccessoryItem[];
//         charger?: PowerAccessoryItem[];
//     }

//     interface ProductDetail {
//         pid?: string;
//         p_name?: string;
//         pname?: string;
//         warranty_status?: boolean;
//         fac_model?: string;
//         p_path?: string;
//         image?: string;
//         warrantyperiod?: string;
//         warrantycondition?: string;
//         warrantynote?: string;
//         sp_warranty?: {
//             spname: string;
//             spcode?: { pidsp: string };
//         }[];
//         // เพิ่มตรงนี้
//         power_accessories?: PowerAccessoriesData | null;
//     }

//     interface PowerAccessoryItem {
//         id: number;
//         accessory_sku: string;
//         product_name: string;
//         warranty_period: string;
//         warranty_condition: string;
//         warranty_note: string;
//         no: number;
//     }

//     /* eslint-disable no-var */
//     var route: typeof ziggyRoute;

//     interface WarrantyFormProps {
//         data: {
//             warranty_file: string,
//             serial_number: string,
//             model_code: string,
//             model_name: string,
//             product_name: string,
//             buy_from: string,
//             buy_date: string,
//             phone?: string,
//             store_name: string,
//             customer_code?: string,
//             pc_code: string;
//         },
//         setData: any,
//         processing: boolean,
//         errors: any,
//         post: any
//     }

//     // interface ProductDetail {
//     //     pid?: string,
//     //     p_name?: string,
//     //     warranty_status?: boolean,
//     //     fac_model? : string,
//     //     p_path? : string
//     // }
//     interface ProductDetail {
//         pid?: string;
//         p_name?: string;
//         pname?: string;
//         warranty_status?: boolean;
//         fac_model?: string;
//         p_path?: string;
//         image?: string;
//         // เพิ่มจาก ProductDetailComponent
//         warrantyperiod?: string;
//         warrantycondition?: string;
//         warrantynote?: string;
//         sp_warranty?: {
//             spname: string;
//             spcode?: { pidsp: string };
//         }[];
//     }
// }

declare global {

    // Interface สำหรับรายการ Battery/Charger
    interface PowerAccessoryItem {
        id: number;
        accessory_sku: string;
        product_name: string;
        warranty_period: string;
        warranty_condition: string;
        warranty_note: string;
        no: number;
    }

    // Interface สำหรับ Group ของ Accessories
    interface PowerAccessoriesData {
        battery?: PowerAccessoryItem[];
        charger?: PowerAccessoryItem[];
    }

    // Interface หลักของสินค้า (รวม Single + Combo Logic)
    interface ProductDetail {
        // ข้อมูลพื้นฐาน
        pid?: string;
        p_name?: string;
        pname?: string; // API มักส่ง key นี้
        fac_model?: string;
        model_name?: string;

        // รูปภาพ
        p_path?: string;
        image?: string | string[]; // บางที API ส่งเป็น Array
        imagesku?: string | string[]; // Field จาก assets ใน Combo

        // สถานะการรับประกัน
        warranty_status?: boolean;
        warrantyperiod?: string;
        warrantycondition?: string;
        warrantynote?: string;

        // อะไหล่ (Legacy logic)
        sp_warranty?: {
            spname: string;
            spcode?: { pidsp: string };
        }[];

        // อุปกรณ์เสริม (Battery/Charger)
        power_accessories?: PowerAccessoriesData | null;

        // ส่วนของ Combo Set
        is_combo?: boolean;
        skumain?: string;
        combo_skus?: string[]; // รายการ SKU ในชุด เช่น ["50402", "50398"]
        assets?: Record<string, ProductDetail>; // เก็บข้อมูลสินค้าลูกในชุด Combo โดย key เป็น SKU
        main_assets?: ProductDetail;
    }

    /* eslint-disable no-var */
    var route: typeof ziggyRoute;

    interface WarrantyFormProps {
        data: {
            warranty_file: string | File | null; // รองรับ File object
            serial_number: string;
            model_code: string;
            model_name: string;
            product_name: string;
            buy_from: string;
            buy_date: string;
            phone?: string;
            store_name: string;
            customer_code?: string;
            pc_code: string;
        },
        setData: any, // หรือใช้ Inertia Form helper type ถ้ามี
        processing: boolean,
        errors: Record<string, string>,
        post: any
    }
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps { }
}
