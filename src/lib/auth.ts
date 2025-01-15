// Mock user data
export const mockUsers = [
  {
    id: 1,
    username: "admin",
    password: "admin123", // In real app, this would be hashed
    name: "Admin User",
    role: "admin"
  },
  {
    id: 2,
    username: "user",
    password: "user123",
    name: "Regular User",
    role: "user"
  }
];

export type User = {
  id: number;
  username: string;
  name: string;
  role: string;
};