import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/common/decorations/roles.decorator';
import { Role } from 'src/common/enum/role.enum';

//trong canActivate viết xử lý vào nếu trả về true thì tiếp tục
//ngược lại thì trả ra lỗi bị cấm
//để kiểm tra xem người dùng có thuộc role đó không
//thì phải truy cập vào @Roles() lấy role dùng lớp reflector

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector){}
  canActivate(
    context: ExecutionContext,
  ): boolean {
    // lấy mảng Role từ class và các hàm xử lý key để nhận là Roles_KEY, nơi nhận ( get class, handdler)
    const rolesCanThiet = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY,[
      context.getHandler(),
      context.getClass(),
    ])
    //lấy user từ request sau khi qua guards jwt-auth
    const nguoiDung = context.switchToHttp().getRequest().user

    const coRoleCanThiet = rolesCanThiet.some(role => nguoiDung.role === role)
    return true
  }
}
