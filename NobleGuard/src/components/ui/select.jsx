// Placeholder for Select component
export const Select = ({ children, ...props }) => <select {...props}>{children}</select>;
export const SelectContent = ({ children, ...props }) => <div {...props}>{children}</div>;
export const SelectItem = ({ children, ...props }) => <option {...props}>{children}</option>;
export const SelectTrigger = ({ children, ...props }) => <button {...props}>{children}</button>;
export const SelectValue = ({ children, ...props }) => <span {...props}>{children}</span>;
