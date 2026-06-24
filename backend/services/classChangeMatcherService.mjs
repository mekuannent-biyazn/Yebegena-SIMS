import ClassChangeRequest from "../models/ClassChangeRequest.mjs";

const findMatch = async (requestId) => {
  const request = await ClassChangeRequest.findById(requestId);

  const match = await ClassChangeRequest.findOne({
    currentClass: request.desiredClass,

    desiredClass: request.currentClass,

    status: "OPEN",

    requesterStudent: {
      $ne: request.requesterStudent,
    },
  });

  if (!match) {
    return null;
  }

  request.status = "MATCHED";

  request.matchedStudent = match.requesterStudent;

  match.status = "MATCHED";

  match.matchedStudent = request.requesterStudent;

  await request.save();

  await match.save();

  return {
    request,
    match,
  };
};

export default findMatch;
