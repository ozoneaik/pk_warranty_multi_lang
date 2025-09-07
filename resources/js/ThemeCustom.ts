// theme.ts
import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#F54927",
        },
    },
    components: {
        // MuiButtonBase: {
        //     defaultProps: {
        //         disableRipple: true,
        //     },
        // },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: "none",
                    padding : '10px'
                },
            },
        }
    },
});