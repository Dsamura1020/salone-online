import { userRepository } from "@/repositories/user.repository";

export async function getUserByEmail(email: string) {
  return userRepository.findByEmail(email);
}

export async function getUserById(userId: string) {
  return userRepository.findById(userId);
}

export async function isUsernameTaken(username: string) {
  const existing = await userRepository.findByUsername(username);
  return Boolean(existing);
}

export async function countAdminUsers() {
  return userRepository.countAdmins();
}
