"use client"
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import Login from "@/components/Login";
import Signup from "@/components/Signup";
import LLMComparison from '../components/LLMComparison'
export default function Home() {
    const [user] = useAuthState(auth);
    const [isLogin, setIsLogin] = useState(true);
    if (user) {
        return (
            <div
                className="container mx-auto p-4 flex flex-col h-screen text-black"
                
            >
                <LLMComparison />
            </div>
        );
    }

    return (
        <div
            className="flex flex-col items-center justify-center h-screen bg-black text-black"
          
        >
            <div className="w-full max-w-md p-6 bg-white bg-opacity-80 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4 text-center">
                    {isLogin ? "Log In" : "Sign Up"}
                </h1>
                {isLogin ? <Login /> : <Signup />}
              
                <p className="mt-4 text-center font-medium">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-purple-800 hover:underline"
                    >
                        {isLogin ? "Sign Up" : "Log In"}
                    </button>
                </p>
            </div>
        </div>
    );

}
