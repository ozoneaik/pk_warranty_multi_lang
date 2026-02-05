import React from 'react';
import { Dialog, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ImagePopupModalProps {
    open: boolean;
    onClose: () => void;
    images: string[];
}

export default function ImagePopupModal({ open, onClose, images }: ImagePopupModalProps) {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
    };

    return (
        <Dialog
            open={open && images.length > 0}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            sx={{
                "& .MuiDialog-paper": {
                    background: "transparent",
                    boxShadow: "none",
                    overflow: "visible",
                },
                "& .MuiBackdrop-root": {
                    backgroundColor: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(2px)",
                }
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{ position: "absolute", top: -18, right: -15, zIndex: 10 }}
            >
                <CloseIcon sx={{ color: "white" }} />
            </IconButton>

            <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                {images.length === 1 ? (
                    <Box
                        component="img"
                        src={images[0]}
                        alt="popup"
                        sx={{ width: "100%", display: "block" }}
                    />
                ) : (
                    <Slider {...settings}>
                        {images.map((imgUrl, index) => (
                            <Box key={index} sx={{ outline: 'none' }}>
                                <Box
                                    component="img"
                                    src={imgUrl}
                                    alt={`popup-${index}`}
                                    sx={{ width: "100%", display: "block", borderRadius: 2 }}
                                />
                            </Box>
                        ))}
                    </Slider>
                )}
            </Box>
        </Dialog>
    );
}