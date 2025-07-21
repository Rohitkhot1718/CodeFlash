const positionClasses = {
  top: "bottom-full left-1/2 transform -translate-x-1/2",
  bottom: "top-full left-1/2 transform -translate-x-1/2",
  left: "right-full top-1/2 transform -translate-y-1/2",
  right: "left-full top-1/2 transform -translate-y-1/2",
};

const Tooltip = ({ children, text, position = "top", className = "" }) => {
  return (
    <div className="relative group inline-block w-full">
      {children}
      <div
        className={`absolute bg-neutral-950 font-semibold px-3 py-1 whitespace-nowrap rounded hidden group-hover:block ${className} ${positionClasses[position]}`}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
