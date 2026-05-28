import { Button } from "flowbite-react";

export function PrimaryButton({ children, onClick, disabled, isLoading, className }) {

    return (
        <Button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`w-full text-base border-none focus:ring-4 transition-all duration-200 ${className}`}
            theme={{
                base: "group flex items-center justify-center p-2 text-center font-bold focus:z-10",
                    inner: {
                        base: "flex items-center justify-center w-full rounded-lg"
                    }
            }}
        >
            {isLoading ? (
                    <div className="flex items-center gap-2">
                        <span className="pl-3">Loading...</span>
                    </div>
                ) : (children)
            }
        </Button>
    );
}

// bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200
// !w-auto bg-[#2d3748] hover:bg-[#3d4852] text-gray-200 focus:ring-gray-500 px-6 py-1 font-medium text-sm