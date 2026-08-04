import { Navigate, Outlet } from "react-router-dom";


export function AdminRoute({ user }) {
    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.role !== "Admin") {
        return <Navigate to="/customer" replace />;
    }

    return (
        <div>
            <main>
                <Outlet />
            </main>
        </div>
    );
}