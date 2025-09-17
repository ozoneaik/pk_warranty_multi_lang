import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    required = false,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string; required?: boolean }) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-gray-700 dark:text-gray-300 ` +
                className
            }
        >
            {value ? value : children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
}
