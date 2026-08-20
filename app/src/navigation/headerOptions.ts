import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

// Same near-black as the screen body so the header reads as part of one continuous dark
// canvas rather than a separate colored bar — carries the gold serif title across every
// stack navigator instead of each hardcoding headerTintColor.
export const festiveHeaderOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.header },
  headerTitleStyle: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.gold },
  headerTintColor: colors.gold,
  headerShadowVisible: false,
};
