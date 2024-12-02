import React from 'react';

interface TabsProps {
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={`flex space-x-2 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900
        border-b-2 border-transparent hover:border-gray-300 focus:outline-none
        ${className}`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
}) => {
  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};
