export const getColorWithOpacity = (color: string, opacity: number) => {
  return `${color}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0")}`;
};
