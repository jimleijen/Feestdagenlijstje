import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

// White header matching the cream screen body, with a bold purple title — carries the same
// look across every stack navigator instead of each hardcoding headerTintColor.
export const festiveHeaderOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.header },
  headerTitleStyle: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.accent },
  headerTintColor: colors.accent,
  headerShadowVisible: false,
};
