import ClassChangeRequest from "../models/ClassChangeRequest.mjs";
import { createNotification } from "./notificationService.mjs";

const findMatch = async (requestId) => {
  try {
    const request = await ClassChangeRequest.findById(requestId)
      .populate("requesterStudent")
      .populate("currentClass")
      .populate("desiredClass");

    if (!request) {
      console.log("Request not found:", requestId);
      return null;
    }

    // If request doesn't have a desired class, try to find any match
    let matchQuery = {
      status: "OPEN",
      requesterStudent: { $ne: request.requesterStudent._id },
    };

    if (request.desiredClass) {
      // Student wants a specific class
      matchQuery.currentClass = request.desiredClass._id;
      matchQuery.desiredClass = { $in: [request.currentClass._id, null] };
    } else {
      // Student is open to any class
      matchQuery.currentClass = { $ne: request.currentClass._id };
      // Find someone who wants this student's class or is open to any
      matchQuery.$or = [
        { desiredClass: request.currentClass._id },
        { desiredClass: null },
      ];
    }

    const match = await ClassChangeRequest.findOne(matchQuery)
      .populate("requesterStudent")
      .populate("currentClass")
      .populate("desiredClass");

    if (!match) {
      console.log("No match found for request:", requestId);
      return null;
    }

    // Update both requests
    request.status = "MATCHED";
    request.matchedStudent = match.requesterStudent._id;
    await request.save();

    match.status = "MATCHED";
    match.matchedStudent = request.requesterStudent._id;
    await match.save();

    // Notify both students
    try {
      await createNotification({
        recipient: request.requesterStudent.userId,
        recipientType: "STUDENT",
        title: "🎯 Match Found!",
        message: `A volunteer has been found for your class change request! Waiting for admin approval.`,
        type: "SUCCESS",
        createdBy: request.requesterStudent.userId,
      });

      await createNotification({
        recipient: match.requesterStudent.userId,
        recipientType: "STUDENT",
        title: "🎯 Match Found!",
        message: `You have been matched with a student for class change! Waiting for admin approval.`,
        type: "SUCCESS",
        createdBy: match.requesterStudent.userId,
      });
    } catch (notifError) {
      console.error("Failed to create match notification:", notifError);
    }

    return {
      request,
      match,
    };
  } catch (error) {
    console.error("Match service error:", error);
    return null;
  }
};

export default findMatch;
