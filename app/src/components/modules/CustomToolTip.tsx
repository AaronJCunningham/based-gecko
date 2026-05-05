interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

// Function to format date to "Thu, 26 Sep"
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "short",
  };
  return date.toLocaleDateString("en-US", options);
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(0, 0, 0, 0.75)",
          borderRadius: "5px",
          padding: "5px 10px",
          color: "#ffffff",
          textAlign: "center",
          fontSize: "12px",
          zIndex: 9999,
          marginBottom: "15px",
          transform: "translate(-22px, -38px)",
        }}
        className="cust-toolTip"
      >
        <span>{`${formatDate(label!)} : $${payload[0].value.toFixed(2)}`}</span>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
