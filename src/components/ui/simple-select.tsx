import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    placeholder?: string;
    className?: string;
}

interface SelectTriggerProps {
    children: React.ReactNode;
    className?: string;
}

interface SelectContentProps {
    children: React.ReactNode;
}

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
}

interface SelectValueProps {
    placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
    value,
    onValueChange,
    children,
    placeholder,
    className
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedLabel, setSelectedLabel] = React.useState('');

    React.useEffect(() => {
        // Find the selected item's label
        React.Children.forEach(children, (child) => {
            if (React.isValidElement(child) && child.type === SelectContent) {
                React.Children.forEach(child.props.children, (item) => {
                    if (React.isValidElement(item) && item.props.value === value) {
                        setSelectedLabel(item.props.children);
                    }
                });
            }
        });
    }, [value, children]);

    return (
        <div className={cn("relative", className)}>
            <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedLabel || placeholder}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                    {React.Children.map(children, (child) => {
                        if (React.isValidElement(child) && child.type === SelectContent) {
                            return React.Children.map(child.props.children, (item) => {
                                if (React.isValidElement(item) && item.type === SelectItem) {
                                    return (
                                        <div
                                            key={item.props.value}
                                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => {
                                                onValueChange(item.props.value);
                                                setIsOpen(false);
                                            }}
                                        >
                                            {item.props.children}
                                        </div>
                                    );
                                }
                                return null;
                            });
                        }
                        return null;
                    })}
                </div>
            )}
        </div>
    );
};

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className }) => {
    return <div className={className}>{children}</div>;
};

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
    return <>{children}</>;
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
    return <div data-value={value}>{children}</div>;
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
    return <span>{placeholder}</span>;
};

export {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
};
