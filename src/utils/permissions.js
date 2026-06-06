const CAN_PLAN_COMMUNICATION_ROLES = new Set(["operateur", "admin"]);
const CAN_UPDATE_SATELLITE_STATUT_ROLES = new Set(["operateur", "admin"]);
const CAN_ASSIGN_PARTICIPATION_ROLES = new Set(["responsable", "admin"]);

export function canPlanCommunication(user) {
  return Boolean(user && CAN_PLAN_COMMUNICATION_ROLES.has(user.role));
}

export function canUpdateSatelliteStatut(user) {
  return Boolean(user && CAN_UPDATE_SATELLITE_STATUT_ROLES.has(user.role));
}

export function canAssignParticipation(user) {
  return Boolean(user && CAN_ASSIGN_PARTICIPATION_ROLES.has(user.role));
}
