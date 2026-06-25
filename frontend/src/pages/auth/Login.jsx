import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../api/authApi";

import { setCredentials } from "../../features/auth/authSlice";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const Login = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await loginUser(data);

      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
        }),
      );

      toast.success("Login successful");

      if (response.user.forcePasswordChange) {
        navigate("/change-password");

        return;
      }

      switch (response.user.role) {
        case "ADMIN":
          navigate("/admin/dashboard");
          break;

        case "FRESH_TEACHER":
        case "ADVANCED_TEACHER":
          navigate("/teacher/dashboard");
          break;

        default:
          navigate("/student/dashboard");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-100
      "
    >
      <div
        className="
        bg-white
        p-8
        rounded-xl
        shadow-lg
        w-full
        max-w-md
        "
      >
        <h1
          className="
          text-3xl
          font-bold
          text-center
          mb-8
          "
        >
          Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Phone Number"
            placeholder="0912345678"
            {...register("phoneNumber", {
              required: "Phone number is required",
            })}
          />

          {errors.phoneNumber && (
            <p
              className="
              text-red-500
              text-sm
              mb-2
              "
            >
              {errors.phoneNumber.message}
            </p>
          )}

          <Input
            type="password"
            label="Password"
            placeholder="********"
            {...register("password", {
              required: "Password is required",
            })}
          />

          {errors.password && (
            <p
              className="
              text-red-500
              text-sm
              mb-4
              "
            >
              {errors.password.message}
            </p>
          )}

          <Button type="submit">Login</Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
