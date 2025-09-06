import { RefeshJwtAuthGuard } from './guards/refesh-jwt-auth/refesh-jwt-auth.guard';
import { Controller, Post, Request, UseGuards, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
    @UseGuards(LocalAuthGuard) 
    @Post('login')
    async dangNhapEmailVaMatKhau(@Request() req){
      const token = await this.authService.dangNhap(req.user.id)
      return {token: token}
    }

    @UseGuards(RefeshJwtAuthGuard)
    @Post('refesh')
    async refeshTokenDangNhap(@Request() req){
      const token = await this.authService.refesh(req.user.id)
      return {token: token}
    }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req){
    console.log(req.user.userId)
    return this.authService.dangXuat(req.user.userId)
  }
  
}
