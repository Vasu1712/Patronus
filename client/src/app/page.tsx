"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { account, ID, AppwriteError } from "./appwrite";
import Home from "./home"; // Import the Home component

interface User {
  name: string;
}

const LoginPage: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); 

  const login = async (email: string, password: string, rememberMe: boolean): Promise<void> => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get<User>();
      setLoggedInUser(user);
      setErrorMessage(null); // Clear error message on successful login
  
      // Store session token based on "Remember Me" checkbox
      const session = await account.getSession("current");
      if (rememberMe) {
        localStorage.setItem("appwriteSession", session.$id); // Save session to localStorage
      } else {
        sessionStorage.setItem("appwriteSession", session.$id); // Save session to sessionStorage
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Login failed. Please check your credentials."); // Display error message
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      const storedSession = localStorage.getItem("appwriteSession") || sessionStorage.getItem("appwriteSession");
      if (storedSession) {
        try {
          const user = await account.get<User>(); // Try to get the user info
          setLoggedInUser(user); // Set the logged-in user
        } catch (error) {
          console.error("Failed to restore session:", error);
        }
      }
    };

    restoreSession();
  }, []);
  

  const register = async (): Promise<void> => {
    try {
      await account.create(ID.unique(), email, password, name);
      setErrorMessage(null); // Clear error message if successful
    } catch (error: AppwriteError) { 
      setErrorMessage(error.message); // Capture and set error message
    }
  };

  if (loggedInUser) {
    return <Home />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-bg3 via-bg2 to-bg1">
      <div className="bg-gray-800/80 py-12 px-8 rounded-2xl shadow-lg w-1/4">
        <p className="text-4xl font-semibold mb-16 text-center block bg-[linear-gradient(6deg,_#6A49E2,_#fff_50%)] bg-clip-text text-transparent">
          Sign Up
        </p>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p> // Display error message
        )}
        <form className="space-y-6">
          <input
            type="text"
            placeholder="Enter your name here"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="w-full p-2 bg-inherit text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="email"
            placeholder="Enter your e-mail address here"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="w-full p-2 bg-inherit text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="w-full p-2 bg-inherit text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex justify-between align-items">
            <label className="text-base flex">
              <input type="checkbox" name="rememberMe" className="pl-2" />
              <p className="ml-1">Remember me</p>
            </label>
            <span className="italic font-semibold text-sm text-purple">
              Forgot password?
            </span>
          </div>
          <div className="flex flex-col justify-between gap-3">
            <button
              type="button"
              onClick={() => login(email, password, rememberMe)}
              className="bg-purple hover:bg-purple/80 text-white py-2 px-4 rounded-lg transition w-full"
            >
              Login
            </button>
            <button
              type="button"
              onClick={register}
              className="border border-purple hover:bg-white hover:text-purple hover:border border-white text-white py-2 px-4 rounded-lg transition w-full"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
