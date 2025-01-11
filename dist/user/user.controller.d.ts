import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<import("./schema/user.schema").User>;
    findAll(): Promise<import("./schema/user.schema").User[]>;
    findById(id: string): Promise<import("./schema/user.schema").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./schema/user.schema").User>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
