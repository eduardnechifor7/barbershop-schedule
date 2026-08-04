import { PrimaryButton } from "../components/PrimaryButton.jsx";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { ManageUsers } from "./ManageUsers.jsx";
import { ManageBarbers } from "./ManageBarbers.jsx";
import { ManageAppointments } from "./ManageAppointments.jsx";
import { ManageServices } from "./ManageServices.jsx";
import { WelcomeScreen } from "./WelcomeScreen.jsx";
import { auth } from "../firebase.js";
import {useNavigate} from "react-router-dom";

//TODO: Add a button to navigate to Customer Home. And then in Customer Home, add a button to navigate to Admin Dashboard.

export function AdminDashboardMenu() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("Logged out");
            navigate("/");
        } catch (error) {
            console.log("Error in logging out: ", error.message);
            alert("Something went wrong, try again.");
        }
    };

    return (
        <div className="w-full min-h-screen p-8 flex flex-col justify-evenly items-center">
            <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold text-white">Management</span>
                <span className="text-3xl font-bold text-white">Dashboard</span>
            </div>
            <div className="flex flex-col justify-evenly items-center gap-10 p-2">
                {[
                    {label: "Manage users", path: "/admin/users"},
                    {label: "Manage barbers", path: "/admin/barbers"},
                    {label: "Manage appointments", path: "/admin/appointments"},
                    {label: "Manage services", path: "/admin/services"}
                ].map(({label, path}) => (
                    <PrimaryButton
                        key={path}
                        onClick={() => {
                            navigate(path);
                        }}
                        className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200"
                    >
                        {label}
                    </PrimaryButton>
                ))}
            </div>
            <div className="w-full flex justify-center mb-8">
                <PrimaryButton
                    onClick={handleLogout}
                    className="w-auto bg-[#2d3748] hover:bg-[#3d4852] text-gray-200 focus:ring-gray-500 px-6 py-1 font-medium text-sm"
                >
                    Log out
                </PrimaryButton>
            </div>
        </div>
    );
}