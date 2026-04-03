import { UserModel } from "../models/User.model";
import { CreateUserEntityDto } from "./dtos/CreateUserEntity.dto";

export interface IUserRepository {
  create (input: CreateUserEntityDto): Promise<string>
  checkIfExistsByEmail (email: string): Promise<boolean>
  findUserBySupabaseId (supabaseId: string): Promise<UserModel | null>
  delete (id: string): Promise<void>
  me (id: string): Promise<UserModel | null>
}