import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

// Deep green bar with a gold serif title, shared by every stack navigator — this is what
// carries the "festive, premium" feel from screen to screen instead of a plain white bar.
export const festiveHeaderOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.header },
  headerTitleStyle: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.gold },
  headerTintColor: colors.textOnDark,
  headerShadowVisible: false,
};
