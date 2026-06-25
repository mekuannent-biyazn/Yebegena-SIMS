const swaggerSchemas = {
  User: {
    type: "object",
    properties: {
      _id: {
        type: "string",
      },

      fullName: {
        type: "string",
      },

      phoneNumber: {
        type: "string",
      },

      role: {
        type: "string",
      },
    },
  },

  LoginRequest: {
    type: "object",

    required: ["phoneNumber", "password"],

    properties: {
      phoneNumber: {
        type: "string",
        example: "0912345678",
      },

      password: {
        type: "string",
        example: "123456",
      },
    },
  },

  RegisterRequest: {
    type: "object",

    required: ["fullName", "phoneNumber", "password", "confirmPassword"],

    properties: {
      fullName: {
        type: "string",
        example: "Abebe Kebede",
      },

      phoneNumber: {
        type: "string",
        example: "0912345678",
      },

      password: {
        type: "string",
        example: "123456",
      },

      confirmPassword: {
        type: "string",
        example: "123456",
      },

      kflatId: {
        type: "string",
      },

      kflatRoleId: {
        type: "string",
      },
    },
  },

  Payment: {
    type: "object",

    properties: {
      _id: {
        type: "string",
      },

      amount: {
        type: "number",
      },

      status: {
        type: "string",
      },

      paymentMonth: {
        type: "string",
      },
    },
  },

  Notification: {
    type: "object",

    properties: {
      title: {
        type: "string",
      },

      message: {
        type: "string",
      },

      isRead: {
        type: "boolean",
      },
    },
  },
};

export default swaggerSchemas;
