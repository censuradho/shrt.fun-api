import { CreateHitEntityDto } from "./dtos/CreateHitEntity.dto";

export interface IHitRepository {
  incrementHitCount(payload: CreateHitEntityDto): Promise<void>;
} 