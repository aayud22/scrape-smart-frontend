import React from "react";

interface ErrorStateProps {
    title?: string;
    message: string;
}

export default function ErrorState({
    title = "Something went wrong",
    message
}: ErrorStateProps) {
    return (
        <div className="text-center text-slate-500 mt-10">{message}</div>
    );
}
