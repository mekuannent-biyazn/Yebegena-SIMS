import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../../api/authApi";
import { getKflats, getKflatRoles } from "../../api/kflatApi";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const Register = () => {
  const navigate = useNavigate();

  const [kflats, setKflats] = useState([]);
  const [roles, setRoles] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const selectedKflat = watch("kflat");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const kflatRes = await getKflats();
      const roleRes = await getKflatRoles();

      setKflats(kflatRes.data || []);
      setRoles(roleRes.data || []);
    } catch (error) {
      toast.error("Failed to load registration data");
    }
  };

  const onSubmit = async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        return toast.error("Passwords do not match");
      }

      const payload = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,

        kflat: data.kflat === "NONE" ? null : data.kflat,

        kflatRole: data.kflat === "NONE" ? null : data.kflatRole,
      };

      const response = await registerUser(payload);

      if (response.success) {
        toast.success("Registration successful");

        reset();

        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Student Registration
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            {...register("fullName", {
              required: "Full name is required",
            })}
          />

          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName.message}</p>
          )}

          <Input
            label="Phone Number"
            placeholder="0912345678"
            {...register("phoneNumber", {
              required: "Phone number is required",

              pattern: {
                value: /^(09\d{8}|2519\d{8})$/,
                message: "Invalid Ethiopian phone number",
              },
            })}
          />

          {errors.phoneNumber && (
            <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
          )}

          <Input
            label="Password"
            type="password"
            {...register("password", {
              required: "Password is required",

              minLength: {
                value: 6,
                message: "Minimum 6 characters",
              },
            })}
          />

          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
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

          {/* Kflat */}

          <div>
            <label className="block mb-2 text-sm font-medium">Kflat</label>

            <select
              {...register("kflat")}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="NONE">None</option>

              {kflats.map((kflat) => (
                <option key={kflat._id} value={kflat._id}>
                  {kflat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kflat Role */}

          <div>
            <label className="block mb-2 text-sm font-medium">Kflat Role</label>

            <select
              disabled={selectedKflat === "NONE"}
              {...register("kflatRole")}
              className="w-full border rounded-lg px-4 py-3 disabled:bg-gray-100"
            >
              <option value="">Select Role</option>

              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.roleName}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit">Register</Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
