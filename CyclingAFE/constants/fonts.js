// App will be often refering to font sizes, so it's better to hold them in one file, to easily change sth here instead of searching for font sizes in every .js file
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  BigHeader: {
    fontSize: 42,
  },
  InputText: {
    fontSize: 25,
    fontSize: 25,
    textAlign: "center",
    padding: 20,
  }
});
