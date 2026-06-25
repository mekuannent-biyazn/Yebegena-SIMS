import React from "react";

const Input = React.forwardRef(({ label, type = "text", ...props }, ref) => {
  return (
    <div className="mb-4">
      <label
        className="
            block
            mb-2
            text-sm
            font-medium
            text-gray-700
            "
      >
        {label}
      </label>

      <input
        ref={ref}
        type={type}
        {...props}
        className="
            w-full
            px-4
            py-3
            border
            rounded-lg
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            "
      />
    </div>
  );
});

export default Input;
