const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-lg p-8 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-bold text-gray-900 ${className}`}>{children}</h3>
);

export { Card, CardHeader, CardContent, CardTitle };
