import { BsMicFill } from "react-icons/bs";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/');
  };

  return (
    <div 
      onClick={handleClick}
      className="flex items-center font-comfortaa text-xl md:text-2xl font-bold text-foreground select-none tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
    >
      <span>r</span>
      <BsMicFill className="w-5.5 h-5.5md:w-7 md:h-7 text-primary" />
      <span>herz.ai</span>
    </div>
  );
};

export default Logo;
