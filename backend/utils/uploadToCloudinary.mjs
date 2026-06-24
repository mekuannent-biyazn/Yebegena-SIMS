import cloudinary from "../config/cloudinary.mjs";

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "yebegena/payments",
        },

        (error, result) => {
          if (error) return reject(error);

          resolve(result);
        },
      )
      .end(buffer);
  });
};

export default uploadToCloudinary;
