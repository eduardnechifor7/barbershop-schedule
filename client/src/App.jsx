import { Button, Label, TextInput } from "flowbite-react";
import { AuthInput } from "../components/AuthInput.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";
import { ContinueRegister } from "../screens/ContinueRegister.jsx";
import { WelcomeScreen } from "../screens/WelcomeScreen.jsx";
import { useState } from "react";

function App() {
    const [email, setEmail] = useState("");

    const handleButton = () => {

    };

    return (
        <div className="flex flex-col gap-4 p-5 bg-dark-bg">
            <WelcomeScreen />
            {/*<ContinueRegister/>*/}
        </div>
    );
}

export default App;