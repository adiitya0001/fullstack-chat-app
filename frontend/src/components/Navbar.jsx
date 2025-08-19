import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    // Add the 'navbar' class here.
    // Also simplified the background to just bg-base-100 and added opacity if desired,
    // as backdrop-blur-lg often implies some background color.
    <header className="navbar bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-opacity-80">
      {/* The 'container mx-auto px-4' can remain for width control */}
      <div className="container mx-auto px-4">
        {/* DaisyUI navbar-start, navbar-center, navbar-end provide the flex layout */}
        <div className="navbar-start">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">Chatty</h1>
          </Link>
        </div>

        {/* You had a flex container here, but DaisyUI prefers navbar-center/end for layout */}
        {/* If you don't need a center section, you can just use navbar-end */}
        <div className="navbar-end flex items-end gap-2.5"> {/* Added gap-2 here for consistency */}
          <Link
            to={"/settings"}
            className="btn btn-sm gap-2" // Simplified class names
          >
            <Settings className="w-4 h-4 " />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {authUser && (
            <>
              <Link to={"/profile"} className="btn btn-sm gap-2"> {/* Simplified class names */}
                <User className="w-4 h-4 " />
                <span className="hidden sm:inline">Profile</span>
              </Link>

              {/* For logout, you might want it as a DaisyUI button too */}
              <button className="btn btn-sm gap-2" onClick={logout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;