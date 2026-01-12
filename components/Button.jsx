const Button = ({ children, className = "", variant = "default", size = "md", ...props }) => {
  const baseStyles = "font-medium rounded-full transition-all duration-200 cursor-pointer";
  
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    primary: "bg-gray-900 hover:bg-gray-800 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
