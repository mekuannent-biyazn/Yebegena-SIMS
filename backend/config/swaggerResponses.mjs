const swaggerResponses = {
  SuccessResponse: {
    type: "object",

    properties: {
      success: {
        type: "boolean",
        example: true,
      },

      message: {
        type: "string",
        example: "Operation successful",
      },
    },
  },

  ErrorResponse: {
    type: "object",

    properties: {
      success: {
        type: "boolean",
        example: false,
      },

      message: {
        type: "string",
        example: "Something went wrong",
      },
    },
  },

  UnauthorizedResponse: {
    type: "object",

    properties: {
      success: {
        type: "boolean",
        example: false,
      },

      message: {
        type: "string",
        example: "Not authorized",
      },
    },
  },
};

export default swaggerResponses;
