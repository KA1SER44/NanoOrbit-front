const CAN_PLAN_COMMUNICATION_ROLES = new Set(["operateur", "admin"]);

export function canPlanCommunication(user) {
  return Boolean(user && CAN_PLAN_COMMUNICATION_ROLES.has(user.role));
}
