import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Header from "../partials/headers/Header";
import useValidation from "../hooks/useValidation";
import clienteAxios from "../axios/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignIn = () => {
  const { setAuth } = useAuth();
  const { validarInput } = useValidation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errores = validarInput(email, "email", "");
    const errores1 = validarInput(password, "", "");
    setErrorEmail(errores || "");
    setErrorPassword(errores1 || "");
    if (errores || errores1) {
      return;
    }

    try {
      const response = await clienteAxios.post("usuario/login", {
        email: email.trim(),
        password: password.trim(),
      });
      localStorage.setItem("token", response.data.token);
      setAuth(response.data);
      setEmail("");
      setPassword("");
      
    
    let redirectPath = "";
    switch(response.data.tipo_usuario) {
      case "Admin_Gnl":
        redirectPath = "/admin/registro-contrato";
        break;
      case "director":
        redirectPath = "/directivo/registro-contrato";
        break;
      case "especialista":
        redirectPath = "/especialista/registro-contrato";
        break;
      case "visitante":
        redirectPath = "/visitante/registro-contrato";
        break;
      default:
        redirectPath = "/";
    }
    
    navigate(redirectPath);
    } catch (error) {
      toast.error(error.response.data.msg);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden ">
      {/* Site header */}
      <Header />

      {/* Page content */}
      <main className="flex-grow flex items-center justify-center">
        <section className="w-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 p-5">
              {/* Page header */}
              <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
                <h1 className="h1 text-black dark:text-white">
                  Bienvenido nuevamente <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                    Tu puerta de acceso al universo de contratos
                  </span>
                </h1>
              </div>

              {/* Form */}
              <div className="max-w-sm mx-auto">
                <form noValidate onSubmit={handleSubmit}>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <label
                        className="block text-gray-800 dark:text-white text-sm font-medium mb-1"
                        htmlFor="email"
                      >
                        Correo electrónico
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="form-input w-full text-gray-800"
                        placeholder="Introduzca su dirección de correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {errorEmail && (
                      <span className="text-red-500">{errorEmail}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <div className="flex justify-between">
                        <label
                          className="block text-gray-800 dark:text-white text-sm font-medium mb-1"
                          htmlFor="password"
                        >
                          Contraseña
                        </label>
                        <Link
                          to="/auth/reset-password"
                          className="text-sm font-medium text-blue-400 hover:underline"
                        >
                          ¿Tiene problemas para iniciar sesión?
                        </Link>
                      </div>
                      <input
                        id="password"
                        type="password"
                        className="form-input w-full text-gray-800"
                        placeholder="Introduzca su contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {errorPassword && (
                      <span className="text-red-500">{errorPassword}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap -mx-3 mt-6">
                    <div className="w-full px-3">
                      <button className="btn text-white bg-blue-600 hover:bg-blue-700 w-full">
                        Iniciar sesión
                      </button>
                    </div>
                  </div>
                </form>

                <div className="text-gray-800 dark:text-white text-center mt-6">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    to="/auth/signup"
                    className="text-blue-400 hover:underline transition duration-150 ease-in-out"
                  >
                    Regístrate
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignIn;
