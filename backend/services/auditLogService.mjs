import AuditLog from "../models/AuditLog.mjs";

export const createAuditLog = async ({
  user,
  module,
  action,
  description,
  ipAddress,
}) => {
  return await AuditLog.create({
    user,
    module,
    action,
    description,
    ipAddress,
  });
};
