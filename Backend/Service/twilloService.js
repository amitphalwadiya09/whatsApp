import twillo from "twilio";

//twillo keys
const accountSid = process.env.TWILLO_ACCOUNT_SID;
const authToken = process.env.TWILLO_AUTH_TOKEN;
const serviceSid = process.env.TWILLO_SERVICE_SID;

const client = twillo(accountSid, authToken);

export const sendOtpToPhoneNumber = async (phoneNumber) => {
    try {
        console.log("sending otp to this number", phoneNumber)

        if (!phoneNumber) {
            throw new Error("phone is required");
        }

        const response = await client.verify.v2
            .services(serviceSid)
            .verifications
            .create({
                to: phoneNumber,
                channel: "sms"
            });

        console.log("verification SID:", response.sid);
        console.log("Twilio response:", response);

        return response;

    } catch (error) {
        console.error(error);
        throw new Error("failed to send otp");
    }
};
// to verify otp

export const TwilloverifyOtp = async (phoneNumber, otp) => {
    try {

        console.log(`this is my otp ${otp} and phoen number ${phoneNumber}`)
        const response = await client.verify.v2.services(serviceSid).verificationChecks.create({
            to: phoneNumber,
            code: otp
        })
        console.log(response);
        return response;
    } catch (error) {
        console.error(error);
        throw new Error("otp verification failed")
    }
}

