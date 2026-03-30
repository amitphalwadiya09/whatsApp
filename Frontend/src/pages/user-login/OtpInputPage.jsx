import React, { useRef, useState } from "react";
import { Box, TextField } from "@mui/material";

const OtpInputPage = ({ length = 6, onChangeOtp }) => {

    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputs = useRef([]);

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/g, "");

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        onChangeOtp?.(newOtp.join(""));

        // move forward
        if (value && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {

        // move back if empty and backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <Box display="flex" justifyContent="center" gap={1} sx={{ my: 2 }}>
            {otp.map((digit, index) => (
                <TextField
                    key={index}
                    value={digit}
                    inputRef={(el) => (inputs.current[index] = el)}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    inputProps={{
                        maxLength: 1,
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        style: {
                            textAlign: "center",
                            fontSize: "14px",
                            width: "15px",
                            height: "15px"
                        }
                    }}
                />
            ))}
        </Box>
    );
};

export default OtpInputPage;