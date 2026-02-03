import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * Icon Component - Wrapper around FontAwesomeIcon for consistent usage
 * 
 * @param {string} icon - The icon name (e.g., "heart", "star", "user")
 * @param {string} className - Additional Tailwind classes
 * @param {...props} props - Additional props to pass to FontAwesomeIcon
 * 
 * @example
 * <Icon icon="heart" className="text-red-500" />
 * <Icon icon={["fab", "github"]} size="lg" />
 */
const Icon = ({ icon, className = "", ...props }) => {
  return <FontAwesomeIcon icon={icon} className={className} {...props} />;
};

export default Icon;
