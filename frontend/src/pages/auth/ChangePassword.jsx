import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { changePassword } from "../../api/authApi";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const ChangePassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        return toast.error("Passwords do not match");
      }

      const response = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success(response.message || "Password changed successfully");

      reset();

      navigate("/login");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Change Password</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            {...register("currentPassword", {
              required: "Current password is required",
            })}
          />

          {errors.currentPassword && (
            <p className="text-red-500 text-sm">
              {errors.currentPassword.message}
            </p>
          )}

          <Input
            label="New Password"
            type="password"
            {...register("newPassword", {
              required: "New password is required",

              minLength: {
                value: 6,
                message: "Minimum 6 characters",
              },
            })}
          />

          {errors.newPassword && (
            <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
          )}

          <Input
            label="Confirm Password"
            type="password"
            {...register("confirmPassword", {
              required: "Confirm password is required",
            })}
          />

          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}

          <Button type="submit">Change Password</Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
