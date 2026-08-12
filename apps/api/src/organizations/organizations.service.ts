import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto, userId: string) {
    // We will use a database transaction to ensure both the org, default branch,
    // default role (Admin) and user-role assignment succeed or fail together.
    
    return this.prisma.$transaction(async (tx : any) => {
      // 1. Create Organization
      const organization = await tx.organization.create({
        data: {
          name: createOrganizationDto.name,
        }
      });

      // 2. Create Default Branch
      const branch = await tx.branch.create({
        data: {
          name: 'Main Branch',
          organizationId: organization.id,
        }
      });

      // 3. Create Admin Role
      const role = await tx.role.create({
        data: {
          name: 'Admin',
          permissions: ['*'], // Simplification: '*' means all permissions
        }
      });

      // 4. Assign current user as Admin for this organization and branch
      await tx.userRole.create({
        data: {
          userId,
          roleId: role.id,
          organizationId: organization.id,
          branchId: branch.id,
        }
      });

      return organization;
    });
  }

  async findAllForUser(userId: string) {
    // Find organizations the user is a part of
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        organization: true
      }
    });

    // Extract unique organizations
    const uniqueOrgs = new Map();
    for (const ur of userRoles) {
      if (!uniqueOrgs.has(ur.organizationId)) {
        uniqueOrgs.set(ur.organizationId, ur.organization);
      }
    }

    return Array.from(uniqueOrgs.values());
  }

  async findOne(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        branches: true,
      }
    });
  }
}
