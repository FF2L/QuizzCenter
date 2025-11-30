import axios from "axios";
import { API_URL } from "./gobal.api";
import { data } from "react-router-dom";

export class LoginService {
    static getAccessToken(path?: string): string {
    const currentPath = path || window.location.pathname;
  
    if (currentPath.includes('/lecturer/')) {
      return localStorage.getItem('accessTokenGV') || '';
    } else if (currentPath.includes('/quizzcenter/')) {
      return localStorage.getItem('accessTokenSV') || '';
    } else if (currentPath.includes('/admin/')) {
      return localStorage.getItem('accessTokenAD') || '';
    }
  
    return '';
  }
    static login = async (username: string, password: string) => {
        try {
            console.log((API_URL))
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
    static logout = async () =>{
        const accessToken = this.getAccessToken();
        console.log('Logging out with token:', accessToken);
        if (!accessToken) {
            return {ok: true, data: null};
        }
        try{
            const res = await axios.post(`${API_URL}/auth/logout`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log('Logout Response:', res.data);
            return {ok: true, data: res.data}
        }catch(error){
            throw error;
        }
    }
}
