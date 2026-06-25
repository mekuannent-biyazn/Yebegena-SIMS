const Button = ({ children, type = "button", disabled = false, onClick }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="
      w-full
      bg-blue-600
      hover:bg-blue-700
      text-white
      py-3
      rounded-lg
      font-medium
      transition
      duration-200
      disabled:opacity-50
      "
    >
      {children}
    </button>
  );
};

export default Button;
