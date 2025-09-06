// SetMetadata là hàm của NestJS để gán thêm metadata (siêu dữ liệu) cho class/method.
// Metadata ở đây giống như một “ghi chú”  gắn vào hàm/controller. Sau này Guard hoặc Interceptor có thể đọc ra.
import { SetMetadata } from "@nestjs/common"
import { Role } from "src/common/enum/role.enum"

//Đây là khóa metadata (key).
//Khi gán metadata, cần có key (tên trường)
// và value (giá trị). Ở đây key là "roles".
//Sau này Guard sẽ lấy metadata bằng key "roles" để biết method/controller này yêu cầu role gì.
export const ROLES_KEY = "roles"

//Đây là custom decorator @Roles().
// Khi viết @Roles([Role.Admin, Role.Teacher]) trên một controller method,
// nó sẽ chạy SetMetadata("roles", [Role.Admin, Role.Teacher]).
// Nghĩa là method đó sẽ có metadata với key = "roles", value = [Role.Admin, Role.Teacher].
//... roles nghĩa là thông báo rằng roles sẽ là một mảng @Roles(Role.admin, Role.GiaoVien) thay vi @Roles([Role.admin, Role.GiaoVien])
// [Role, ...Role[]]
// Đây là một tuple type trong TypeScript.
// Nó có nghĩa là:
// Phần tử đầu tiên bắt buộc phải có và là kiểu Role.
// Sau đó có thể có thêm 0 hoặc nhiều phần tử khác, cũng là kiểu Role.
// Nói cách khác: roles không bao giờ là mảng rỗng, ít nhất phải có một Role
export const Roles = (...roles: [Role, ...Role[]] ) => SetMetadata(ROLES_KEY, roles)