import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../../components/others/ThemeToggle";

function Header() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setMobile(true);
      } else {
        setMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [top, setTop] = useState(true);

  // Detect whether user has scrolled the page down by 10px
  useEffect(() => {
    const scrollHandler = () => {
      window.pageYOffset > 10 ? setTop(false) : setTop(true);
    };
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [top]);

  return (
    <header
      className={`fixed w-full z-30 md:bg-opacity-90 transition duration-300 ease-in-out ${
        !top && "bg-blue-200 dark:bg-gray-800 backdrop-blur-sm shadow-lg"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20 sm:h-20">
          {/* Site branding */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex-shrink-0 mr-4">
              {/* Logo */}
              <Link
                to="/"
                className="block"
                aria-label="Cruip"
                onClick={() => window.scroll({ top: "0", behavior: "smooth" })}
              >
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <radialGradient
                      cx="21.152%"
                      cy="86.063%"
                      fx="21.152%"
                      fy="86.063%"
                      r="79.941%"
                      id="header-logo"
                    >
                      <stop stopColor="#4FD1C5" offset="0%" />
                      <stop stopColor="#81E6D9" offset="25.871%" />
                      <stop stopColor="#338CF5" offset="100%" />
                    </radialGradient>
                  </defs>
                  <rect
                    width="32"
                    height="32"
                    rx="16"
                    fill="url(#header-logo)"
                    fillRule="nonzero"
                  />
                </svg>
              </Link>
            </div>
            <Link
              to="/"
              className="text-lg font-bold text-gray-800 dark:text-gray-100 transition duration-300 ease-in-out hover:text-gray-900 dark:hover:text-gray-200"
            >
              <h2 className="bg-clip-text h3 text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                SGC
              </h2>
            </Link>
          </div>

          {/* Site navigation */}
          <nav className="flex flex-grow">
            <ul className="flex flex-grow justify-end flex-wrap items-center">
              {!mobile && (
                <>
                  <li>
                    <Link
                      to="/auth/signin"
                      className="font-medium text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                    >
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/auth/signup"
                      className="btn-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 ml-3 transition duration-150 ease-in-out"
                    >
                      <span>Registrarse</span>
                      <svg
                        className="w-3 h-3 fill-current text-white flex-shrink-0 ml-2 -mr-1"
                        viewBox="0 0 12 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z"
                          fillRule="nonzero"
                        />
                      </svg>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
