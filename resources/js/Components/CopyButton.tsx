// import React, { useState } from 'react';
// import { IconButton, Tooltip } from '@mui/material';
// import { ContentCopy, Check } from '@mui/icons-material';
// import Swal from 'sweetalert2';

// interface CopyButtonProps {
//     text: string | null | undefined;
//     size?: 'small' | 'medium' | 'large';
//     color?: string; // e.g. '#999', 'primary.main'
// }

// export default function CopyButton({ text, size = 'small', color = '#999' }: CopyButtonProps) {
//     const [copied, setCopied] = useState(false);

//     const handleCopy = async (e: React.MouseEvent) => {
//         e.stopPropagation(); // กัน event ทะลุ (เช่น กดแล้ว Card เด้ง)

//         const onSuccess = () => {
//             setCopied(true);
//             setTimeout(() => setCopied(false), 2000);

//             // ✅ ใช้ position: 'center' เพื่อแก้ปัญหาโดน Header บัง
//             Swal.fire({
//                 toast: true,
//                 position: 'center',
//                 icon: 'success',
//                 title: 'คัดลอกเรียบร้อย',
//                 showConfirmButton: false,
//                 timer: 1500,
//                 customClass: {
//                     container: 'swal2-container-high-zindex' // เพิ่ม class ถ้าจำเป็น
//                 },
//                 didOpen: (toast) => {
//                     toast.style.zIndex = '9999';
//                 }
//             });
//         };

//         // Logic Copy (Support both HTTPS & HTTP)
//         if (navigator.clipboard && window.isSecureContext) {
//             try {
//                 await navigator.clipboard.writeText(text);
//                 onSuccess();
//             } catch (err) {
//                 console.error("Clipboard API failed", err);
//             }
//         } else {
//             // Fallback
//             const textArea = document.createElement("textarea");
//             textArea.value = text;
//             textArea.style.position = "fixed";
//             textArea.style.left = "-9999px";
//             document.body.appendChild(textArea);
//             textArea.focus();
//             textArea.select();
//             try {
//                 document.execCommand('copy');
//                 onSuccess();
//             } catch (err) {
//                 console.error('Fallback copy failed', err);
//             }
//             document.body.removeChild(textArea);
//         }
//     };

//     return (
//         <Tooltip title={copied ? "คัดลอกแล้ว" : "กดเพื่อคัดลอก"}>
//             <IconButton
//                 size={size}
//                 onClick={handleCopy}
//                 sx={{
//                     ml: 0.5,
//                     p: 0.5,
//                     bgcolor: copied ? '#e8f5e9' : 'transparent',
//                     transition: 'all 0.2s',
//                     '&:hover': { bgcolor: copied ? '#e8f5e9' : 'rgba(0,0,0,0.04)' }
//                 }}
//             >
//                 {copied ?
//                     <Check sx={{ fontSize: 14, color: 'green' }} /> :
//                     <ContentCopy sx={{ fontSize: 14, color: color }} />
//                 }
//             </IconButton>
//         </Tooltip>
//     );
// }

import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';
import Swal from 'sweetalert2';

interface CopyButtonProps {
    text: string | null | undefined;
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

export default function CopyButton({ text, size = 'small', color = '#999' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // ✅ กัน text ว่างตั้งแต่ต้น
        if (!text) {
            Swal.fire({
                toast: true,
                position: 'center',
                icon: 'warning',
                title: 'ไม่มีข้อความให้คัดลอก',
                showConfirmButton: false,
                timer: 1500,
            });
            return;
        }

        const onSuccess = () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            Swal.fire({
                toast: true,
                position: 'center',
                icon: 'success',
                title: 'คัดลอกเรียบร้อย',
                showConfirmButton: false,
                timer: 1500,
                didOpen: (toast) => {
                    toast.style.zIndex = '9999';
                }
            });
        };

        // ✅ ตอนนี้ text = string แน่นอน
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                onSuccess();
            } catch (err) {
                console.error('Clipboard API failed', err);
            }
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                onSuccess();
            } catch (err) {
                console.error('Fallback copy failed', err);
            }

            document.body.removeChild(textArea);
        }
    };

    return (
        <Tooltip title={copied ? 'คัดลอกแล้ว' : 'กดเพื่อคัดลอก'}>
            <span>
                <IconButton
                    size={size}
                    onClick={handleCopy}
                    disabled={!text}
                    sx={{
                        ml: 0.5,
                        p: 0.5,
                        bgcolor: copied ? '#e8f5e9' : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: copied ? '#e8f5e9' : 'rgba(0,0,0,0.04)' }
                    }}
                >
                    {copied ? (
                        <Check sx={{ fontSize: 14, color: 'green' }} />
                    ) : (
                        <ContentCopy sx={{ fontSize: 14, color }} />
                    )}
                </IconButton>
            </span>
        </Tooltip>
    );
}
