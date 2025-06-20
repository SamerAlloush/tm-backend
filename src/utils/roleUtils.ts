// Role-based Access Control Utilities

export enum UserRole {
  USER = 'user',
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export const VALID_ROLES = Object.values(UserRole);

export class RoleUtils {
  /**
   * Check if a role is valid
   */
  static isValidRole(role: string): boolean {
    return VALID_ROLES.includes(role as UserRole);
  }

  /**
   * Get default role for new users
   */
  static getDefaultRole(): UserRole {
    return UserRole.USER;
  }

  /**
   * Check if user has specific role
   */
  static hasRole(userRoles: string[], requiredRole: UserRole): boolean {
    return userRoles.includes(requiredRole);
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(userRoles: string[], requiredRoles: UserRole[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
  }

  /**
   * Check if user has all specified roles
   */
  static hasAllRoles(userRoles: string[], requiredRoles: UserRole[]): boolean {
    return requiredRoles.every(role => userRoles.includes(role));
  }

  /**
   * Check if user is admin
   */
  static isAdmin(userRoles: string[]): boolean {
    return this.hasRole(userRoles, UserRole.ADMIN);
  }

  /**
   * Check if user is manager or above
   */
  static isManagerOrAbove(userRoles: string[]): boolean {
    return this.hasAnyRole(userRoles, [UserRole.MANAGER, UserRole.ADMIN]);
  }

  /**
   * Get role hierarchy level (higher number = more privileges)
   */
  static getRoleLevel(role: UserRole): number {
    const hierarchy = {
      [UserRole.USER]: 1,
      [UserRole.CUSTOMER]: 2,
      [UserRole.VENDOR]: 3,
      [UserRole.MANAGER]: 4,
      [UserRole.ADMIN]: 5
    };
    return hierarchy[role] || 0;
  }

  /**
   * Get highest role level from user's roles
   */
  static getHighestRoleLevel(userRoles: string[]): number {
    return Math.max(...userRoles.map(role => this.getRoleLevel(role as UserRole)));
  }

  /**
   * Validate and sanitize role input
   */
  static validateRole(role: string): UserRole {
    const normalizedRole = role?.toLowerCase();
    return this.isValidRole(normalizedRole) ? normalizedRole as UserRole : this.getDefaultRole();
  }

  /**
   * Get available roles for signup (excluding admin)
   */
  static getSignupRoles(): { value: UserRole; label: string }[] {
    return [
      { value: UserRole.USER, label: 'User' },
      { value: UserRole.CUSTOMER, label: 'Customer' },
      { value: UserRole.VENDOR, label: 'Vendor' },
      { value: UserRole.MANAGER, label: 'Manager' }
      // Admin role should be assigned by existing admins only
    ];
  }
} 