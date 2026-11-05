import { colors } from "../../theme";

export const mediaDetailStyles = {
  detailFixedHud: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    height: 52,
    left: 0,
    paddingHorizontal: 10,
    position: "absolute",
    right: 0,
    shadowColor: "#1B160A",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    top: 0,
    width: "100%",
    zIndex: 8
  },
} as const;
