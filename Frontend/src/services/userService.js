import axiosInstance from "./url.service"

export const sendOtp = async (phoneNumber, phoneSuffix, email) => {
    try {
        const response = await axiosInstance.post('/api/auth/send-otp', { phoneNumber, phoneSuffix, email })
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}


export const verifyOtp = async (phoneNumber, phoneSuffix, email, otp) => {
    try {
        const response = await axiosInstance.post('/api/auth/verify-otp', { phoneNumber, phoneSuffix, email, otp })
        // console.log(response)
        // console.log(response.data)
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

export const updateUserProfile = async (updateData) => {
    try {
        const response = await axiosInstance.put(
            "/api/auth/update-profile",
            updateData
        );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

export const updateUserNumber = async (phoneNumber) => {
    const response = await axiosInstance.put(
        "/api/auth/update-number",
        { phoneNumber }
    );
    return response.data;
}

export const checkUserAuth = async () => {
    try {
        const response = await axiosInstance.get('/api/auth/check-auth');

        return {
            isAuthenticated: true,
            user: response.data.data
        };

    } catch (error) {
        return { isAuthenticated: false };
    }
};

export const logoutUser = async () => {
    try {
        const response = await axiosInstance.get('/api/auth/logout');

        localStorage.removeItem("token");

        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};


export const getAllUsers = async () => {
    try {
        const response = await axiosInstance.get('/api/auth/users')
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}


export const deleteAccount = async () => {
    try {
        const response = await axiosInstance.delete("/api/auth/delete-user");
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};