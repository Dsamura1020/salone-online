import { prisma } from "@/lib/prisma/prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
  },

  findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
  },

  findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  countAdmins() {
    return prisma.user.count({
      where: {
        roles: {
          some: {
            role: { name: { in: ["ADMIN", "SUPER_ADMIN"] } },
          },
        },
      },
    });
  },
};
