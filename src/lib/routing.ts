import { prisma } from '@/lib/db';

interface RoutingInput {
  hostEmployeeId?: string;
  departmentId?: string;
}

export interface RoutingResult {
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  approverId: string;
}

/**
 * Routing Engine determines the correct department, location, and approver
 * for a visitor request based on the provided inputs.
 */
export async function determineRouting(input: RoutingInput): Promise<RoutingResult> {
  // Scenario 1: Specific Employee was selected (Unknown Department flow, or explicitly chosen host)
  if (input.hostEmployeeId) {
    const employee = await prisma.user.findUnique({
      where: { id: input.hostEmployeeId },
    });

    if (!employee || !employee.departmentId) {
      throw new Error('Selected employee does not exist or does not belong to a department.');
    }

    const department = await prisma.department.findUnique({
      where: { id: employee.departmentId },
    });

    if (!department) {
      throw new Error('Employee department could not be resolved.');
    }

    const location = await prisma.location.findUnique({
      where: { id: department.locationId },
    });

    return {
      departmentId: department.id,
      departmentName: department.name,
      locationId: department.locationId,
      locationName: location?.name || 'Unknown Location',
      approverId: department.headId, // Will be the head, or themselves if they are the head
    };
  }

  // Scenario 2: Department was explicitly selected
  if (input.departmentId) {
    const department = await prisma.department.findUnique({
      where: { id: input.departmentId },
    });

    if (!department) {
      throw new Error('Selected department does not exist.');
    }

    const location = await prisma.location.findUnique({
      where: { id: department.locationId },
    });

    return {
      departmentId: department.id,
      departmentName: department.name,
      locationId: department.locationId,
      locationName: location?.name || 'Unknown Location',
      approverId: department.headId,
    };
  }

  throw new Error('Either hostEmployeeId or departmentId must be provided for routing.');
}
