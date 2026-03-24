import { CreateUserEntityDto } from "./dtos/CreateUserEntity.dto";

export interface IUserRepository {
  create (input: CreateUserEntityDto): Promise<string>
  checkIfExistsByEmail (email: string): Promise<boolean>
  delete (id: string): Promise<void>
}