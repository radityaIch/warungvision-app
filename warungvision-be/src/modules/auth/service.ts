import Bun from "bun";
import { AuthRepository } from "./repository";
import { RegisterDto, LoginDto, UpdateProfileDto } from "./dto";
import { AppError } from "../../utils/errors";
import { signJwt } from "../../utils/jwt";

const authRepo = new AuthRepository();

export class AuthService {
  async register(registerDto: RegisterDto) {
    const existingUser = await authRepo.findByEmail(registerDto.email);
    if (existingUser) {
      throw new AppError(400, "Email sudah terdaftar");
    }

    const hashedPassword = await Bun.password.hash(registerDto.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const user = await authRepo.create({
      ...registerDto,
      password: hashedPassword,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await authRepo.findByEmail(loginDto.email);
    if (!user) {
      throw new AppError(401, "Email atau password salah");
    }

    const isPasswordValid = await Bun.password.verify(
      loginDto.password,
      user.password,
      "bcrypt"
    );

    if (!isPasswordValid) {
      throw new AppError(401, "Email atau password salah");
    }

    if (!user.isActive) {
      throw new AppError(401, "Akun tidak aktif");
    }

    const token = await signJwt({
      sub: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(id: string) {
    const user = await authRepo.findById(id);
    if (!user) {
      throw new AppError(401, "User tidak ditemukan");
    }
    return user;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const user = await authRepo.findById(id);
    if (!user) {
      throw new AppError(401, "User tidak ditemukan");
    }

    const updateData: any = {};

    if (updateProfileDto.name) {
      updateData.name = updateProfileDto.name;
    }

    if (updateProfileDto.password) {
      updateData.password = await Bun.password.hash(updateProfileDto.password, {
        algorithm: "bcrypt",
        cost: 10,
      });
    }

    const updatedUser = await authRepo.update(id, updateData);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    };
  }

  async getProfile(id: string) {
    const user = await authRepo.findById(id);
    if (!user) {
      throw new AppError(401, "User tidak ditemukan");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: user.storeId,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
