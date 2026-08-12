import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId = request.headers['x-organization-id'];

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!orgId) {
      throw new ForbiddenException('Organization context missing (x-organization-id header required)');
    }

    // Find the user's role for this organization
    const orgRole = user.roles?.find((ur: any) => ur.organizationId === orgId);
    
    if (!orgRole || !orgRole.role) {
      throw new ForbiddenException('User does not belong to this organization');
    }

    const userPermissions = orgRole.role.permissions || [];
    
    // Admin override
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check if the user has ALL required permissions
    const hasPermission = requiredPermissions.every(permission => userPermissions.includes(permission));
    
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }
    
    return true;
  }
}
