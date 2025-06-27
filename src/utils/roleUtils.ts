// Role-based Access Control Utilities

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr', 
  ACCOUNTING = 'accounting',
  PURCHASE_DEPARTMENT = 'purchase_department',
  PROJECT_MANAGER = 'project_manager',
  MECHANICS = 'mechanics',
  WORKER = 'worker'
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
   * Get default role for new users (only used as fallback in extreme cases)
   */
  static getDefaultRole(): UserRole {
    return UserRole.WORKER;
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
    return userRoles.some(role => requiredRoles.includes(role as UserRole));
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
    return this.hasAnyRole(userRoles, [UserRole.PROJECT_MANAGER, UserRole.ADMIN]);
  }

  /**
   * Get role hierarchy level (higher number = more privileges)
   */
  static getRoleLevel(role: UserRole): number {
    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.WORKER]: 1,
      [UserRole.MECHANICS]: 2,
      [UserRole.PURCHASE_DEPARTMENT]: 3,
      [UserRole.ACCOUNTING]: 4,
      [UserRole.HR]: 5,
      [UserRole.PROJECT_MANAGER]: 6,
      [UserRole.ADMIN]: 7
    };
    return roleHierarchy[role] || 0;
  }

  /**
   * Get highest role level from user's roles
   */
  static getHighestRoleLevel(userRoles: string[]): number {
    return Math.max(...userRoles.map(role => this.getRoleLevel(role as UserRole)));
  }

  /**
   * Validate role input - role is required, no defaults
   */
  static validateRole(role: string | string[] | undefined): UserRole {
    console.log('Validating role:', {
      receivedRole: role,
      roleType: typeof role,
      isArray: Array.isArray(role)
    });

    // Handle array input
    if (Array.isArray(role)) {
      if (role.length === 0) {
        throw new Error('Role is required. Please select a role from the available options.');
      }
      role = role[0]; // Take the first role if array
    }

    if (!role || role.trim() === '') {
      throw new Error('Role is required. Please select a role from the available options.');
    }

    const normalizedRole = role.toLowerCase().trim();
    console.log('Normalized role:', normalizedRole);
    console.log('Valid roles:', VALID_ROLES);
    
    if (!this.isValidRole(normalizedRole)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${VALID_ROLES.join(', ')}`);
    }

    return normalizedRole as UserRole;
  }

  /**
   * Get available roles for frontend
   */
  static getAvailableRoles() {
    return [
      { label: 'Admin', value: UserRole.ADMIN },
      { label: 'HR', value: UserRole.HR },
      { label: 'Accounting', value: UserRole.ACCOUNTING },
      { label: 'Purchase Department', value: UserRole.PURCHASE_DEPARTMENT },
      { label: 'Project Manager', value: UserRole.PROJECT_MANAGER },
      { label: 'Mechanics', value: UserRole.MECHANICS },
      { label: 'Worker', value: UserRole.WORKER }
    ];
  }
} 