import { Button } from "flowbite-react";

export function PrimaryAuthButton({ children, onClick, disabled, isLoading }) {

    return (
        <Button
            onClick={onClick}
            disabled={disabled || isLoading}
            className="w-full bg-brand-gold enabled:hover:bg-yellow-200 text-black text-base border-none focus:ring-4 focus:ring-yellow-200 transition-all duration-200"
            theme={{
                base: "group flex items-center justify-center p-2 text-center font-bold focus:z-10",
                    inner: {
                        base: "flex items-center justify-center w-full rounded-lg"
                    }
            }}
        >
            {isLoading ? "Loading..." : children}
        </Button>
    );
};