import axios from "axios";
import { API_URL } from "./gobal.api";
import { data } from "react-router-dom";

export class LoginService {
    static login = async (username: string, password: string) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: username,
                matKhau: password,
            });
            return {ok: true, data: res.data}
        } catch (error) {
            return {ok: false, error}

        }
    };

    static forgotPass = async (email: string) =>{
        try{
            const res = await axios.post(`${API_URL}/auth/forgot-pass`,{
                email: email
            });
            return {ok: true, data: res.data}
        }catch(error){
            return {ok: false, error}
        }
    }

    static verifyOTP = async (email: string, code: string) =>{
        try{
            const res = await axios.post(`${API_URL}/auth/verify-otp`,{
                email: email,
                code: code
            });
            return {ok: true, data: res.data}
        }catch(error){
            return {ok: false, error}
        }
    }
    static resetPassword = async (token: string, newPassword: string) =>{
        try{
            const res = await axios.post(`${API_URL}/auth/reset-password-token`,{
                token: token,
                newPassword: newPassword
            });
            return {ok: true, data: res.data}
        }catch(error){
            return {ok: false, error}
        }
    }
}
