import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import  * as  bcryptjs  from  'bcryptjs'; 
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { CreateUserDto, LoginDto,  RegisterUserDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(  User.name  )
    private userModel:  Model<User>,
    private jwtService: JwtService,
  ){}

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {
      /// 1.- Encriptar la contraseña
      const { password, ...userData } = createUserDto

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(  password, 10  ),
        ...userData
      });

      /// 2.- Guardar el usuario

      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();
          
      return  user; 

    } catch (error){
      if( error.code  === 1100 )  {
        throw new BadRequestException(  `${ createUserDto.email } already exists!`  )
      }
      throw new InternalServerErrorException('Somethibg terrible happen!!!!')
    }
    
  }

  async register( registerUserDto:  RegisterUserDto ): Promise<LoginResponse>  {

    const user  = await this.create(  registerUserDto  );
    console.log({user});

    return  {
      user: user,
      token:  this.getJwtPayload({  id: user._id  })
    }
  }

  async login(  loginDto: LoginDto  ):  Promise<LoginResponse>{

    const { email,  password  } = loginDto;

    const user  = await this.userModel.findOne({  email  });
    if  ( !user ) {
      throw new UnauthorizedException('Not valid credentials - email');
    }

    if  ( !bcryptjs.compareSync(  password, user.password  ) ){
      throw new UnauthorizedException(' Not valid credentials - password');
    }

    const { password:_, ...rest } = user.toJSON();

    return  {
      user: rest,
      token:  this.getJwtPayload({  id: user.id  })
    }

  }

  findAll():  Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string ){
    const user  = await this.userModel.findById(  id  );
    const { password, ...rest } = user.toJSON();
    return  rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtPayload(  payload:  JwtPayload  ){
    const token = this.jwtService.sign(payload);
    return  token;
  }

}
