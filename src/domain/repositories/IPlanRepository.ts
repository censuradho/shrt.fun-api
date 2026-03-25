export interface PlanModel {
  id: string
  name: string
  monthlyLinkLimit: number
  createdAt: Date
  updatedAt: Date
}

export interface IPlanRepository {
  findById(id: string): Promise<PlanModel | null>
  findByName(name: string): Promise<PlanModel | null>
}
