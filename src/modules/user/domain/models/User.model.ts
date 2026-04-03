export interface UserModel {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isActive: boolean
  createdAt: Date
  plan: {
    name: string
    monthlyLinkLimit: number
    monthlyQrCodeLimit: number
  }
}