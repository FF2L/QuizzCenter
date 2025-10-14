import { RefeshJwtAuthGuard } from './guards/refesh-jwt-auth/refesh-jwt-auth.guard';
import { Body, Controller, Post, Request, UseGuards, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
    @UseGuards(LocalAuthGuard) 
    @Post('login')
    async dangNhapEmailVaMatKhau(@Request() req){

      return await this.authService.dangNhap(req.user.id)
    }

    @UseGuards(RefeshJwtAuthGuard)
    @Post('refesh')
    async refeshTokenDangNhap(@Request() req){
   
      return await this.authService.refesh(req.user.id)
    }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req){
    console.log(req.user.id)
    return this.authService.dangXuat(req.user.id)
  }

  @Post('forgot-pass')
  async forgotPass(@Body('email') email: string){
    return await this.authService.quenMatKhau(email)
  }
  @Post('verify-otp')
    async xacThucOtp(@Body() dto: any){
      const{email, code} = dto
    return await this.authService.xacThucOtp(email,code)
  }

  @Post('reset-password-token')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPasswordWithToken(dto.token, dto.newPassword);
  }

  @Post('resend-otp')
    async resendOtp(@Body('email') email: string){
    return await this.authService.guiLaiOtp(email)
  }

  
}
