import { Button } from "../ui/button";
import { Aperture } from "lucide-react";

const navLinks = (
  <>
    <li>Home</li>
    <li>Explore Studios</li>
    <li>How it Works</li>
    <li>About Us</li>
  </>
);
const buttons = (
  <>
    {" "}
    <Button variant="outline">Login</Button>
    <Button>Register</Button>{" "}
  </>
);

const Navbar = () => {
  return (
    <div className="border-b">
      {" "}
      <div className=" container mx-auto  py-2 flex items-center justify-between ">
        <div>
          <h1 className="flex text-3xl font-bold items-center">
            Sp
            <Aperture
              size={23}
              strokeWidth={2}
              color="#F59E0B"
              className="slow-spin"
            />
            tLight
          </h1>
        </div>
        <ul className="flex gap-5">{navLinks}</ul>
        <div className="flex gap-3">{buttons}</div>
      </div>
    </div>
  );
};

export default Navbar;
