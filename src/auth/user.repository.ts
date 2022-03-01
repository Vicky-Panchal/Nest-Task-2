import { ConflictException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { EntityRepository, Repository } from "typeorm";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { User } from "./entities/user.entity";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const {username, password, role} = authCredentialsDto;
        
        const user = new User();
        user.username = username;
        user.role = role;
        user.salt = await bcrypt.genSalt();
        user.password = await this.hashPassword(password,user.salt);

        
        try {
            await user.save();
        } catch(error){
            throw new ConflictException("User already exists");
        };
    }

    async validateuserPassowrd(authCredentialsDto: AuthCredentialsDto): Promise<string>{
        const {username, password} = authCredentialsDto;

        const user = await this.findOne({username});

        if(user && await user.validatePassowrd(password)){
            return user.username;
        }
        else {
            return null;
        }
    }

    async hashPassword(password: string, salt: string): Promise<string>{
        return bcrypt.hash(password,salt);
    }
}