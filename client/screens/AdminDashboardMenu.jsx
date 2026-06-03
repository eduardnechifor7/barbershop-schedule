import { PrimaryButton } from "../components/PrimaryButton.jsx";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { ManageUsers } from "./ManageUsers.jsx";
import { ManageBarbers } from "./ManageBarbers.jsx";
import { ManageAppointments } from "./ManageAppointments.jsx";
import { WelcomeScreen } from "./WelcomeScreen.jsx";
import { auth } from "../src/firebase.js";


//TODO: LOOKUP LOGOUT FUNCTIONALTIY

export function AdminDashboardMenu() {
    const [selectMenu, setSelectMenu] = useState("initial_menu"); // 'M_users' 'M_barbers' 'M_appointments' 'M_services' 'WelcomeScreen'


    const handleButton = (menuName) => {
        setSelectMenu(menuName);
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("Logged out");
            setSelectMenu("WelcomeScreen");
        } catch (error) {
            console.log("Error in logging out: ", error.message);
            alert("Something went wrong, try again.");
        }
    };

    const renderSubMenu = () => {
        switch (selectMenu) {
            case "M_users":
                return <div className="w-full max-w-max-w-5xl mx-auto">
                    <ManageUsers />
                </div>;
            case "M_barbers":
                return <div className="w-full max-w-max-w-5xl mx-auto">
                    <ManageBarbers />
                </div>;
            case "M_appointments":
                return <div className="w-full max-w-max-w-5xl mx-auto">
                    <ManageAppointments />
                </div>;
            case "M_services":
                return <div className="w-full max-w-max-w-5xl mx-auto">M_services</div>;
            default:
                return <p>Something went wrong...</p>;
        }
    };

    if (selectMenu === "WelcomeScreen") {
        return <WelcomeScreen />;
    }

    return (
        <>
            {selectMenu === "initial_menu" ? (
                <div className="w-full min-h-screen p-8 flex flex-col justify-evenly items-center">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-3xl font-bold text-white">Management</span>
                        <span className="text-3xl font-bold text-white">Dashboard</span>
                    </div>
                    <div className="flex flex-col justify-evenly items-center gap-10 p-2">
                        <PrimaryButton onClick={() => handleButton("M_users")}
                                       className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200">Manage users</PrimaryButton>
                        <PrimaryButton onClick={() => handleButton("M_barbers")}
                                       className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200">Manage barbers</PrimaryButton>
                        <PrimaryButton onClick={() => handleButton("M_appointments")}
                                       className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200">Manage appointments</PrimaryButton>
                        <PrimaryButton onClick={() => handleButton("M_services")}
                                       className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200">Manage services</PrimaryButton>
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
            ) : (
                <div className="flex flex-col justify-center items-center bg-[#1e1e1e] min-h-screen text-white gap-4">
                    {/* Buton de întoarcere ca să poți testa la nesfârșit */}
                    <div className="w-full max-w-4xl flex justify-start mb-4">
                        <button
                            onClick={() => setSelectMenu("initial_menu")}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded text-sm font-semibold transition"
                        >
                            ← Back
                        </button>
                    </div>
                    <div className="w-full max-w-4xl flex justify-start mb-4">
                        {renderSubMenu()}
                    </div>
                </div>
            )}
        </>
    );
}