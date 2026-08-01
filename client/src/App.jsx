import { Button, Label, TextInput } from "flowbite-react";
import { AuthInput } from "./components/AuthInput.jsx";
import { PrimaryButton } from "./components/PrimaryButton.jsx";
import { ContinueRegister } from "./screens/ContinueRegister.jsx";
import { WelcomeScreen } from "./screens/WelcomeScreen.jsx";
import { useState } from "react";

function App() {
    return (
        <div className="min-h-screen w-full bg-dark-bg">
            <WelcomeScreen />
            {/*<ContinueRegister/>*/}
        </div>
    );
}

export default App;