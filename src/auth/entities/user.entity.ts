import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {

     _id?:    string; //el id es asignado por mogoose, asi que dejaremos que este proceso sea en automnatico de momento

    @Prop({ unique: true,   required:   true })
    email:  string;

    @Prop({ required:   true })
    name:  string;

    @Prop({ minlength:  6,   required:   true })
    password?:  string;

    @Prop({ default:    true })
    isActive:  boolean;

    @Prop({ type:   [String],   default:    ['user'] })
    roles:  string[];

}

export  const   UserSchema  =   SchemaFactory.createForClass(User);